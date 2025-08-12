import React from "react";
import "../App.css";
import Card from "./Card.jsx";

export default function CenterCard({ currentCard, players, turnIndex, myId }) {
  return (
    <div className="center-card mesa">
      <h3>Carta en juego</h3>
      {currentCard ? (
        <Card card={currentCard} faceUp={true} disabled={true} />
      ) : (
        <p>No hay carta base aún</p>
      )}
      <p>
        Turno:{" "}
        {players[turnIndex] === myId ? (
          <strong style={{ color: "#4CAF50" }}>Tu turno</strong>
        ) : (
          `Jugador ${players[turnIndex]?.slice(0, 5)}`
        )}
      </p>
    </div>
  );
}
