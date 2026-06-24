import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";

export interface ChangeEntry {
  type: string;
  project_id: string;
  project_name: string;
  description: string;
  old_value: string | null;
  new_value: string | null;
  significance: string;
}

export interface ChangelogEntry {
  from_date: string;
  to_date: string;
  generated_at: string;
  total_changes: number;
  by_type: Record<string, number>;
  changes: ChangeEntry[];
}

interface ChangelogResponse {
  total_entries: number;
  entries: ChangelogEntry[];
}

export function useChangelog() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChangelog() {
      try {
        const response = await fetch(`${API_BASE}/api/changelog?limit=5`);
        if (response.ok) {
          const data: ChangelogResponse = await response.json();
          setEntries(data.entries);
        }
      } catch {
        // Changelog is non-critical; fail silently
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, []);

  return { entries, loading };
}
