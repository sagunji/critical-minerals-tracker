import { useState, useEffect } from "react";
import type { MineralProject, SupplyChain, FundingRecord, ProjectTimeline } from "../types";

interface FundingRaw {
  operator: string;
  projectName: string;
  amount: number;
  program: string;
  intake: number;
}

export function useData() {
  const [projects, setProjects] = useState<MineralProject[]>([]);
  const [supplyChains, setSupplyChains] = useState<SupplyChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [mineralsRes, supplyRes, fundingRes, timelinesRes] = await Promise.all([
          fetch("/data/minerals.json"),
          fetch("/data/supplychain.json"),
          fetch("/data/funding.json"),
          fetch("/data/timelines.json"),
        ]);

        if (!mineralsRes.ok || !supplyRes.ok) {
          throw new Error("Failed to load data files");
        }

        const minerals: MineralProject[] = await mineralsRes.json();
        const supply: SupplyChain[] = await supplyRes.json();
        const fundingData: FundingRaw[] = fundingRes.ok ? await fundingRes.json() : [];
        const timelinesData: Record<string, ProjectTimeline> = timelinesRes.ok ? await timelinesRes.json() : {};

        // Cross-reference funding with projects
        const enriched = minerals.map((project) => {
          const matchedFunding = fundingData.filter((f) =>
            project.operator.toLowerCase().includes(f.operator.toLowerCase()) ||
            f.operator.toLowerCase().includes(project.operator.split(" ")[0].toLowerCase())
          );

          const funding: FundingRecord[] = matchedFunding.map((f) => ({
            program: f.program,
            amount: f.amount,
            projectName: f.projectName,
            intake: f.intake,
          }));

          const timeline = timelinesData[project.id] || undefined;

          return {
            ...project,
            ...(funding.length > 0 ? { funding } : {}),
            ...(timeline ? { timeline } : {}),
          };
        });

        setProjects(enriched);
        setSupplyChains(supply);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { projects, supplyChains, loading, error };
}
