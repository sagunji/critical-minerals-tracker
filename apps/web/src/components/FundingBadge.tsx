import type { FundingRecord } from "../types";

interface Props {
  funding: FundingRecord[];
}

export default function FundingBadge({ funding }: Props) {
  const totalFunding = funding.reduce((sum, f) => sum + (f.amount || 0), 0);
  const programs = [...new Set(funding.map((f) => f.program))];

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="p-3 rounded-md bg-amber-50 border border-amber-100 space-y-2">
      <div className="flex items-center gap-2">
        <span>🏛️</span>
        <span className="text-sm font-semibold text-amber-800">Government Funding</span>
        <span className="ml-auto text-sm font-bold text-amber-900">{formatAmount(totalFunding)}</span>
      </div>
      <div className="space-y-1.5">
        {funding.map((f, i) => (
          <div key={i} className="text-xs">
            <div className="flex justify-between">
              <span className="font-medium text-amber-700">{f.program}</span>
              {f.amount && f.amount > 0 && (
                <span className="text-amber-900">{formatAmount(f.amount)}</span>
              )}
            </div>
            {f.purpose && <span className="text-amber-600 text-[11px]">{f.purpose}</span>}
          </div>
        ))}
      </div>
      {programs.length > 1 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {programs.map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-amber-100 text-amber-700"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
