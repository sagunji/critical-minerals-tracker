import { useState, useMemo, useEffect } from "react";
import MineralMap from "./components/MineralMap";
import FilterPanel from "./components/FilterPanel";
import ProjectDetail from "./components/ProjectDetail";
import Dashboard from "./components/Dashboard";
import NewsPopover from "./components/NewsPopover";
import { Popover, PopoverTrigger, PopoverContent } from "./components/ui/popover";

import { useData } from "./hooks/useData";
import type { MineralProject } from "./types";

type View = "map" | "dashboard";

function App() {
  const { projects, loading, error } = useData();
  const [selectedProject, setSelectedProject] = useState<MineralProject | null>(null);
  const [selectedMinerals, setSelectedMinerals] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedProvince, setSelectedProvince] = useState("All Provinces");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedOperator, setSelectedOperator] = useState("All Operators");
  const [showFundedOnly, setShowFundedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<View>("map");
  const [newsOpen, setNewsOpen] = useState(false);

  useEffect(() => {
    if (projects.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    if (projectId) {
      const found = projects.find((p) => p.id === projectId);
      if (found) {
        setSelectedProject(found);
        setActiveView("map");
      }
    }
  }, [projects]);

  useEffect(() => {
    if (selectedProject) {
      const url = new URL(window.location.href);
      url.searchParams.set("project", selectedProject.id);
      window.history.replaceState({}, "", url.toString());
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url.toString());
    }
  }, [selectedProject]);

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

  const navBtnClass = (active: boolean) =>
    `px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${
      active
        ? "bg-accent text-white"
        : "text-text-muted hover:text-text hover:bg-bg-muted"
    }`;

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
          <span className="text-sm text-text-muted px-2.5 py-0.5 bg-bg-muted rounded-full">
            Canada
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            className={navBtnClass(activeView === "map")}
            onClick={() => setActiveView("map")}
          >
            Map
          </button>
          <button
            className={navBtnClass(activeView === "dashboard")}
            onClick={() => setActiveView("dashboard")}
          >
            Stats
          </button>
          <Popover open={newsOpen} onOpenChange={setNewsOpen}>
            <PopoverTrigger asChild>
              <button className={navBtnClass(newsOpen)}>News</button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={8} className="w-auto p-0 overflow-hidden">
              <NewsPopover
                onProjectClick={(id) => {
                  const found = projects.find((p) => p.id === id);
                  if (found) {
                    setSelectedProject(found);
                    setActiveView("map");
                    setNewsOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </nav>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {activeView === "dashboard" ? (
          <Dashboard projects={projects} />
        ) : (
          <>
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
              />
            </section>

            {selectedProject && (
              <aside className="w-96 border-l border-border bg-bg-card overflow-y-auto flex-shrink-0">
                <ProjectDetail
                  project={selectedProject}
                  onClose={() => setSelectedProject(null)}
                />
              </aside>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
