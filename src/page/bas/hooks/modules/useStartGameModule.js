// src/components/Bas/hooks/modules/useStartGameModule.js
import { useState } from "react";

export function useStartGameModule() {
  // --- ฝั่งเรา ---
  const [startCards, setStartCards] = useState(
    Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
  );
  const [startImages, setStartImages] = useState([]);
  const [startStage, setStartStage] = useState("choose");

  // --- ฝั่งศัตรู ---
  const [enemyStartCards, setEnemyStartCards] = useState(
    Array.from({ length: 5 }, () => ({ image: null, flipped: false }))
  );
  const [enemyStartImages, setEnemyStartImages] = useState([]);
  const [enemyStartStage, setEnemyStartStage] = useState("choose");

  return {
    startCards, setStartCards,
    startImages, setStartImages,
    startStage, setStartStage,
    enemyStartCards, setEnemyStartCards,
    enemyStartImages, setEnemyStartImages,
    enemyStartStage, setEnemyStartStage
  };
}