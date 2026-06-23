import type { ProjectTimeline as TimelineType } from "../types";

interface Props {
  timeline: TimelineType;
}

export default function ProjectTimeline({ timeline }: Props) {
  return (
    <div className="project-timeline">
      <h4 className="timeline-title">Project Timeline</h4>
      <div className="timeline-track">
        {timeline.phases.map((phase, i) => (
          <div key={i} className={`timeline-phase timeline-phase--${phase.status}`}>
            <div className="timeline-phase-indicator">
              <div className="timeline-phase-dot" />
              {i < timeline.phases.length - 1 && <div className="timeline-phase-connector" />}
            </div>
            <div className="timeline-phase-content">
              <span className="timeline-phase-label">{phase.label}</span>
              {phase.date && <span className="timeline-phase-date">{phase.date}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
