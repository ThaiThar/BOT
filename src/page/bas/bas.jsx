// src/components/Bas/Bas.jsx
import React from "react";
import "./style.css";
import "../bas/end1/functions/HinduGodMode.css";

// Components
import Start from "./start/start.jsx";
import Center from "./center/center.jsx";
import End1 from "./end1/end1.jsx";
import HandButton from "./hand/HandButton.jsx";
import Battle from "../battle/battle.jsx";
import ShuffleEffect from "./ui/ShuffleEffect.jsx";
import BattleClash from "./ui/BattleClash.jsx"; // 1. Import แล้ว (ถูกต้อง)

// Hooks
import { useBasState } from "./hooks/useBasState";
import { useBattleSystem } from "./hooks/useBattleSystem";

function Bas({
  playerId = "P1",
  socket,
  roomId,
  isEnemy = false,
  myRole,
  enemyRole,
}) {
  // 1. เรียกใช้ Logic หลัก
  const gameState = useBasState({ socket, roomId, myRole, enemyRole, isEnemy });

  // 2. เรียกใช้ Battle System
  // ⚠️ แก้ไข: ต้องเพิ่ม avatarSlots และ triggerBattleAnim เข้าไปเพื่อให้ระบบ Animation ทำงาน
  const { startAttack } = useBattleSystem({
    isEnemy,
    avatarSlots: gameState.avatarSlots, // ✅ เพิ่ม: เพื่อให้รู้ว่าใครเป็นคนตี (เอารูปฝั่งเรา)
    enemyAvatarSlots: gameState.enemyAvatarSlots,
    setEnemyAvatarSlots: gameState.setEnemyAvatarSlots,
    enemyModSlots: gameState.enemyModSlots,
    setEnemyModSlots: gameState.setEnemyModSlots,
    enemyEnd1: gameState.enemyEnd1,
    setEnemyEnd1: gameState.setEnemyEnd1,
    broadcast: gameState.broadcast,
    updateRotation: gameState.updateRotation,
    triggerBattleAnim: gameState.triggerBattleAnim, // ✅ เพิ่ม: เพื่อส่งคำสั่งเริ่ม Animation
  });

  // 3. เตรียมข้อมูล UI
  const uiAvatarSlots = isEnemy
    ? gameState.enemyAvatarSlots
    : gameState.avatarSlots;
  const uiModSlots = isEnemy ? gameState.enemyModSlots : gameState.modSlots;
  const uiEnd1 = isEnemy ? gameState.enemyEnd1 : gameState.end1Cards;
  const uiEnd2 = isEnemy ? gameState.enemyEnd2 : gameState.end2Cards;
  const uiRotation = isEnemy
    ? gameState.enemyRotation
    : gameState.avatarRotation;
  const uiDeck = isEnemy ? gameState.enemyDeck : gameState.deckCards;

  const handleDrawCard = (card) =>
    gameState.updateHand((prev) => [...prev, card]);

  return (
    <div
      className="fillborad"
      style={isEnemy ? { pointerEvents: "none", opacity: 0.8 } : {}}
    >
      {/* ⚠️ แก้ไข: เพิ่ม Component BattleClash ไว้บนสุดเพื่อให้แสดงผลทับหน้าจอ */}
      <BattleClash
        isOpen={gameState.battleAnim.isOpen}
        attackerImg={gameState.battleAnim.attackerImg}
        defenderImg={gameState.battleAnim.defenderImg}
        onAnimationComplete={gameState.closeBattleAnim}
      />

      {/* Effect สับไพ่ */}
      <ShuffleEffect isShuffling={gameState.isShuffling} />

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>
          กระดานของฝั่ง: {playerId} {isEnemy ? "(คู่แข่ง)" : "(คุณ)"}
        </span>
      </div>

      <HandButton
        handCards={isEnemy ? [] : gameState.handCards}
        setHandCards={gameState.updateHand}
        magicSlots={gameState.magicSlots}
        setMagicSlots={gameState.updateMagic}
        avatarSlots={uiAvatarSlots}
        setAvatarSlots={gameState.updateAvatar}
        modSlots={uiModSlots}
        setModSlots={gameState.updateMods}
        end1Cards={uiEnd1}
        setEnd1Cards={gameState.updateEnd1}
        end2Cards={uiEnd2}
        setEnd2Cards={gameState.updateEnd2}
        isEnemy={isEnemy}
      />

      <div className="main-bas">
        <Battle />
      </div>

      <div style={{ display: "flex" }}>
        <div className="start">
          <Start />
        </div>

        <div className="center">
          <Center
            // State
            magicSlots={gameState.magicSlots}
            avatarSlots={uiAvatarSlots}
            modSlots={uiModSlots}
            end1Cards={uiEnd1}
            end2Cards={uiEnd2}
            deckCards={uiDeck}
            avatarRotation={uiRotation}
            // Updaters
            setMagicSlots={gameState.updateMagic}
            setAvatarSlots={gameState.updateAvatar}
            setModSlots={gameState.updateMods}
            setHandCards={gameState.updateHand}
            setEnd1Cards={gameState.updateEnd1}
            setEnd2Cards={gameState.updateEnd2}
            setDeckCards={gameState.updateDeck}
            setAvatarRotation={gameState.updateRotation}
            // Actions
            isEnemy={isEnemy}
            onAttack={startAttack}
          />
        </div>

        <div className="end1">
          <End1
            // State
            deckCards={uiDeck}
            end1Cards={uiEnd1}
            end2Cards={uiEnd2}
            handCards={gameState.handCards}
            // Updaters
            setDeckCards={gameState.updateDeck}
            setEnd1Cards={gameState.updateEnd1}
            setEnd2Cards={gameState.updateEnd2}
            setHandCards={gameState.updateHand}
            // Actions
            onDrawCard={handleDrawCard}
            resetGame={gameState.resetGame}
            isEnemy={isEnemy}
            onShuffleDeck={gameState.onShuffleDeck}
          />
        </div>
      </div>
    </div>
  );
}

export default Bas;
