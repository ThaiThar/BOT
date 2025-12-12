import React, { useState, useEffect } from "react";
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
  // =================================================
  // 🧠 Local State
  // =================================================
  const [enemyHandCount, setEnemyHandCount] = useState(0);

  // =================================================
  // 🔄 Turn Control
  // =================================================
  const { isMyTurn, endTurn } = gameState;

  // =================================================
  // ⚔️ Battle System
  // =================================================
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

  // =================================================
  // 📤 ส่งจำนวนการ์ดในมือของเราไปหาอีกฝั่ง
  // =================================================
  useEffect(() => {
    if (isEnemy) return;
    if (!gameState?.broadcast) return;
    if (!Array.isArray(gameState.handCards)) return;

    gameState.broadcast({
      type: "UPDATE_HAND_COUNT",
      count: gameState.handCards.length,
    });
  }, [gameState.handCards, isEnemy, gameState.broadcast]);

  // =================================================
  // 📥 รับจำนวนการ์ดในมือของฝ่ายตรงข้าม
  // =================================================
  useEffect(() => {
    if (!gameState?.onBroadcast) return;

    const unsubscribe = gameState.onBroadcast((msg) => {
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "UPDATE_HAND_COUNT") {
        setEnemyHandCount(Number(msg.count || 0));
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [gameState]);

  // =================================================
  // 🧩 UI Data Mapping (แยกฝั่งเรา / ฝั่งศัตรู)
  // =================================================
  const uiAvatarSlots = isEnemy
    ? gameState.enemyAvatarSlots
    : gameState.avatarSlots;

  const uiModSlots = isEnemy
    ? gameState.enemyModSlots
    : gameState.modSlots;

  const uiEnd1 = isEnemy
    ? gameState.enemyEnd1
    : gameState.end1Cards;

  const uiEnd2 = isEnemy
    ? gameState.enemyEnd2
    : gameState.end2Cards;

  const uiRotation = isEnemy
    ? gameState.enemyRotation
    : gameState.avatarRotation;

  const uiDeck = isEnemy
    ? gameState.enemyDeck
    : gameState.deckCards;

  const uiMagicSlots = isEnemy
    ? gameState.enemyMagicSlots
    : gameState.magicSlots;

  // =================================================
  // ⚔️ Battle Center Card (slot "battle")
  // =================================================
  const battleCenterCard =
    uiAvatarSlots && uiAvatarSlots["battle"]
      ? uiAvatarSlots["battle"]
      : null;

  // =================================================
  // 🃏 Start Zone
  // =================================================
  const uiStartCards = isEnemy
    ? gameState.enemyStartCards
    : gameState.startCards;

  const uiStartImages = isEnemy
    ? gameState.enemyStartImages
    : gameState.startImages;

  const uiStartStage = isEnemy
    ? gameState.enemyStartStage
    : gameState.startStage;

  const setStartCards = isEnemy ? () => {} : gameState.updateStartCards;
  const setStartImages = isEnemy ? () => {} : gameState.updateStartImages;
  const setStartStage = isEnemy ? () => {} : gameState.updateStartStage;

  const handleDrawCard = (card) => {
    gameState.updateHand((prev) => [...prev, card]);
  };

  // =================================================
  // 🧩 RENDER
  // =================================================
  return (
    <div
      className="fillborad"
      style={{
        opacity: !isMyTurn && !isEnemy ? 0.85 : 1,
        transition: "all 0.3s ease",
      }}
    >
      {/* ================= TURN BAR ================= */}
      {!isEnemy && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            marginBottom: "10px",
            padding: "10px",
            background: "rgba(0,0,0,0.5)",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              color: isMyTurn ? "#2ecc71" : "#e74c3c",
              fontWeight: "bold",
              fontSize: "1.2rem",
              textShadow: "1px 1px 2px black",
            }}
          >
            {isMyTurn
              ? "🟢 ตาของคุณ (Your Turn)"
              : "⏳ รอฝ่ายตรงข้าม (Opponent's Turn)"}
          </div>

          {isMyTurn && (
            <button
              onClick={endTurn}
              className="hover-effect"
              style={{
                backgroundColor: "#e67e22",
                color: "white",
                border: "2px solid #d35400",
                borderRadius: "5px",
                padding: "8px 20px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
              }}
            >
              ⏭️ จบเทิร์น
            </button>
          )}
        </div>
      )}

      {/* ================= OVERLAYS ================= */}
      {!isEnemy && (
        <>
          <SnoopOverlay
            isOpen={gameState.snoopState.isOpen}
            cards={gameState.snoopState.cards}
            revealedIndexes={gameState.snoopState.revealedIndexes}
            ownerRole={gameState.snoopState.owner}
            myRole={myRole}
            onFlip={gameState.flipSnoopCard}
            onSelect={gameState.endSnoopSession}
          />

          <BattleClash
            isOpen={gameState.battleAnim.isOpen}
            attackerImg={gameState.battleAnim.attackerImg}
            defenderImg={gameState.battleAnim.defenderImg}
            onAnimationComplete={gameState.closeBattleAnim}
          />
        </>
      )}

      <ShuffleEffect isShuffling={gameState.isShuffling} />

      {/* ================= HAND BUTTON ================= */}
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
        enemyHandCount={isEnemy ? 0 : enemyHandCount}
        initiateSummon={gameState.initiateSummon}
      />

      {/* ================= BATTLE CENTER ================= */}
      <div className="main-bas">
        <Battle battleCenterCard={battleCenterCard} />
      </div>

      {/* ================= MAIN ZONES ================= */}
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
            summonState={gameState.summonState}
            handCards={gameState.handCards}
            startClash={gameState.startClash}
            submitEnemyCard={gameState.submitEnemyCard}
            submitSupportCard={gameState.submitSupportCard}
            submitEnemyCard2={gameState.submitEnemyCard2}
            myRole={myRole}
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
