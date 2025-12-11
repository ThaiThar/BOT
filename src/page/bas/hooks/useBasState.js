// src/components/Bas/hooks/useBasState.js
import { useState, useEffect, useCallback } from "react";

export function useBasState({ socket, roomId, myRole, enemyRole, isEnemy }) {
  // 📌 State สำหรับ Animation
  const [battleAnim, setBattleAnim] = useState({
    isOpen: false,
    attackerImg: null,
    defenderImg: null,
  });

  // --- STATE (ฝั่งเรา) ---
  const [handCards, setHandCards] = useState([]);
  const [magicSlots, setMagicSlots] = useState([null, null, null, null]);
  const [avatarSlots, setAvatarSlots] = useState([null, null, null, null]);
  const [modSlots, setModSlots] = useState([[], [], [], []]);
  const [end1Cards, setEnd1Cards] = useState([]);
  const [end2Cards, setEnd2Cards] = useState([]);
  const [deckCards, setDeckCards] = useState([]);
  const [avatarRotation, setAvatarRotation] = useState([0, 0, 0, 0]);
  const [isShuffling, setIsShuffling] = useState(false);

  // --- STATE (ฝั่งศัตรู - Sync มา) ---
  const [enemyAvatarSlots, setEnemyAvatarSlots] = useState([null, null, null, null]);
  const [enemyModSlots, setEnemyModSlots] = useState([[], [], [], []]);
  const [enemyEnd1, setEnemyEnd1] = useState([]);
  const [enemyEnd2, setEnemyEnd2] = useState([]);
  const [enemyRotation, setEnemyRotation] = useState([0, 0, 0, 0]);
  const [enemyDeck, setEnemyDeck] = useState([]);

  // --- BROADCAST HELPER ---
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

  // --- ACTION FUNCTIONS ---
  
  // 1. ฟังก์ชันปิด Animation
  const closeBattleAnim = () => {
    setBattleAnim((prev) => ({ ...prev, isOpen: false }));
  };

  // 2. ฟังก์ชันเปิด Animation (ย้ายมาไว้ตรงนี้ เพื่อให้ใช้งานได้)
  const triggerBattleAnim = (attackerImg, defenderImg) => {
    // 1. ส่งให้คู่แข่งเห็น
    broadcast("trigger_battle_anim", { attackerImg, defenderImg });

    // 2. ให้เราเห็นด้วย
    setBattleAnim({
      isOpen: true,
      attackerImg,
      defenderImg,
    });
  };

  // --- UPDATE WRAPPERS (State + Broadcast) ---
  const createUpdater = (setter, actionType) => (fn) => {
    setter((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      broadcast(actionType, next);
      return next;
    });
  };

  const updateAvatar = createUpdater(setAvatarSlots, "update_avatar");
  const updateMods = createUpdater(setModSlots, "update_mods");
  const updateEnd1 = createUpdater(setEnd1Cards, "update_end1");
  const updateEnd2 = createUpdater(setEnd2Cards, "update_end2");
  const updateDeck = createUpdater(setDeckCards, "update_deck");
  const updateRotation = createUpdater(setAvatarRotation, "update_rotation");
  const updateHand = createUpdater(setHandCards, "update_hand");
  const updateMagic = createUpdater(setMagicSlots, "update_magic");

  // --- SOCKET LISTENER ---
  useEffect(() => {
    if (!socket) return;
    const listener = (data) => {
      if (data.sender !== enemyRole && data.sender !== myRole) return;

      switch (data.actionType) {
        case "update_avatar": setEnemyAvatarSlots(data.payload); break;
        case "update_mods": setEnemyModSlots(data.payload); break;
        case "update_end1": setEnemyEnd1(data.payload); break;
        case "update_end2": setEnemyEnd2(data.payload); break;
        case "update_rotation": setEnemyRotation(data.payload); break;
        case "update_deck": setEnemyDeck(data.payload); break;
        case "shuffle_start": setIsShuffling(true); break;
        case "shuffle_done": 
          setIsShuffling(false); 
          setEnemyDeck(data.payload); 
          break;
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
        case "trigger_battle_anim":
          setBattleAnim({
            isOpen: true,
            attackerImg: data.payload.attackerImg,
            defenderImg: data.payload.defenderImg,
          });
          break;
        default:
          break;
      }
    };
    socket.on("receive_action", listener);
    return () => socket.off("receive_action", listener);
  }, [socket, enemyRole, myRole, isEnemy]);

  // --- SHUFFLE LOGIC ---
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

  // --- RESET ---
  const resetGame = () => {
    updateAvatar([null, null, null, null]);
    updateMods([[], [], [], []]);
    updateEnd1([]);
    updateEnd2([]);
    updateDeck([]);
    updateRotation([0, 0, 0, 0]);
  };

  // ✅ รวม Return ไว้ที่เดียวตอนท้ายสุด
  return {
    // Local State & Updaters
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

    // Enemy State & Setters
    enemyAvatarSlots, setEnemyAvatarSlots,
    enemyModSlots, setEnemyModSlots,
    enemyEnd1, setEnemyEnd1,
    enemyEnd2, setEnemyEnd2,
    enemyRotation, setEnemyRotation,
    enemyDeck, setEnemyDeck,

    // Utils
    broadcast,

    // Battle Animation
    battleAnim,
    closeBattleAnim,
    triggerBattleAnim,
  };
}