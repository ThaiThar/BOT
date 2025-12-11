import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import BattleFieldOnline from "./page/bas/BattleFieldOnline";
import Dice from "react-dice-roll";

// 1. ตั้งค่า Socket ให้เสถียรขึ้น (อยู่นอก Component ถูกแล้วครับ)
const socket = io("https://agenda.bkkthon.ac.th", {
  path: "/cardgame/socket.io",
  transports: ["websocket"], // บังคับใช้ WebSocket เลยเพื่อความไว
  reconnection: true, // ให้พยายามต่อใหม่ถ้าเน็ตหลุด
  reconnectionAttempts: 10, // ลองต่อใหม่ 10 ครั้ง
  reconnectionDelay: 1000, // รอ 1 วิก่อนต่อใหม่
  timeout: 20000, // รอ 20 วินาทีก่อนยอมแพ้ (ป้องกัน timeout ไวเกินไป)
  autoConnect: false, // อย่าเพิ่งต่อจนกว่า App จะโหลดเสร็จ
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
    // 2. เริ่มเชื่อมต่อเมื่อเข้าหน้านี้
    if (!socket.connected) {
      socket.connect();
    }

    const handleAssignRole = (data) => {
      console.log("Assigned Role:", data);
      setRole(data);
    };

    const handleStartGame = () => {
      console.log("Game Started!");
      setIsInGame(true);
    };

    const handleRoomFull = () => {
      alert("❌ ห้องเต็มแล้ว!");
    };

    const handleOpponentDisconnect = () => {
      alert("⚠ ผู้เล่นอีกฝ่ายหลุดออกจากเกม");
      setIsInGame(false); // เด้งกลับมาหน้า Lobby
      setRole(""); // รีเซ็ต Role
      // socket.emit("leave_room"); // (Optional) ถ้า Server มี event นี้
      window.location.reload(); // รีเฟรชเพื่อเริ่มใหม่ให้สะอาด
    };

    socket.on("assign_role", handleAssignRole);
    socket.on("start_game", handleStartGame);
    socket.on("room_full", handleRoomFull);
    socket.on("opponent_disconnected", handleOpponentDisconnect);

    // Cleanup: เมื่อปิดหน้านี้ ให้ตัดการเชื่อมต่อ และเอา listener ออก
    return () => {
      socket.off("assign_role", handleAssignRole);
      socket.off("start_game", handleStartGame);
      socket.off("room_full", handleRoomFull);
      socket.off("opponent_disconnected", handleOpponentDisconnect);

      // ตัดการเชื่อมต่อเมื่อปิด App (ป้องกัน Socket ค้าง)
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {!isInGame ? (
        <div
          className="lobby"
          style={{ textAlign: "center", marginTop: "50px" }}
        >
          <h1>Card Battle Online</h1>
          <div style={{ marginBottom: "20px" }}>
            <h3>เข้าสู่ห้องเกม</h3>
            <input
              type="text"
              placeholder="ใส่หมายเลขห้อง (เช่น 1234)"
              onChange={(event) => setRoomId(event.target.value)}
              style={{ padding: "10px", fontSize: "16px" }}
            />
            <button
              onClick={joinRoom}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginLeft: "10px",
                cursor: "pointer",
              }}
            >
              Join Game
            </button>
            <Dice
              rollingTime={1000}
              defaultValue={1}
              size={80} // ขนาดลูกเต๋า
              faceBg="#ffffff" // สีพื้น
               // เวลาหมุน (ms)
              onRoll={(value) => console.log(value)}
            />
          </div>

          {role && (
            <div style={{ color: "green", fontWeight: "bold" }}>
              ✅ คุณได้รับบทบาท: {role} <br />⏳ กำลังรอผู้เล่นอีกคน...
            </div>
          )}
        </div>
      ) : (
        <BattleFieldOnline
          socket={socket}
          roomId={roomId}
          myRole={role}
          enemyRole={role === "P1" ? "P2" : "P1"}
        />
      )}
    </div>
  );
}

export default App;
