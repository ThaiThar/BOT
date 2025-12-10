import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import BattleFieldOnline from "./page/bas/BattleFieldOnline";

const socket = io("https://agenda.bkkthon.ac.th", {
  path: "/cardgame/socket.io",
  transports: ["websocket", "polling"]
});

function App() {
  const [isInGame, setIsInGame] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [role, setRole] = useState("");

  const joinRoom = () => {
    if (roomId.trim() !== "") {
      socket.emit("join_room", roomId);
    }
  };

  useEffect(() => {

    const handleAssignRole = (data) => {
      setRole(data);
    };

    const handleStartGame = () => {
      setIsInGame(true);
    };

    const handleRoomFull = () => {
      alert("❌ ห้องเต็มแล้ว!");
    };

    const handleOpponentDisconnect = () => {
      alert("⚠ ผู้เล่นอีกฝ่ายหลุดออกจากเกม");
    };

    socket.on("assign_role", handleAssignRole);
    socket.on("start_game", handleStartGame);
    socket.on("room_full", handleRoomFull);
    socket.on("opponent_disconnected", handleOpponentDisconnect);

    // Cleanup ป้องกัน listener ซ้อน
    return () => {
      socket.off("assign_role", handleAssignRole);
      socket.off("start_game", handleStartGame);
      socket.off("room_full", handleRoomFull);
      socket.off("opponent_disconnected", handleOpponentDisconnect);
    };

  }, []);

  return (
    <div className="App">
      {!isInGame ? (
        <div className="lobby">
          <h3>เข้าสู่ห้องเกม</h3>
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => setRoomId(event.target.value)}
          />
          <button onClick={joinRoom}>Join Game</button>

          {role && <p>รอผู้เล่นอีกคน... (คุณคือ {role})</p>}
        </div>
      ) : (
        <BattleFieldOnline socket={socket} roomId={roomId} myRole={role} />
      )}
    </div>
  );
}

export default App;
