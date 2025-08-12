import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "./App.css";

import GameControls from "./components/GameControls.jsx";
import PlayerList from "./components/PlayerList.jsx";
import CenterCard from "./components/CenterCard.jsx";

const socket = io(import.meta.env.VITE_SERVER_URL);

function App() {
  const [players, setPlayers] = useState([]);
  const [myId, setMyId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [hands, setHands] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [turnIndex, setTurnIndex] = useState(0);

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

    socket.on("cardDrawn", (newHand) => {
      setHands((prevHands) => ({
        ...prevHands,
        [myId]: newHand,
      }));
      swalBase.fire({
        title: "📥 Carta tomada",
        icon: "success",
        timer: 1000,
        showConfirmButton: false,
      });
    });

    return () => {
      socket.off("connect");
      socket.off("roomCreated");
      socket.off("playerList");
      socket.off("gameStarted");
      socket.off("gameStateUpdate");
      socket.off("errorMessage");
      socket.off("cardDrawn");
    };
  }, []);

  const playCard = (card) => {
    if (!roomId) return;
    if (players[turnIndex] !== myId) {
      swalBase.fire("No es tu turno", "", "warning");
      return;
    }
    socket.emit("playCard", { roomId, card });
  };

  const drawCard = () => {
    if (!roomId) return;
    if (players[turnIndex] !== myId) {
      swalBase.fire("No es tu turno", "", "warning");
      return;
    }
    socket.emit("drawCard", { roomId });
  };

  // Función para validar si hay cartas válidas para jugar
  const canPlayAnyCard = (hand, currentCard) => {
    if (!hand || hand.length === 0 || !currentCard) return false;

    const WILD_CARDS = ["Wild", "WildDraw4"];

    for (const card of hand) {
      if (WILD_CARDS.includes(card)) return true;

      if (WILD_CARDS.includes(currentCard)) return true;

      const cardColor = card[0];
      const cardValue = card.slice(1);
      const currentColor = currentCard[0];
      const currentValue = currentCard.slice(1);

      if (cardColor === currentColor || cardValue === currentValue) {
        return true;
      }
    }
    return false;
  };

  const isMyTurn =
    players.length > 0 && players[turnIndex] === myId && gameStarted;

  const noValidCards =
    hands[myId] && currentCard
      ? !canPlayAnyCard(hands[myId], currentCard)
      : false;

  return (
    <>
      <h1 className="titulo">
        🎴 Juego UNO + 3 Online
      </h1>
      {roomId && (
        <p className="center-text">
          <strong>Sala:</strong> {roomId}
        </p>
      )}
      <div className="game-container">
        {!gameStarted && (
          <GameControls
            onCreateRoom={() => socket.emit("createRoom")}
            onJoinRoom={async () => {
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
              if (id) socket.emit("joinRoom", id.trim().toUpperCase());
            }}
            onDrawCard={drawCard}
            isMyTurn={
              players[turnIndex] === myId &&
              gameStarted &&
              !canPlayAnyCard(hands[myId], currentCard)
            }
          />
        )}

        <div className="players-container">
          <PlayerList
            players={players}
            hands={hands}
            myId={myId}
            turnIndex={turnIndex}
            onPlayCard={playCard}
          />
        </div>

        {gameStarted && (
          <CenterCard
            currentCard={currentCard}
            players={players}
            turnIndex={turnIndex}
            myId={myId}
          />
        )}
      </div>
      {/* <div style={{ textAlign: "center", marginBottom: 15 }}>
          <button className="btn-blue" onClick={drawCard}>
            📥 Tomar carta
          </button>
        </div> */}
      {gameStarted && (
          <div style={{ textAlign: "center", marginBottom: 15 }}>
            <button className="btn-blue" onClick={drawCard}>
              📥 Tomar carta
            </button>
          </div>
        )}
    </>
  );
}

export default App;
