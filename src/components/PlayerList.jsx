import React from "react";
import "../App.css";
import Player from "./Player.jsx";

export default function PlayerList({ players, hands, myId, turnIndex, onPlayCard }) {
  const myPos = players.findIndex((p) => p === myId);

  const getPlayerPosition = (index) => {
    return (index - myPos + players.length) % players.length;
  };

  return (
    <>
      {players.map((playerId, idx) => (
        <Player
          key={playerId}
          playerId={playerId}
          isMe={playerId === myId}
          cards={hands[playerId] || []}
          position={getPlayerPosition(idx)}
          onPlayCard={onPlayCard}
          isMyTurn={turnIndex === idx}
        />
      ))}
    </>
  );
}
