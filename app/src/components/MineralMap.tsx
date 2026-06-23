import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { MineralProject } from "../types";
import { getMineralColor } from "../types";
import "leaflet/dist/leaflet.css";

interface MineralMapProps {
  projects: MineralProject[];
  selectedProject: MineralProject | null;
  onSelectProject: (project: MineralProject) => void;
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
  const northernOntarioCenter: [number, number] = [49.5, -84.5];

  return (
    <MapContainer
      center={northernOntarioCenter}
      zoom={5}
      className="mineral-map"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FlyToProject project={selectedProject} />
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;
        return (
          <CircleMarker
            key={project.id}
            center={[project.latitude, project.longitude]}
            radius={isSelected ? 12 : 8}
            pathOptions={{
              color: isSelected ? "#ffffff" : getMineralColor(project.primaryMineral),
              fillColor: getMineralColor(project.primaryMineral),
              fillOpacity: isSelected ? 1 : 0.8,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelectProject(project),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{project.name}</strong>
                <br />
                <span className="popup-operator">{project.operator}</span>
                <br />
                <span className="popup-mineral">{project.primaryMineral}</span>
                {" · "}
                <span className="popup-stage">{project.stage}</span>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
