import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface MetalPrice {
  display_name: string;
  symbol: string;
  tracker_mineral: string;
  price_usd: number;
  price_cad: number;
  unit: string;
  unit_usd: string;
  exchange: string;
  change_pct: number;
  price_timestamp: string;
}

export interface PriceData {
  metadata: {
    source: string;
    fx_source: string;
    usd_cad_rate: number;
    last_updated: string;
    metals_count: number;
  };
  prices: Record<string, MetalPrice>;
  unpriced_minerals: { display_name: string; reason: string }[];
}

export function usePrices() {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE}/api/prices`);
        if (!response.ok) return;
        const json = await response.json();
        if (json.error) return;
        setData(json);
      } catch {
        // non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading };
}
