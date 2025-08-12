import React from "react";
import "../App.css";
import Card from "./Card.jsx";

export default function Player({ playerId, isMe, cards, position, onPlayCard, isMyTurn }) {
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
