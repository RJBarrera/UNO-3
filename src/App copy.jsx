import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./App.css"; // Aquí los estilos que pondremos abajo

const socket = io("http://localhost:3000");

// Colores para cartas UNO
const cardColors = {
  R: "#d32f2f",
  G: "#388e3c",
  B: "#1976d2",
  Y: "#fbc02d",
};

// Componente para una carta
function Card({ card, faceUp, onClick, disabled }) {
  if (!card) return null;

  const isWild = card.startsWith("W"); // comodines

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

// Componente jugador con cartas
function Player({ playerId, isMe, cards, position, onPlayCard, isMyTurn }) {
  return (
    <div className={`player player-${position}`}>
      <div className="player-name">{isMe ? "Tú" : playerId.slice(0, 5)}</div>
      <div className="cards">
        {cards.map((card, i) => (
          <Card
            key={i}
            card={card}
            faceUp={isMe}
            disabled={!isMyTurn}
            onClick={() => isMe && isMyTurn && onPlayCard(card)}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [players, setPlayers] = useState([]);
  const [myId, setMyId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [hands, setHands] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [turnIndex, setTurnIndex] = useState(0);

  // SweetAlert configuración base
  const swalBase = Swal.mixin({
    background: "#1e1e2f",
    color: "#fff",
    confirmButtonColor: "#4CAF50",
    cancelButtonColor: "#d33",
    customClass: {
      popup: "animated fadeInDown faster",
      title: "swal-title",
      confirmButton: "swal-confirm",
    },
    showClass: {
      popup: "animate__animated animate__zoomIn animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut animate__faster",
    },
  });

  useEffect(() => {
    socket.on("connect", () => setMyId(socket.id));

    socket.on("roomCreated", (id) => {
      setRoomId(id);
      swalBase.fire({
        title: "🎉 Sala creada",
        html: `<strong>Código:</strong> <span style="font-size:1.5em; color:#4CAF50;">${id}</span>`,
        icon: "success",
        confirmButtonText: "¡Listo!",
      });
    });

    socket.on("playerList", ({ players, roomId }) => {
      setPlayers(players);
      setRoomId(roomId);
    });

    socket.on("gameStarted", (gameState) => {
      setGameStarted(true);
      setHands(gameState.hands);
      setCurrentCard(gameState.currentCard);
      setTurnIndex(gameState.turnIndex);
      swalBase.fire({
        title: "🚀 ¡La partida ha comenzado!",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
    });

    socket.on("gameStateUpdate", (gameState) => {
      setHands(gameState.hands);
      setCurrentCard(gameState.currentCard);
      setTurnIndex(gameState.turnIndex);
    });

    socket.on("errorMessage", (msg) => {
      swalBase.fire({
        title: "⚠️ Error",
        text: msg,
        icon: "error",
      });
    });

    return () => {
      socket.off("connect");
      socket.off("roomCreated");
      socket.off("playerList");
      socket.off("gameStarted");
      socket.off("gameStateUpdate");
      socket.off("errorMessage");
    };
  }, []);

  // Buscar posición relativa del jugador local para colocar jugadores
  const myPos = players.findIndex((p) => p === myId);

  const getPlayerPosition = (index) => {
    const pos = (index - myPos + players.length) % players.length;
    // 0 = abajo (tú), 1 = izquierda, 2 = arriba, 3 = derecha
    return pos;
  };

  // Emitir jugada
  const playCard = (card) => {
    console.log("Carta seleccionada para jugar:", card);
    if (!roomId) return;
    if (players[turnIndex] !== myId) {
      swalBase.fire("No es tu turno", "", "warning");
      return;
    }
    socket.emit("playCard", { roomId, card });
  };

  // Crear sala
  const createRoom = () => {
    socket.emit("createRoom");
  };

  // Unirse sala con prompt SweetAlert
  const joinRoom = async () => {
    const { value: id } = await swalBase.fire({
      title: "🔑 Unirse a una sala",
      input: "text",
      inputLabel: "Ingresa el código de la sala",
      inputPlaceholder: "Ej: ABC123",
      confirmButtonText: "Unirme",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Debes escribir un código";
        if (value.trim().length < 3)
          return "El código debe tener al menos 3 caracteres";
      },
    });
    if (id) {
      socket.emit("joinRoom", id.trim().toUpperCase());
    }
  };

  return (
    <>
      <h1 className="titulo" style={{ color: "#4CAF50", textAlign: "center" }}>
        🎴 Juego de Cartas Online
      </h1>
      <div className="game-container">
        {!gameStarted && (
          <div className="controls">
            <button className="btn-green" onClick={createRoom}>
              Crear Sala
            </button>
            <button className="btn-blue" onClick={joinRoom}>
              Unirse a Sala
            </button>
          </div>
        )}

        {roomId && (
          <p className="center-text">
            <strong>Sala:</strong> {roomId}
          </p>
        )}

        <div className="players-container">
          {players.map((playerId, idx) => (
            <Player
              key={playerId}
              playerId={playerId}
              isMe={playerId === myId}
              cards={hands[playerId] || []}
              position={getPlayerPosition(idx)}
              onPlayCard={playCard}
              isMyTurn={turnIndex === idx}
            />
          ))}
        </div>

        {gameStarted && (
          <div className="center-card">
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
        )}
      </div>
    </>
  );
}

export default App;
