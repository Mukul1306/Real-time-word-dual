"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import "./globals.css";

const socket: Socket = io("http://localhost:3001");

export default function Home() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [match, setMatch] = useState<any>(null);
  const [round, setRound] = useState<any>(null);
  const [guess, setGuess] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [resultArray, setResultArray] = useState<boolean[]>([]);
  const [time, setTime] = useState(5);
  const [roundCount, setRoundCount] = useState(1);

  // 🔥 JOIN GAME
  const joinGame = () => {
    if (!username.trim()) {
      setMessage("Enter username");
      return;
    }
    socket.emit("joinGame", { username });
  };

  // 🔥 SUBMIT GUESS
  const submitGuess = () => {
    if (!round) return;

    if (guess.length !== round.word.length) {
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

      // ✅ SET PLAYER ID
      if (data.player && data.player.username === username) {
        setPlayerId(data.player.id);
      }

      // ✅ GAME OVER RESET
      if (data.gameOver) {
        setMessage(data.message);
        setMatch(null);
        setRound(null);
        setResultArray([]);
        setRoundCount(1);
        return;
      }

      if (data.match) setMatch(data.match);

      if (data.round) {
        setRound(data.round);
        setRoundCount((prev) => prev + 1); // 🔥 increase round
      }

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
  }, [username]);

  // 🔥 TURN LOGIC
  const isPlayer1 = match?.player1Id === playerId;
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

            {/* ROUND */}
            <p style={{ fontWeight: "bold" }}>
              🔢 Round: {roundCount > 3 ? 3 : roundCount}
            </p>

            {/* TURN */}
            <p className="turn">
              {isMyTurn ? "🟢 Your Turn" : "🔴 Opponent Turn"}
            </p>

            {/* SCORE */}
            <div className="score">
              <div>
                <p>You</p>
                <p>
                  {isPlayer1
                    ? match.player1Name
                    : match.player2Name}
                </p>
                <p>
                  {isPlayer1
                    ? match.score1
                    : match.score2}
                </p>
              </div>

              <div>
                <p>Opponent</p>
                <p>
                  {isPlayer1
                    ? match.player2Name
                    : match.player1Name}
                </p>
                <p>
                  {isPlayer1
                    ? match.score2
                    : match.score1}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ROUND UI */}
        {round && (
          <>
            <p className="word">{"_ ".repeat(round.word.length)}</p>

            <p className="timer">⏳ {time}s</p>

            <div className="guess-box">
              <input
                className="input"
                value={guess}
                disabled={!isMyTurn}
                placeholder={
                  isMyTurn
                    ? "Enter guess"
                    : "Wait for your turn..."
                }
                onChange={(e) =>
                  setGuess(e.target.value.toUpperCase())
                }
              />

              <button
                disabled={!isMyTurn}
                className="button"
                onClick={submitGuess}
              >
                Go
              </button>
            </div>

            {/* RESULT */}
            {resultArray.length > 0 && (
              <div className="result">
                {resultArray.map((val, i) => (
                  <span key={i}>
                    {val ? "✅" : "❌"}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        {/* MESSAGE */}
        <p className="message">{message}</p>
      </div>
    </div>
  );
}