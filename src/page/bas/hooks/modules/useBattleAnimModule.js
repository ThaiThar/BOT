// src/components/Bas/hooks/modules/useBattleAnimModule.js
import { useState } from "react";

export function useBattleAnimModule({ broadcast }) {
  const [battleAnim, setBattleAnim] = useState({
    isOpen: false,
    attackerImg: null,
    defenderImg: null,
  });

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

  return { battleAnim, setBattleAnim, closeBattleAnim, triggerBattleAnim };
}