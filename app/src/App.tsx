import { useState, useMemo, useEffect } from "react";
import MineralMap from "./components/MineralMap";
import FilterPanel from "./components/FilterPanel";
import ProjectDetail from "./components/ProjectDetail";
import Dashboard from "./components/Dashboard";
import BottleneckAnalysis from "./components/BottleneckAnalysis";
import WhatIfSimulation from "./components/WhatIfSimulation";
import { useData } from "./hooks/useData";
import type { MineralProject } from "./types";
import "./App.css";

type View = "map" | "bottlenecks" | "simulation" | "dashboard";

function App() {
  const { projects, supplyChains, loading, error } = useData();
  const [selectedProject, setSelectedProject] = useState<MineralProject | null>(null);
  const [selectedMinerals, setSelectedMinerals] = useState<string[]>([]);
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedOperator, setSelectedOperator] = useState("All Operators");
  const [showFundedOnly, setShowFundedOnly] = useState(false);
  const [showSupplyChainOnly, setShowSupplyChainOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<View>("bottlenecks");

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

      if (selectedRegion !== "All Regions") {
        if (project.region !== selectedRegion) return false;
      }

      if (selectedOperator !== "All Operators") {
        if (project.operator !== selectedOperator) return false;
      }

      if (showFundedOnly) {
        if (!project.funding || project.funding.length === 0) return false;
      }

      if (showSupplyChainOnly) {
        if (!project.supplyChainId) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          project.name.toLowerCase().includes(query) ||
          project.operator.toLowerCase().includes(query) ||
          project.region.toLowerCase().includes(query) ||
          project.district.toLowerCase().includes(query) ||
          project.minerals.some((m) => m.toLowerCase().includes(query));
        if (!matches) return false;
      }

      return true;
    });
  }, [projects, selectedMinerals, selectedStage, selectedRegion, selectedOperator, showFundedOnly, showSupplyChainOnly, searchQuery]);

  const handleMineralToggle = (mineral: string) => {
    setSelectedMinerals((prev) =>
      prev.includes(mineral) ? prev.filter((m) => m !== mineral) : [...prev, mineral]
    );
  };

  const handleReset = () => {
    setSelectedMinerals([]);
    setSelectedStage("All Stages");
    setSelectedRegion("All Regions");
    setSelectedOperator("All Operators");
    setShowFundedOnly(false);
    setShowSupplyChainOnly(false);
    setSearchQuery("");
  };

  const selectedSupplyChain = selectedProject?.supplyChainId
    ? supplyChains.find((sc) => sc.id === selectedProject.supplyChainId) ?? null
    : null;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading Critical Minerals Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>
            <span className="header-icon">⛏️</span>
            Critical Minerals Tracker
          </h1>
          <span className="header-subtitle">Northern Ontario</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-btn ${activeView === "bottlenecks" ? "active" : ""}`}
            onClick={() => setActiveView("bottlenecks")}
          >
            Bottlenecks
          </button>
          <button
            className={`nav-btn ${activeView === "simulation" ? "active" : ""}`}
            onClick={() => setActiveView("simulation")}
          >
            What-If
          </button>
          <button
            className={`nav-btn ${activeView === "map" ? "active" : ""}`}
            onClick={() => setActiveView("map")}
          >
            Map
          </button>
          <button
            className={`nav-btn ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            Stats & Investment
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeView === "bottlenecks" ? (
          <div className="analysis-view">
            <BottleneckAnalysis projects={projects} />
          </div>
        ) : activeView === "simulation" ? (
          <div className="analysis-view">
            <WhatIfSimulation />
          </div>
        ) : activeView === "dashboard" ? (
          <Dashboard projects={projects} />
        ) : (
          <>
            <aside className="sidebar">
              <FilterPanel
                projects={projects}
                selectedMinerals={selectedMinerals}
                selectedStage={selectedStage}
                selectedRegion={selectedRegion}
                selectedOperator={selectedOperator}
                showFundedOnly={showFundedOnly}
                showSupplyChainOnly={showSupplyChainOnly}
                searchQuery={searchQuery}
                onMineralToggle={handleMineralToggle}
                onStageChange={setSelectedStage}
                onRegionChange={setSelectedRegion}
                onOperatorChange={setSelectedOperator}
                onFundedToggle={() => setShowFundedOnly((v) => !v)}
                onSupplyChainToggle={() => setShowSupplyChainOnly((v) => !v)}
                onSearchChange={setSearchQuery}
                onReset={handleReset}
                projectCount={filteredProjects.length}
                totalCount={projects.length}
              />
            </aside>

            <section className="map-section">
              <MineralMap
                projects={filteredProjects}
                selectedProject={selectedProject}
                onSelectProject={setSelectedProject}
              />
            </section>

            {selectedProject && (
              <aside className="detail-sidebar">
                <ProjectDetail
                  project={selectedProject}
                  supplyChain={selectedSupplyChain}
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
