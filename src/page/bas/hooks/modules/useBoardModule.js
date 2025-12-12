// src/components/Bas/hooks/modules/useBoardModule.js
import { useState } from "react";

export function useBoardModule({ broadcast, isEnemy }) {
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

  // --- ฝั่งศัตรู ---
  const [enemyMagicSlots, setEnemyMagicSlots] = useState([null, null, null, null]);
  const [enemyAvatarSlots, setEnemyAvatarSlots] = useState([null, null, null, null]);
  const [enemyModSlots, setEnemyModSlots] = useState([[], [], [], []]);
  const [enemyEnd1, setEnemyEnd1] = useState([]);
  const [enemyEnd2, setEnemyEnd2] = useState([]);
  const [enemyRotation, setEnemyRotation] = useState([0, 0, 0, 0]);
  const [enemyDeck, setEnemyDeck] = useState([]);

  // Logic Shuffle
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

  const resetBoard = () => {
    setAvatarSlots([null, null, null, null]);
    setModSlots([[], [], [], []]);
    setEnd1Cards([]);
    setEnd2Cards([]);
    setDeckCards([]);
    setAvatarRotation([0, 0, 0, 0]);
    setMagicSlots([null, null, null, null]);
  };

  return {
    handCards, setHandCards,
    magicSlots, setMagicSlots,
    avatarSlots, setAvatarSlots,
    modSlots, setModSlots,
    end1Cards, setEnd1Cards,
    end2Cards, setEnd2Cards,
    deckCards, setDeckCards,
    avatarRotation, setAvatarRotation,
    isShuffling, setIsShuffling,
    onShuffleDeck,
    resetBoard,
    
    // Enemy
    enemyMagicSlots, setEnemyMagicSlots,
    enemyAvatarSlots, setEnemyAvatarSlots,
    enemyModSlots, setEnemyModSlots,
    enemyEnd1, setEnemyEnd1,
    enemyEnd2, setEnemyEnd2,
    enemyRotation, setEnemyRotation,
    enemyDeck, setEnemyDeck
  };
}