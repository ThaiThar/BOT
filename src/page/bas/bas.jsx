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
import SnoopOverlay from "./ui/SnoopOverlay.jsx";

// Hooks
import { useBattleSystem } from "./hooks/useBattleSystem";

function Bas({
  gameState,
  playerId = "P1",
  isEnemy = false,
  myRole,
}) {

  // 1. ดึงค่าจาก Turn Module
  const { isMyTurn, endTurn } = gameState;

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
  const uiMagicSlots = isEnemy ? gameState.enemyMagicSlots : gameState.magicSlots;

  // 4. เตรียมข้อมูล UI สำหรับ Start
  const uiStartCards = isEnemy ? gameState.enemyStartCards : gameState.startCards;
  const uiStartImages = isEnemy ? gameState.enemyStartImages : gameState.startImages;
  const uiStartStage = isEnemy ? gameState.enemyStartStage : gameState.startStage;

  const setStartCards = isEnemy ? () => { } : gameState.updateStartCards;
  const setStartImages = isEnemy ? () => { } : gameState.updateStartImages;
  const setStartStage = isEnemy ? () => { } : gameState.updateStartStage;

  const handleDrawCard = (card) =>
    gameState.updateHand((prev) => [...prev, card]);

  return (
    <div
      className="fillborad"
      style={{
        // 🔒 Visual Lock: ถ้าไม่ใช่เทิร์นเรา และไม่ใช่กระดานศัตรู ให้จางลงและกดไม่ได้
        opacity: (!isMyTurn && !isEnemy) ? 0.85 : 1,
        // pointerEvents: (!isMyTurn && !isEnemy) ? 'none' : 'auto', // ปิดบรรทัดนี้ถ้าอยากให้กดดูการ์ดได้ แต่กด Action ไม่ได้ (เพราะเรามี Guard ใน Hook แล้ว)
        transition: 'all 0.3s ease'
      }}
    >
      {/* -------------------------------------------------- */}
      {/* 🔴 ส่วนควบคุมเทิร์น (แสดงเฉพาะฝั่งเรา) */}
      {/* -------------------------------------------------- */}
      {!isEnemy && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '10px',
          padding: '10px',
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '10px'
        }}>
          <div style={{
            color: isMyTurn ? '#2ecc71' : '#e74c3c',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textShadow: '1px 1px 2px black'
          }}>
            {isMyTurn ? "🟢 ตาของคุณ (Your Turn)" : "⏳ รอฝ่ายตรงข้าม (Opponent's Turn)"}
          </div>

          {isMyTurn && (
            <button
              onClick={endTurn}
              style={{
                backgroundColor: '#e67e22',
                color: 'white',
                border: '2px solid #d35400',
                borderRadius: '5px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
              className="hover-effect"
            >
              ⏭️ จบเทิร์น
            </button>
          )}
        </div>
      )}

      {/* ✅ ใส่ Snoop Overlay */}
      {!isEnemy && (
        <SnoopOverlay
          isOpen={gameState.snoopState.isOpen}
          cards={gameState.snoopState.cards}
          revealedIndexes={gameState.snoopState.revealedIndexes}
          ownerRole={gameState.snoopState.owner}
          myRole={myRole}
          onFlip={gameState.flipSnoopCard}
          onSelect={gameState.endSnoopSession}
        />
      )}

      {/* Battle Animation */}
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

        // ✅ ส่ง initiateSummon ไปให้ HandButton ใช้ตอน Drop การ์ด
        initiateSummon={gameState.initiateSummon}
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
            magicSlots={uiMagicSlots}
            avatarSlots={uiAvatarSlots}
            modSlots={uiModSlots}
            end1Cards={uiEnd1}
            end2Cards={uiEnd2}
            deckCards={uiDeck}
            avatarRotation={uiRotation}
            setMagicSlots={isEnemy ? () => { } : gameState.updateMagic}
            setAvatarSlots={gameState.updateAvatar}
            setModSlots={gameState.updateMods}
            setHandCards={gameState.updateHand}
            setEnd1Cards={gameState.updateEnd1}
            setEnd2Cards={gameState.updateEnd2}
            setDeckCards={gameState.updateDeck}
            setAvatarRotation={gameState.updateRotation}
            isEnemy={isEnemy}
            onAttack={startAttack}


            // ✅ ส่ง Props ของ Summon System เข้าไปที่ Center
            summonState={gameState.summonState}
            counterSummon={gameState.counterSummon}
            handCards={gameState.handCards} // ต้องใช้เพื่อเลือกการ์ดมา Counter

            startClash={gameState.startClash}
            submitEnemyCard={gameState.submitEnemyCard}
            submitSupportCard={gameState.submitSupportCard}
            submitEnemyCard2={gameState.submitEnemyCard2}

            myRole={myRole} //
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
            broadcast={gameState.broadcast}
            startSnoopSession={gameState.startSnoopSession}
          />
        </div>
      </div>
    </div>
  );
}

export default Bas;