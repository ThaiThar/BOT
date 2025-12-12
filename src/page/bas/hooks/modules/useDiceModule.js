// src/components/Bas/hooks/modules/useDiceModule.js
import { useState } from "react";

export function useDiceModule({ broadcast }) {
  const [diceState, setDiceState] = useState({
    value: 1,
    rollId: 0,
  });

  const rollDice = () => {
    const randomVal = Math.floor(Math.random() * 6) + 1;
    const timestamp = Date.now();
    setDiceState({ value: randomVal, rollId: timestamp });
    broadcast("roll_dice", { value: randomVal, rollId: timestamp });
  };

  return { diceState, setDiceState, rollDice };
}