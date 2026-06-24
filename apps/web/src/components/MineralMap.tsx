import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import type { MineralProject } from "../types";
import { getMineralColor } from "../types";
import "leaflet/dist/leaflet.css";

interface MineralMapProps {
  projects: MineralProject[];
  selectedProject: MineralProject | null;
  onSelectProject: (project: MineralProject) => void;
}

function createPinIcon(color: string) {
  const svg = `
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="${color}"/>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="none" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "selected-pin-icon",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  });
}

function FlyToProject({ project }: { project: MineralProject | null }) {
  const map = useMap();
  useEffect(() => {
    if (project) {
      map.flyTo([project.latitude, project.longitude], 9, { duration: 1.2 });
    }
  }, [project, map]);
  return null;
}

export default function MineralMap({ projects, selectedProject, onSelectProject }: MineralMapProps) {
  const canadaCenter: [number, number] = [56.0, -96.0];

  const pinIcon = useMemo(() => {
    if (!selectedProject) return null;
    return createPinIcon(getMineralColor(selectedProject.primaryMineral));
  }, [selectedProject]);

  return (
    <MapContainer
      center={canadaCenter}
      zoom={4}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToProject project={selectedProject} />
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;
        return (
          <CircleMarker
            key={project.id}
            center={[project.latitude, project.longitude]}
            radius={isSelected ? 10 : 8}
            pathOptions={{
              color: isSelected ? "#ffffff" : getMineralColor(project.primaryMineral),
              fillColor: getMineralColor(project.primaryMineral),
              fillOpacity: isSelected ? 1 : 0.8,
              weight: isSelected ? 2 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelectProject(project),
            }}
          >
            <Popup>
              <div className="text-xs leading-relaxed">
                <strong className="text-sm">{project.name}</strong>
                <br />
                <span className="text-text-muted">{project.operator}</span>
                <br />
                <span className="font-medium">{project.primaryMineral}</span>
                {" · "}
                <span className="text-text-muted">{project.stage}</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      {selectedProject && pinIcon && (
        <Marker
          position={[selectedProject.latitude, selectedProject.longitude]}
          icon={pinIcon}
          zIndexOffset={1000}
        />
      )}
    </MapContainer>
  );
}
