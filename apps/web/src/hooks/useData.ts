import { useState, useEffect } from "react";
import type { MineralProject } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "";

export function useData() {
  const [projects, setProjects] = useState<MineralProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE}/api/projects`);

        if (!response.ok) {
          throw new Error(`Failed to load projects: ${response.status}`);
        }

        const data: MineralProject[] = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { projects, loading, error };
}
