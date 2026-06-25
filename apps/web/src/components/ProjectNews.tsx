import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface Article {
  title: string;
  url: string;
  published: string | null;
  source: string | null;
}

interface ProjectNewsProps {
  operator: string;
  projectName: string;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function ProjectNews({ operator, projectName }: ProjectNewsProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setArticles([]);

    const params = new URLSearchParams({ operator, limit: "5" });
    if (projectName) params.set("project", projectName);

    fetch(`${API_BASE}/api/news?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setArticles(data.articles || []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [operator, projectName]);

  if (loading) {
    return (
      <div className="space-y-1">
        <span className="text-[10px] uppercase tracking-wide text-text-muted">Recent News</span>
        <div className="text-[11px] text-text-muted animate-pulse">Loading...</div>
      </div>
    );
  }

  if (failed || articles.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-wide text-text-muted">Recent News</span>
      <div className="space-y-1.5">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-2.5 py-2 -mx-0.5 rounded-md hover:bg-bg-muted transition-colors group"
          >
            <div className="text-xs text-text leading-snug group-hover:text-accent transition-colors">
              {article.title}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-text-muted">
              {article.source && <span>{article.source}</span>}
              {article.source && article.published && <span>·</span>}
              {article.published && <span>{timeAgo(article.published)}</span>}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
