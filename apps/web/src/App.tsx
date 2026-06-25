import { useState, useMemo, useEffect, useCallback } from "react";
import MineralMap from "./components/MineralMap";
import FilterPanel from "./components/FilterPanel";
import ProjectDetail from "./components/ProjectDetail";
import StatsBubble from "./components/StatsBubble";
import NewsPopover from "./components/NewsPopover";
import ComparePanel from "./components/ComparePanel";
import PriceTicker from "./components/PriceTicker";
import { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";

import { useData } from "./hooks/useData";
import { usePrices } from "./hooks/usePrices";
import type { MineralProject } from "./types";

const MAX_COMPARE = 4;

function App() {
  const { projects, loading, error } = useData();
  const { data: priceData } = usePrices();
  const [selectedProject, setSelectedProject] = useState<MineralProject | null>(null);
  const [selectedMinerals, setSelectedMinerals] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedOperator, setSelectedOperator] = useState("All Operators");
  const [showFundedOnly, setShowFundedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newsOpen, setNewsOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    if (projects.length === 0) return;
    const params = new URLSearchParams(window.location.search);

    const compareParam = params.get("compare");
    if (compareParam) {
      const ids = compareParam.split(",").filter((id) => projects.some((p) => p.id === id));
      if (ids.length >= 2) {
        setCompareIds(ids.slice(0, MAX_COMPARE));
        setCompareOpen(true);
        return;
      }
    }

    const projectId = params.get("project");
    if (projectId) {
      const found = projects.find((p) => p.id === projectId);
      if (found) setSelectedProject(found);
    }
  }, [projects]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (compareOpen && compareIds.length >= 2) {
      url.searchParams.delete("project");
      url.searchParams.set("compare", compareIds.join(","));
    } else if (selectedProject) {
      url.searchParams.delete("compare");
      url.searchParams.set("project", selectedProject.id);
    } else {
      url.searchParams.delete("project");
      url.searchParams.delete("compare");
    }
    window.history.replaceState({}, "", url.toString());
  }, [selectedProject, compareIds, compareOpen]);

  const compareProjects = useMemo(
    () => compareIds.map((id) => projects.find((p) => p.id === id)).filter(Boolean) as MineralProject[],
    [compareIds, projects]
  );

  const toggleCompare = useCallback((projectId: string) => {
    setCompareIds((prev) => {
      if (prev.includes(projectId)) return prev.filter((id) => id !== projectId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, projectId];
    });
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (selectedMinerals.length > 0) {
        const hasMineral = selectedMinerals.some(
          (mineral) =>
            project.primaryMineral.toLowerCase().includes(mineral.toLowerCase()) ||
            project.minerals.some((m) => m.toLowerCase().includes(mineral.toLowerCase()))
        );
        if (!hasMineral) return false;
      }

      if (selectedStage !== "All Stages") {
        if (project.stage !== selectedStage) return false;
      }

      if (selectedProvince !== "All Provinces") {
        if (project.province !== selectedProvince) return false;
      }

      if (selectedRegion !== "All Regions") {
        if (project.region !== selectedRegion) return false;
      }

      if (selectedOperator !== "All Operators") {
        if (project.operator !== selectedOperator) return false;
      }

      if (showFundedOnly) {
        if (!project.funding || project.funding.length === 0) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          project.name.toLowerCase().includes(query) ||
          project.operator.toLowerCase().includes(query) ||
          project.region.toLowerCase().includes(query) ||
          project.minerals.some((m) => m.toLowerCase().includes(query));
        if (!matches) return false;
      }

      return true;
    });
  }, [projects, selectedMinerals, selectedStage, selectedProvince, selectedRegion, selectedOperator, showFundedOnly, searchQuery]);

  const handleMineralToggle = (mineral: string) => {
    setSelectedMinerals((prev) =>
      prev.includes(mineral) ? prev.filter((m) => m !== mineral) : [...prev, mineral]
    );
  };

  const handleReset = () => {
    setSelectedMinerals([]);
    setSelectedStage("All Stages");
    setSelectedProvince("All Provinces");
    setSelectedRegion("All Regions");
    setSelectedOperator("All Operators");
    setShowFundedOnly(false);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin" />
        <p className="text-text-muted">Loading Critical Minerals Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="font-display text-xl text-text">Error Loading Data</h2>
        <p className="text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-bg-card flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-lg font-normal flex items-center gap-2 text-accent">
            <span className="text-xl">⛏️</span>
            Critical Minerals Tracker
          </h1>
          <span className="text-xs text-text-muted px-2 py-0.5 bg-bg-muted rounded-full">
            Canada
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <Popover open={newsOpen} onOpenChange={setNewsOpen}>
            <PopoverTrigger asChild>
              <button className={`px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${newsOpen ? "bg-accent text-white" : "text-text-muted hover:text-text hover:bg-bg-muted"}`}>
                News
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-auto p-0 overflow-hidden">
              <NewsPopover
                onProjectClick={(id) => {
                  const found = projects.find((p) => p.id === id);
                  if (found) {
                    setSelectedProject(found);
                    setNewsOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </nav>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-72 border-r border-border bg-bg-card overflow-y-auto flex-shrink-0">
          <FilterPanel
            projects={projects}
            selectedMinerals={selectedMinerals}
            selectedStage={selectedStage}
            selectedProvince={selectedProvince}
            selectedRegion={selectedRegion}
            selectedOperator={selectedOperator}
            showFundedOnly={showFundedOnly}
            searchQuery={searchQuery}
            onMineralToggle={handleMineralToggle}
            onStageChange={setSelectedStage}
            onProvinceChange={setSelectedProvince}
            onRegionChange={setSelectedRegion}
            onOperatorChange={setSelectedOperator}
            onFundedToggle={() => setShowFundedOnly((v) => !v)}
            onSearchChange={setSearchQuery}
            onReset={handleReset}
            projectCount={filteredProjects.length}
            totalCount={projects.length}
          />
        </aside>

        <section className="flex-1 relative">
          <MineralMap
            projects={filteredProjects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
          />
          <StatsBubble projects={filteredProjects} />
          {priceData && <PriceTicker data={priceData} />}

          {compareIds.length > 0 && (
            <button
              onClick={() => setCompareOpen(true)}
              className="absolute bottom-4 right-4 z-[500] flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg shadow-lg hover:bg-accent-hover transition-colors"
            >
              Compare
              <span className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs font-bold">
                {compareIds.length}
              </span>
            </button>
          )}
        </section>

        {selectedProject && (
          <aside className="w-96 border-l border-border bg-bg-card overflow-y-auto flex-shrink-0">
            <ProjectDetail
              project={selectedProject}
              onClose={() => setSelectedProject(null)}
              isInCompare={compareIds.includes(selectedProject.id)}
              onToggleCompare={() => toggleCompare(selectedProject.id)}
              compareCount={compareIds.length}
              maxCompare={MAX_COMPARE}
            />
          </aside>
        )}
      </main>

      {compareOpen && compareProjects.length >= 2 && (
        <ComparePanel
          projects={compareProjects}
          onRemove={(id) => {
            const next = compareIds.filter((cid) => cid !== id);
            setCompareIds(next);
            if (next.length < 2) setCompareOpen(false);
          }}
          onClose={() => setCompareOpen(false)}
          onSelectProject={(p) => {
            setSelectedProject(p);
            setCompareOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
