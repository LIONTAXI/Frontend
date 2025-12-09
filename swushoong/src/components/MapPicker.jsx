// src/components/MapPicker.jsx
import React from "react";

export default function MapPicker({
  emoji = "👤",
  type = "user",      // 'user' | 'host'
  selected = false,   // 선택된 총대 픽커일 때 true
}) {
  const isHost = type === "host";

  const size = 40;

  const wrapperStyle = {
    width: size,
    height: size,
    borderRadius: "50%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // 👉 색/테두리 규칙
    backgroundColor: isHost ? "#444444" : "#FFFFFF", // 총대 = 회색, 일반 = 흰색
    border: selected
      ? "4px solid #FC7E2A"         // 선택된 총대
      : isHost
      ? "none"                      // 일반 총대
      : "1px solid #D6D6D6",        // 일반 사용자
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
  };

  const textStyle = {
    fontSize: 16,
    fontFamily: "'NanumSquare Neo', system-ui, -apple-system, sans-serif",
    fontWeight: 700,
    color: "#222222",
    lineHeight: 1,
  };

  return (
    <div style={wrapperStyle}>
      <span style={textStyle}>{emoji}</span>
    </div>
  );
}
