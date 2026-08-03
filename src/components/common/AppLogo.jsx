import React from "react";

export default function AppLogo({
  size = 56,
  showText = true,
  lightText = false,
  className = "",
  style = {},
  onClick,
}) {
  const titleFontSize = `${Math.max(12, Math.round(size * 0.28))}px`;
  const subtitleFontSize = `${Math.max(9, Math.round(size * 0.14))}px`;
  const gapSize = `${Math.max(8, Math.round(size * 0.18))}px`;
  const marginTopSize = `${Math.max(1, Math.round(size * 0.03))}px`;

  const titleColor = lightText ? "#ffffff" : "#166534";
  const subtitleColor = lightText ? "rgba(255, 255, 255, 0.85)" : "#64748b";

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ gap: gapSize, ...style }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="/favicon.svg"
          alt="Logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      {showText && (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              color: titleColor,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
              fontFamily: "'Mangal', 'Devanagari Sangam MN', 'Nirmala UI', sans-serif",
              textShadow: lightText ? "0 2px 10px rgba(0,0,0,0.2)" : "none",
            }}
          >
            सर्वे भवन्तु सुखिनः
          </span>
          <span
            style={{
              fontSize: subtitleFontSize,
              color: subtitleColor,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginTop: marginTopSize,
            }}
          >
            Workforce Management
          </span>
        </div>
      )}
    </div>
  );
}
