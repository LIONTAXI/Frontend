import React from "react";

export default function MapPicker({
  emoji = "👤",
  type = "user",     
  selected = false,  
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
    backgroundColor: isHost ? "#444444" : "#FFFFFF", 
    border: selected
      ? "4px solid #FC7E2A"        
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
