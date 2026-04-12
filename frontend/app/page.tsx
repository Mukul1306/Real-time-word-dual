"use client";

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./globals.css";

const socket = io("http://localhost:3001");

export default function Home() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [match, setMatch] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [guess, setGuess] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [resultArray, setResultArray] = useState<boolean[]>([]);
  const [time, setTime] = useState(5);
  const [isPlayer1, setIsPlayer1] = useState(false);

  // 🔥 JOIN GAME
  const joinGame = () => {
    if (!username) {
      setMessage("Enter username");
      return;
    }
    socket.emit("joinGame", { username });
  };

  // 🔥 GUESS
  const submitGuess = () => {
    if (!round || guess.length !== round.word.length) {
      setMessage(`Enter ${round.word.length} letter word`);
      return;
    }

    socket.emit("guess", {
      roundId: round.id,
      guess,
      playerId,
    });

    setGuess("");
  };

  // 🔥 SOCKET LISTENER
  useEffect(() => {
    socket.on("gameUpdate", (data: any) => {
      if (data.message) setMessage(data.message);

      if (data.player && data.match) {
        setPlayerId(data.player.id);

        if (data.match.player1Id === data.player.id) {
          setIsPlayer1(true);
        } else {
          setIsPlayer1(false);
        }
      }

      if (data.match) setMatch(data.match);
      if (data.round) setRound(data.round);
      if (data.result) setResultArray(data.result);
    });

    socket.on("timer", (data: any) => {
      setTime(data.time);
    });

    socket.on("timerEnd", (data: any) => {
      setMessage(data.message);
    });

    return () => {
      socket.off("gameUpdate");
      socket.off("timer");
      socket.off("timerEnd");
    };
  }, []);

  // 🔥 TURN LOGIC
  const isMyTurn = match?.currentTurnId === playerId;

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">🎮 Word Game</h1>

        {/* JOIN */}
        {!match && (
          <>
            <input
              className="input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button className="button" onClick={joinGame}>
              Join Game
            </button>
          </>
        )}

        {/* MATCH */}
        {match && (
          <div className="match">
            <h2>Match Started</h2>

            {/* 🔥 TURN DISPLAY */}
            <p className="turn">
              {isMyTurn ? "🟢 Your Turn" : "⏳ Opponent Turn"}
            </p>

            <div className="score">
              <div>
                <p className="label">{isPlayer1 ? "You" : "Opponent"}</p>
                <p className="name">
                  {isPlayer1 ? match.player1Name : match.player2Name}
                </p>
                <p>{isPlayer1 ? match.score1 : match.score2}</p>
              </div>

              <div>
                <p className="label">{isPlayer1 ? "Opponent" : "You"}</p>
                <p className="name">
                  {isPlayer1 ? match.player2Name : match.player1Name}
                </p>
                <p>{isPlayer1 ? match.score2 : match.score1}</p>
              </div>
            </div>
          </div>
        )}

        {/* ROUND */}
        {round && (
          <>
            <p className="word">{"_ ".repeat(round.word.length)}</p>

            <p className="timer">⏳ {time}s</p>

            <div className="guess-box">
              <input
                className="input"
                value={guess}
                disabled={!isMyTurn} // 🔥 DISABLE INPUT
                onChange={(e) =>
                  setGuess(e.target.value.toUpperCase())
                }
                placeholder="Enter guess"
              />
              <button
                className="button small"
                disabled={!isMyTurn} // 🔥 DISABLE BUTTON
                onClick={submitGuess}
              >
                Go
              </button>
            </div>

            {/* RESULT */}
            {resultArray.length > 0 && (
              <div className="result">
                {resultArray.map((val, i) => (
                  <span
                    key={i}
                    className={val ? "correct" : "wrong"}
                  >
                    {val ? "✓" : "✗"}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        <p className="message">{message}</p>
      </div>
    </div>
  );
}