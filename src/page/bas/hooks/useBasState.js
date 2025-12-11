// src/components/Bas/hooks/useBasState.js
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";

export function useBasState({ socket, roomId, myRole, enemyRole, isEnemy }) {
  
  // ----------------------------------------------------
  // 🎲 1. DICE STATE (ลูกเต๋า)
  // ----------------------------------------------------
  const [diceState, setDiceState] = useState({
    value: 1,
    rollId: 0 
  });

  const rollDice = () => {
    const randomVal = Math.floor(Math.random() * 6) + 1;
    const timestamp = Date.now();
    setDiceState({ value: randomVal, rollId: timestamp });
    broadcast("roll_dice", { value: randomVal, rollId: timestamp });
  };

  // ----------------------------------------------------
  // ⚔️ 2. ANIMATION STATE
  // ----------------------------------------------------
  const [battleAnim, setBattleAnim] = useState({
    isOpen: false,
    attackerImg: null,
    defenderImg: null,
  });

  // ----------------------------------------------------
  // 🃏 3. START GAME STATE
  // ----------------------------------------------------
  const [startCards, setStartCards] = useState(
    Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
  );
  const [startImages, setStartImages] = useState([]);
  const [startStage, setStartStage] = useState("choose");

  const [enemyStartCards, setEnemyStartCards] = useState(
    Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
  );
  const [enemyStartImages, setEnemyStartImages] = useState([]);
  const [enemyStartStage, setEnemyStartStage] = useState("choose");

  // ----------------------------------------------------
  // 🛡️ 4. BOARD STATE (กระดาน)
  // ----------------------------------------------------
  // --- ฝั่งเรา ---
  const [handCards, setHandCards] = useState([]);
  const [magicSlots, setMagicSlots] = useState([null, null, null, null]);
  const [avatarSlots, setAvatarSlots] = useState([null, null, null, null]);
  const [modSlots, setModSlots] = useState([[], [], [], []]);
  const [end1Cards, setEnd1Cards] = useState([]);
  const [end2Cards, setEnd2Cards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [avatarRotation, setAvatarRotation] = useState([0, 0, 0, 0]);
  const [isShuffling, setIsShuffling] = useState(false);

  // --- ฝั่งศัตรู (Sync มา) ---
  // ✅ 1. เพิ่ม enemyMagicSlots (ที่เคยขาดไป)
  const [enemyMagicSlots, setEnemyMagicSlots] = useState([null, null, null, null]);
  
  const [enemyAvatarSlots, setEnemyAvatarSlots] = useState([null, null, null, null]);
  const [enemyModSlots, setEnemyModSlots] = useState([[], [], [], []]);
  const [enemyEnd1, setEnemyEnd1] = useState([]);
  const [enemyEnd2, setEnemyEnd2] = useState([]);
  const [enemyRotation, setEnemyRotation] = useState([0, 0, 0, 0]);
  const [enemyDeck, setEnemyDeck] = useState([]);

  // ----------------------------------------------------
  // 📡 BROADCAST HELPER
  // ----------------------------------------------------
  const broadcast = useCallback(
    (actionType, payload) => {
      if (!socket || !roomId || isEnemy) return;
      socket.emit("send_action", {
        roomId,
        sender: myRole,
        actionType,
        payload,
      });
    },
    [socket, roomId, isEnemy, myRole]
  );

  // ----------------------------------------------------
  // ⚙️ ACTION WRAPPERS
  // ----------------------------------------------------
  const closeBattleAnim = () => {
    setBattleAnim((prev) => ({ ...prev, isOpen: false }));
  };

  const triggerBattleAnim = (attackerImg, defenderImg) => {
    broadcast("trigger_battle_anim", { attackerImg, defenderImg });
    setBattleAnim({
      isOpen: true,
      attackerImg,
      defenderImg,
    });
  };

  const createUpdater = (setter, actionType) => (fn) => {
    setter((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      broadcast(actionType, next);
      return next;
    });
  };

  // Updaters (Board)
  const updateAvatar = createUpdater(setAvatarSlots, "update_avatar");
  const updateMods = createUpdater(setModSlots, "update_mods");
  const updateEnd1 = createUpdater(setEnd1Cards, "update_end1");
  const updateEnd2 = createUpdater(setEnd2Cards, "update_end2");
  const updateDeck = createUpdater(setDeckCards, "update_deck");
  const updateRotation = createUpdater(setAvatarRotation, "update_rotation");
  const updateHand = createUpdater(setHandCards, "update_hand");
  
  // Update Magic (ส่ง update_magic ไปหาเพื่อน)
  const updateMagic = createUpdater(setMagicSlots, "update_magic");

  // Updaters (Start Game)
  const updateStartCards = createUpdater(setStartCards, "update_start_cards");
  const updateStartImages = createUpdater(setStartImages, "update_start_images");
  const updateStartStage = createUpdater(setStartStage, "update_start_stage");

  // ----------------------------------------------------
  // 🎧 SOCKET LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    if (!socket) return;
    const listener = (data) => {
      try {
        if (data.sender !== enemyRole && data.sender !== myRole) return;

        switch (data.actionType) {
          // --- Board Updates ---
          // ✅ 2. รับข้อมูล Magic ของศัตรู
          case "update_magic": setEnemyMagicSlots(data.payload); break;
          
          case "update_avatar": setEnemyAvatarSlots(data.payload); break;
          case "update_mods": setEnemyModSlots(data.payload); break;
          case "update_end1": setEnemyEnd1(data.payload); break;
          case "update_end2": setEnemyEnd2(data.payload); break;
          case "update_rotation": setEnemyRotation(data.payload); break;
          case "update_deck": setEnemyDeck(data.payload); break;
          case "shuffle_start": setIsShuffling(true); break;
          case "shuffle_done": setIsShuffling(false); setEnemyDeck(data.payload); break;
          
          // --- Start Game ---
          case "update_start_cards": setEnemyStartCards(data.payload); break;
          case "update_start_images": setEnemyStartImages(data.payload); break;
          case "update_start_stage": setEnemyStartStage(data.payload); break;

          // --- Dice ---
          case "roll_dice": setDiceState(data.payload); break;

          // --- Battle Logic ---
          case "update_enemy_after_attack": {
            if (!isEnemy) {
              const { enemyEnd1, enemyAvatar, enemyMods, attackerIndex } = data.payload;
              updateEnd1(enemyEnd1);
              updateAvatar(enemyAvatar);
              updateMods(enemyMods);
              setEnemyRotation((prev) => {
                const next = [...prev];
                next[attackerIndex] = 90;
                return next;
              });
            }
            break;
          }

          // --- Base Damage ---
          case "receive_base_damage": {
            const { newCards, hitCardImage } = data.payload;
            setStartCards(newCards);
            Swal.fire({
              title: "💥 ฐานทัพถูกโจมตี!",
              text: "การ์ดของคุณถูกเปิดเผย",
              imageUrl: hitCardImage || "https://placeholder.pics/svg/300",
              imageHeight: 300,
              timer: 5000,
              timerProgressBar: true,
              showConfirmButton: false,
              background: "#222",
              color: "#fff",
              backdrop: `rgba(100,0,0,0.4)`
            });
            break;
          }

          // --- Animation ---
          case "trigger_battle_anim":
            setBattleAnim({
              isOpen: true,
              attackerImg: data.payload.attackerImg,
              defenderImg: data.payload.defenderImg,
            });
            break;

          // --- Game Over ---
          case "game_over": {
            Swal.fire({
              title: "พ่ายแพ้! 💀",
              text: "ฐานทัพของคุณถูกทำลายแล้ว",
              icon: "error",
              background: "#000",
              color: "#ff4444",
              confirmButtonText: "ตกลง",
              allowOutsideClick: false
            });
            break;
          }

          default: break;
        }
      } catch (err) {
        console.error("Socket Error:", err);
      }
    };

    socket.on("receive_action", listener);
    return () => socket.off("receive_action", listener);
  }, [socket, enemyRole, myRole, isEnemy]);

  // ----------------------------------------------------
  // 🔄 UTILS
  // ----------------------------------------------------
  const onShuffleDeck = () => {
    if (isEnemy) return;
    broadcast("shuffle_start", {});
    setIsShuffling(true);
    const newDeck = [...deckCards].sort(() => Math.random() - 0.5);
    setTimeout(() => {
      setDeckCards(newDeck);
      broadcast("shuffle_done", newDeck);
      setIsShuffling(false);
    }, 2000);
  };

  const resetGame = () => {
    updateAvatar([null, null, null, null]);
    updateMods([[], [], [], []]);
    updateEnd1([]);
    updateEnd2([]);
    updateDeck([]);
    updateRotation([0, 0, 0, 0]);
    updateMagic([null, null, null, null]); // Reset magic ด้วย
  };

  // ----------------------------------------------------
  // 📦 EXPORT
  // ----------------------------------------------------
  return {
    // Board
    handCards, updateHand,
    magicSlots, updateMagic,
    avatarSlots, updateAvatar,
    modSlots, updateMods,
    end1Cards, updateEnd1,
    end2Cards, updateEnd2,
    deckCards, updateDeck,
    avatarRotation, updateRotation,
    isShuffling,
    onShuffleDeck,
    resetGame,

    // Enemy Board
    // ✅ 3. ส่งออก enemyMagicSlots ให้คนอื่นใช้
    enemyMagicSlots, setEnemyMagicSlots,
    
    enemyAvatarSlots, setEnemyAvatarSlots,
    enemyModSlots, setEnemyModSlots,
    enemyEnd1, setEnemyEnd1,
    enemyEnd2, setEnemyEnd2,
    enemyRotation, setEnemyRotation,
    enemyDeck, setEnemyDeck,

    // Start Game
    startCards, updateStartCards,
    startImages, updateStartImages,
    startStage, updateStartStage,
    enemyStartCards, setEnemyStartCards,
    enemyStartImages, setEnemyStartImages,
    enemyStartStage, setEnemyStartStage,

    // Battle & Anim
    broadcast,
    battleAnim,
    closeBattleAnim,
    triggerBattleAnim,

    // Dice
    diceState,
    rollDice,
  };
}