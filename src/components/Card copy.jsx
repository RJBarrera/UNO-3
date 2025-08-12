import React from "react";
import "../App.css";

const cardColors = {
  R: "#d32f2f",
  G: "#388e3c",
  B: "#1976d2",
  Y: "#fbc02d",
};

export default function Card({ card, faceUp, onClick, disabled }) {
  if (!card) return null;

  const isWild = card.startsWith("W");

  if (!faceUp) {
    return (
      <div className="card back" onClick={disabled ? undefined : onClick} />
    );
  }

  const color = cardColors[card[0]];
  const content = card.slice(1);

  return (
    <div
      className="card"
      style={{
        backgroundColor: isWild ? "black" : color,
        color: isWild ? "white" : color === "#fbc02d" ? "#000" : "#fff",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
      }}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          onClick();
        }
      }}
    >
      {isWild ? (card === "W" ? "Cambio Color" : "+4") : content}
    </div>
  );
}
