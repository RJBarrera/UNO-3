import React from "react";
import { FaUndo, FaBan, FaPlus, FaPalette } from "react-icons/fa";
import "../App.css";

const cardColors = {
  R: "#d32f2f", // Rojo
  G: "#388e3c", // Verde
  B: "#1976d2", // Azul
  Y: "#fbc02d", // Amarillo
};

export default function Card({ card, faceUp, onClick, disabled }) {
  if (!card) return null;
  const isWild = card.startsWith("W");

  if (!faceUp) {
    return <div className="card back" onClick={disabled ? undefined : onClick} />;
  }

  const color = cardColors[card[0]];
  const value = card.slice(1);

  let content;
  if (isWild) {
    content = card === "W" ? <FaPalette /> : <><FaPlus />4</>;
  } else if (value === "Reverse") {
    content = <FaUndo />;
  } else if (value === "Skip") {
    content = <FaBan />;
  } else if (value === "Draw2") {
    content = <><FaPlus />2</>;
  } else {
    content = value;
  }

  return (
    <div
      className={`card ${isWild ? "wild" : ""}`}
      style={{
        backgroundColor: isWild ? "black" : color,
        color: isWild ? "white" : color === "#fbc02d" ? "#000" : "#fff",
        cursor: disabled ? "default" : "pointer",
      }}
      onClick={disabled ? undefined : onClick}
    >
      {content}
    </div>
  );
}
