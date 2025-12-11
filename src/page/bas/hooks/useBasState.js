// src/components/Bas/hooks/useBasState.js
import { useState, useEffect, useCallback } from "react";

export function useBasState({ socket, roomId, myRole, enemyRole, isEnemy }) {
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
  const broadcast = useCallback((actionType, payload) => {
    if (!socket || !roomId || isEnemy) return;
    socket.emit("send_action", { roomId, sender: myRole, actionType, payload });
  }, [socket, roomId, isEnemy, myRole]);

  // --- UPDATE WRAPPERS (State + Broadcast) ---
  // ใช้ Generic function เพื่อลด code ซ้ำ
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
      if (data.sender !== enemyRole) return;

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
            // อัปเดตและ broadcast กลับทันทีเพื่อ sync
            updateEnd1(enemyEnd1);
            updateAvatar(enemyAvatar);
            updateMods(enemyMods);
            setEnemyRotation(prev => {
                const next = [...prev]; 
                next[attackerIndex] = 90; 
                return next; 
            });
          }
          break;
        }
        default: break;
      }
    };
    socket.on("receive_action", listener);
    return () => socket.off("receive_action", listener);
  }, [socket, enemyRole, isEnemy]);

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
    
    // Enemy State & Setters (for battle logic)
    enemyAvatarSlots, setEnemyAvatarSlots,
    enemyModSlots, setEnemyModSlots,
    enemyEnd1, setEnemyEnd1,
    enemyEnd2, setEnemyEnd2,
    enemyRotation, setEnemyRotation,
    enemyDeck, setEnemyDeck,
    
    // Utils
    broadcast
  };
}