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
import BattleClash from "./ui/BattleClash.jsx";

// Hooks
import { useBattleSystem } from "./hooks/useBattleSystem";

function Bas({
  gameState, 
  playerId = "P1",
  isEnemy = false,
}) {
  
  // 2. เรียกใช้ Battle System
  const { startAttack } = useBattleSystem({
    isEnemy,
    avatarSlots: gameState.avatarSlots,
    enemyAvatarSlots: gameState.enemyAvatarSlots,
    setEnemyAvatarSlots: gameState.setEnemyAvatarSlots,
    enemyModSlots: gameState.enemyModSlots,
    setEnemyModSlots: gameState.setEnemyModSlots,
    enemyEnd1: gameState.enemyEnd1,
    setEnemyEnd1: gameState.setEnemyEnd1,
    broadcast: gameState.broadcast,
    updateRotation: gameState.updateRotation,
    triggerBattleAnim: gameState.triggerBattleAnim,
    
    // ส่งข้อมูลสำหรับตีบ้าน
    enemyStartCards: gameState.enemyStartCards, 
    setEnemyStartCards: gameState.setEnemyStartCards, 
  });

  // 3. เตรียมข้อมูล UI
  const uiAvatarSlots = isEnemy ? gameState.enemyAvatarSlots : gameState.avatarSlots;
  const uiModSlots = isEnemy ? gameState.enemyModSlots : gameState.modSlots;
  const uiEnd1 = isEnemy ? gameState.enemyEnd1 : gameState.end1Cards;
  const uiEnd2 = isEnemy ? gameState.enemyEnd2 : gameState.end2Cards;
  const uiRotation = isEnemy ? gameState.enemyRotation : gameState.avatarRotation;
  const uiDeck = isEnemy ? gameState.enemyDeck : gameState.deckCards;

  // ✅✅✅ แก้ไขจุดนี้: เลือก Magic Slots ให้ถูกฝั่ง ✅✅✅
  // ถ้าเป็นศัตรู -> ใช้ enemyMagicSlots (ที่ sync มา)
  // ถ้าเป็นเรา -> ใช้ magicSlots (ของเราเอง)
  const uiMagicSlots = isEnemy ? gameState.enemyMagicSlots : gameState.magicSlots;

  // 4. เตรียมข้อมูล UI สำหรับ Start
  const uiStartCards = isEnemy ? gameState.enemyStartCards : gameState.startCards;
  const uiStartImages = isEnemy ? gameState.enemyStartImages : gameState.startImages;
  const uiStartStage = isEnemy ? gameState.enemyStartStage : gameState.startStage;

  const setStartCards = isEnemy ? () => {} : gameState.updateStartCards;
  const setStartImages = isEnemy ? () => {} : gameState.updateStartImages;
  const setStartStage = isEnemy ? () => {} : gameState.updateStartStage;

  const handleDrawCard = (card) =>
    gameState.updateHand((prev) => [...prev, card]);

  return (
    <div
      className="fillborad"
      style={isEnemy ? { opacity: 1 } : {}} 
    >
      {!isEnemy && (
        <BattleClash
          isOpen={gameState.battleAnim.isOpen}
          attackerImg={gameState.battleAnim.attackerImg}
          defenderImg={gameState.battleAnim.defenderImg}
          onAnimationComplete={gameState.closeBattleAnim}
        />
      )}

      <ShuffleEffect isShuffling={gameState.isShuffling} />

      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <span style={{ fontWeight: "bold" }}>
          กระดานของฝั่ง: {playerId} {isEnemy ? "(คู่แข่ง)" : "(คุณ)"}
        </span>
      </div>

      <HandButton
        handCards={isEnemy ? [] : gameState.handCards}
        setHandCards={gameState.updateHand}
        // ตรงนี้ HandButton ใช้ของ local เสมอ (เพราะศัตรูไม่มี handButton)
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
          <Start
            cards={uiStartCards}
            setCards={setStartCards}
            images={uiStartImages}
            setImages={setStartImages}
            stage={uiStartStage}
            setStage={setStartStage}
            isEnemy={isEnemy}
          />
        </div>

        <div className="center">
          <Center
            // ✅✅✅ ส่งตัวแปรที่เลือกแล้วเข้าไป (uiMagicSlots)
            magicSlots={uiMagicSlots} 
            
            avatarSlots={uiAvatarSlots}
            modSlots={uiModSlots}
            end1Cards={uiEnd1}
            end2Cards={uiEnd2}
            deckCards={uiDeck}
            avatarRotation={uiRotation}
            
            // ✅✅✅ ถ้าเป็นศัตรู ห้ามเซ็ตค่า (ส่งฟังก์ชันว่าง)
            setMagicSlots={isEnemy ? () => {} : gameState.updateMagic}
            
            setAvatarSlots={gameState.updateAvatar}
            setModSlots={gameState.updateMods}
            setHandCards={gameState.updateHand}
            setEnd1Cards={gameState.updateEnd1}
            setEnd2Cards={gameState.updateEnd2}
            setDeckCards={gameState.updateDeck}
            setAvatarRotation={gameState.updateRotation}
            isEnemy={isEnemy}
            onAttack={startAttack}
          />
        </div>

        <div className="end1">
          <End1
            deckCards={uiDeck}
            end1Cards={uiEnd1}
            end2Cards={uiEnd2}
            handCards={gameState.handCards}
            setDeckCards={gameState.updateDeck}
            setEnd1Cards={gameState.updateEnd1}
            setEnd2Cards={gameState.updateEnd2}
            setHandCards={gameState.updateHand}
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