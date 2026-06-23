import type { FundingRecord } from "../types";

interface Props {
  funding: FundingRecord[];
}

export default function FundingBadge({ funding }: Props) {
  const totalFunding = funding.reduce((sum, f) => sum + f.amount, 0);
  const programs = [...new Set(funding.map((f) => f.program))];

  const formatAmount = (amount: number) => {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="funding-section">
      <div className="funding-header">
        <span className="funding-icon">🏛️</span>
        <span className="funding-title">Government Funding</span>
        <span className="funding-total">{formatAmount(totalFunding)}</span>
      </div>
      <div className="funding-list">
        {funding.map((f, i) => (
          <div key={i} className="funding-item">
            <div className="funding-item-row">
              <span className="funding-program">{f.program}</span>
              {f.amount > 0 && <span className="funding-amount">{formatAmount(f.amount)}</span>}
            </div>
            <span className="funding-project-name">{f.projectName}</span>
          </div>
        ))}
      </div>
      {programs.length > 1 && (
        <div className="funding-programs">
          {programs.map((p) => (
            <span key={p} className="funding-program-tag">{p}</span>
          ))}
        </div>
      )}
    </div>
  );
}
