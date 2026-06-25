import { useState } from "react";
import type { PriceData, MetalPrice } from "../hooks/usePrices";
import { MINERAL_COLORS } from "../types";

interface PriceTickerProps {
  data: PriceData;
}

function formatPrice(price: number, unit: string): string {
  if (unit.includes("oz")) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function TrendArrow({ change }: { change: number }) {
  if (Math.abs(change) < 0.05) {
    return <span className="text-text-muted text-[10px]">→</span>;
  }
  if (change > 0) {
    return <span className="text-green-600 text-[10px]">▲</span>;
  }
  return <span className="text-red-600 text-[10px]">▼</span>;
}

function PriceRow({ metal }: { metal: MetalPrice }) {
  const color = MINERAL_COLORS[metal.tracker_mineral] || MINERAL_COLORS.Other;
  const changeColor =
    Math.abs(metal.change_pct) < 0.05
      ? "text-text-muted"
      : metal.change_pct > 0
        ? "text-green-700"
        : "text-red-700";

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-bg-muted/50 rounded-md transition-colors">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text">{metal.display_name}</span>
          <span className="text-xs font-semibold text-text tabular-nums">
            {formatPrice(metal.price_cad, metal.unit)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[10px] text-text-muted">{metal.exchange}</span>
          <div className="flex items-center gap-1">
            <TrendArrow change={metal.change_pct} />
            <span className={`text-[10px] font-medium tabular-nums ${changeColor}`}>
              {metal.change_pct > 0 ? "+" : ""}{metal.change_pct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PriceTicker({ data }: PriceTickerProps) {
  const [expanded, setExpanded] = useState(false);

  const metals = Object.values(data.prices);
  if (metals.length === 0) return null;

  const lastUpdated = new Date(data.metadata.last_updated);
  const formattedDate = lastUpdated.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="absolute bottom-4 left-[22rem] z-[500] bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-text shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
      >
        <span className="text-base">📈</span>
        <div className="flex items-center gap-2">
          {metals.slice(0, 3).map((m) => (
            <div key={m.symbol} className="flex items-center gap-1">
              <span className="font-medium">{m.symbol}</span>
              <TrendArrow change={m.change_pct} />
            </div>
          ))}
          {metals.length > 3 && (
            <span className="text-text-muted">+{metals.length - 3}</span>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-[22rem] z-[500] w-64 bg-bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📈</span>
          <span className="text-xs font-semibold text-text">Spot Prices</span>
          <span className="text-[9px] text-text-muted px-1.5 py-0.5 bg-bg-muted rounded-full">CAD</span>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-text-muted hover:text-text text-sm leading-none p-0.5"
        >
          ×
        </button>
      </div>

      <div className="py-1">
        {metals.map((metal) => (
          <PriceRow key={metal.symbol} metal={metal} />
        ))}
      </div>

      {data.unpriced_minerals && data.unpriced_minerals.length > 0 && (
        <div className="px-3 py-2 border-t border-border/50">
          <div className="text-[9px] text-text-muted">
            <span className="font-medium">No spot price: </span>
            {data.unpriced_minerals.map((m) => m.display_name).join(", ")}
          </div>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-border bg-bg-muted/50">
        <div className="text-[9px] text-text-muted leading-relaxed">
          Per metric ton · {data.metadata.source.split("—")[0].trim()} · USD/CAD {data.metadata.usd_cad_rate.toFixed(4)} via Bank of Canada · {formattedDate}
        </div>
      </div>
    </div>
  );
}
