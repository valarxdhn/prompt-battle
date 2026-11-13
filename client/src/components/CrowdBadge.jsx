// client/src/components/CrowdBadge.jsx
import React from 'react';

export default function CrowdBadge({ level = "MODERATE", occupancy = null, size = "sm" }) {
  const norm = (level || "MODERATE").toUpperCase();

  let colorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let dotColor = "bg-emerald-400";
  let label = "Low Crowd";

  if (norm.includes("EXTREME") || (occupancy && occupancy > 90)) {
    colorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    dotColor = "bg-rose-400";
    label = "Packed";
  } else if (norm.includes("HIGH") || (occupancy && occupancy >= 75)) {
    colorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    dotColor = "bg-amber-400";
    label = "Busy";
  } else if (norm.includes("MODERATE") || (occupancy && occupancy >= 45)) {
    colorClass = "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
    dotColor = "bg-yellow-300";
    label = "Moderate";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
      {occupancy !== null && (
        <span className="opacity-75 font-mono">({occupancy}%)</span>
      )}
    </span>
  );
}
