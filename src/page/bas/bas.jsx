import React, { useState, useEffect } from "react";
import "./style.css";
import Start from "./start/start.jsx";
import Center from "./center/center.jsx";
import End1 from "./end1/end1.jsx";
import HandButton from "./hand/HandButton.jsx";

function Bas({ playerId = "P1", socket, roomId, isEnemy = false }) {
  // --- State ทั้งหมด ---
  const [handCards, setHandCards] = useState([]);
  const [magicSlots, setMagicSlots] = useState([null, null, null, null]);
  const [avatarSlots, setAvatarSlots] = useState([null, null, null, null]);
  const [modSlots, setModSlots] = useState([[], [], [], []]);
  const [end1Cards, setEnd1Cards] = useState([]);
  const [end2Cards, setEnd2Cards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  
  // ✅ State สำหรับการหมุน Avatar
  const [avatarRotation, setAvatarRotation] = useState([0, 0, 0, 0]);

  // --- Helper: ส่งข้อมูลไป Server ---
  const broadcast = (actionType, payload) => {
    if (!isEnemy && socket && roomId) {
      socket.emit("send_action", {
        roomId,
        sender: playerId,
        actionType,
        payload,
      });
    }
  };

  // --- Wrappers ---
  const updateRotation = (valOrFn) => {
    setAvatarRotation((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_rotation", newVal); 
      return newVal;
    });
  };

  const updateHand = (valOrFn) => {
    setHandCards((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_hand", newVal);
      return newVal;
    });
  };

  const updateMagic = (valOrFn) => {
    setMagicSlots((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_magic", newVal);
      return newVal;
    });
  };

  const updateAvatar = (valOrFn) => {
    setAvatarSlots((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_avatar", newVal);
      return newVal;
    });
  };

  const updateMods = (valOrFn) => {
    setModSlots((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_mods", newVal);
      return newVal;
    });
  };

  const updateEnd1 = (valOrFn) => {
    setEnd1Cards((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_end1", newVal);
      return newVal;
    });
  };

  const updateEnd2 = (valOrFn) => {
    setEnd2Cards((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_end2", newVal);
      return newVal;
    });
  };

  const updateDeck = (valOrFn) => {
    setDeckCards((prev) => {
      const newVal = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      broadcast("update_deck", newVal);
      return newVal;
    });
  };

  // --- Socket Listener ---
  useEffect(() => {
    if (!socket) return;

    const handleReceiveAction = (data) => {
      if (data.sender !== playerId) return;

      switch (data.actionType) {
        case "update_hand": setHandCards(data.payload); break;
        case "update_magic": setMagicSlots(data.payload); break;
        case "update_avatar": setAvatarSlots(data.payload); break;
        case "update_mods": setModSlots(data.payload); break;
        case "update_end1": setEnd1Cards(data.payload); break;
        case "update_end2": setEnd2Cards(data.payload); break;
        case "update_deck": setDeckCards(data.payload); break;
        case "update_rotation": setAvatarRotation(data.payload); break;
        default: break;
      }
    };

    socket.on("receive_action", handleReceiveAction);

    return () => {
      socket.off("receive_action", handleReceiveAction);
    };
  }, [socket, playerId]);


  // --- Logic ---
  const handleDrawCard = (card) => {
    updateHand((prev) => [...prev, card]);
  };

  const resetGame = () => {
    const empty = [];
    const emptySlots = [null, null, null, null];
    const emptyMods = [[], [], [], []];
    const emptyRotation = [0, 0, 0, 0];

    updateHand(empty);
    updateMagic(emptySlots);
    updateAvatar(emptySlots);
    updateMods(emptyMods);
    updateEnd1(empty);
    updateEnd2(empty);
    updateDeck(empty);
    updateRotation(emptyRotation);
  };

  return (
    <div
      className="fillborad"
      // 🔥🔥🔥 จุดนี้สำคัญที่สุด: สั่งปิดการคลิกทุกอย่างถ้าเป็น Enemy 🔥🔥🔥
      style={isEnemy ? { pointerEvents: "none", opacity: 0.9 } : {}}
    >
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>
          กระดานของฝั่ง: {playerId} {isEnemy ? "(คู่แข่ง)" : "(คุณ)"}
        </span>
      </div>

      <HandButton
        handCards={handCards}
        setHandCards={updateHand}      
        magicSlots={magicSlots}
        setMagicSlots={updateMagic}    
        avatarSlots={avatarSlots}
        setAvatarSlots={updateAvatar}  
        modSlots={modSlots}
        setModSlots={updateMods}       
        end1Cards={end1Cards}
        setEnd1Cards={updateEnd1}      
        end2Cards={end2Cards}
        setEnd2Cards={updateEnd2} 
        isEnemy={isEnemy}     
      />

      <div style={{ display: "flex" }}>
        <div className="start">
          <Start />
        </div>

        <div className="center">
          <Center
            magicSlots={magicSlots}
            setMagicSlots={updateMagic}
            avatarSlots={avatarSlots}
            setAvatarSlots={updateAvatar}
            modSlots={modSlots}
            setModSlots={updateMods}
            setHandCards={updateHand}
            end1Cards={end1Cards}
            setEnd1Cards={updateEnd1}
            end2Cards={end2Cards}
            setEnd2Cards={updateEnd2}
            deckCards={deckCards}
            setDeckCards={updateDeck}
            
            avatarRotation={avatarRotation}
            setAvatarRotation={updateRotation}
            isEnemy={isEnemy} // ✅ ส่ง isEnemy ไปให้ Center (ป้องกัน Logic ภายใน)
          />
        </div>

        <div className="end1">
          <End1
            onDrawCard={handleDrawCard}
            deckCards={deckCards}
            setDeckCards={updateDeck}   
            end1Cards={end1Cards}
            setEnd1Cards={updateEnd1}   
            end2Cards={end2Cards}
            setEnd2Cards={updateEnd2}   
            handCards={handCards}
            setHandCards={updateHand}   
            resetGame={resetGame}
            
            isEnemy={isEnemy} // ✅ เพิ่มบรรทัดนี้: ส่ง isEnemy ไปให้ End1 ด้วย
          />
        </div>
      </div>
    </div>
  );
}

export default Bas;