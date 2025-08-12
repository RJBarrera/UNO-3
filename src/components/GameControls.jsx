import React from "react";
import "../App.css";

export default function GameControls({
  onCreateRoom,
  onJoinRoom,
  onDrawCard,
  isMyTurn,
}) {
  return (
    <div className="controls">
      <div className="controlbuttons">
        <button className="btn-green" onClick={onCreateRoom}>
          Crear Sala
        </button>
        <button className="btn-blue" onClick={onJoinRoom}>
          Unirse a Sala
        </button>
      </div>
      {isMyTurn && (
        <button
          className="btn-blue"
          onClick={onDrawCard}
          style={{ marginLeft: 10 }}
        >
          📥 Tomar carta
        </button>
      )}
    </div>
  );
}
