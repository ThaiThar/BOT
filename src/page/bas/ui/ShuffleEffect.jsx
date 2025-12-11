// src/components/Bas/ui/ShuffleEffect.jsx
import React from "react";

import "../end1/functions/HinduGodMode.css";
export default function ShuffleEffect({ isShuffling }) {
  if (!isShuffling) return null;

  return (
    <div className="hindu-wrapper">
      <div className="hindu-container">
        <div className="stack source-stack"></div>
        <div className="stack target-stack">
          <div className="shockwave s1"></div>
          <div className="shockwave s2"></div>
          <div className="shockwave s3"></div>
        </div>
        <div className="packet p1"><div className="trail"></div></div>
        <div className="packet p2"><div className="trail"></div></div>
        <div className="packet p3"><div className="trail"></div></div>
      </div>
      <div style={{ color: "#888", marginTop: 10, letterSpacing: "2px" }}>
        CHANNELING ENERGY...
      </div>
    </div>
  );
}