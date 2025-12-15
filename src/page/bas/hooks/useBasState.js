// src/components/Bas/hooks/useBasState.js
import { useState, useEffect } from "react"; // ✅ เพิ่ม useState เข้ามา
import Swal from "sweetalert2";

// Import Modules
import { useBasSocket } from "./modules/useBasSocket";
import { useDiceModule } from "./modules/useDiceModule";
import { useBattleAnimModule } from "./modules/useBattleAnimModule";
import { useStartGameModule } from "./modules/useStartGameModule";
import { useBoardModule } from "./modules/useBoardModule";
import { useSnoopModule } from "./modules/useSnoopModule";
import { useSummonSystem } from "./modules/useSummonSystem"; // ✅ Import

// ✅ Import Turn Module
import { useTurnModule, showStartPopup } from "./modules/useTurnModule";

export function useBasState({ socket, roomId, myRole, enemyRole, isEnemy }) {
  // 1. Init Socket Broadcast
  const { broadcast } = useBasSocket({ socket, roomId, myRole, isEnemy });
  const [enemyHandCount, setEnemyHandCount] = useState(0);

  // 2. Load Sub-Modules
  const turnMod = useTurnModule({ broadcast, myRole, enemyRole });
  const { isMyTurn } = turnMod;

  const diceMod = useDiceModule({ broadcast });
  const battleMod = useBattleAnimModule({ broadcast });
  const startMod = useStartGameModule();
  const boardMod = useBoardModule({ broadcast, isEnemy });
  const snoopMod = useSnoopModule({
    broadcast,
    myRole,
    handCards: boardMod.handCards,
    setHandCards: boardMod.setHandCards,
    deckCards: boardMod.deckCards,
    setDeckCards: boardMod.setDeckCards
  });

  // เรียกใช้ Hook Summon
  const summonMod = useSummonSystem({
    broadcast,
    myRole,
    setAvatarSlots: boardMod.setAvatarSlots,
    setHandCards: boardMod.setHandCards,
    setEnd1Cards: boardMod.setEnd1Cards,
    setEnemyEnd1: boardMod.setEnemyEnd1,
    handCards: boardMod.handCards,
    magicSlots: boardMod.magicSlots,
    setMagicSlots: boardMod.setMagicSlots

  });

  // ----------------------------------------------------
  // 🛡️ ACTION GUARDS
  // ----------------------------------------------------

  const safeRollDice = () => {
    if (!isMyTurn) {
      Swal.fire({ icon: 'warning', title: 'ยังไม่ใช่ตาของคุณ!', timer: 1500, showConfirmButton: false, toast: true });
      return;
    }
    diceMod.rollDice();
  };

  const safeShuffleDeck = () => {
    if (!isMyTurn) return;
    boardMod.onShuffleDeck();
  };

  const safeStartSnoop = (cards) => {
    if (!isMyTurn) {
      Swal.fire({ icon: 'warning', title: 'รอเทิร์นของคุณก่อน!', timer: 1500, showConfirmButton: false, toast: true });
      return;
    }
    snoopMod.startSnoopSession(cards);
  };

  // ----------------------------------------------------
  // ⚙️ HELPERS
  // ----------------------------------------------------

  const createUpdater = (setter, actionType) => (fn) => {
    setter((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      broadcast(actionType, next);
      return next;
    });
  };

  const createSafeUpdater = (setter, actionType) => (fn) => {
    if (!isMyTurn) {
      Swal.fire({
        icon: 'warning',
        title: 'รอเทิร์นของคุณ!',
        text: 'ไม่สามารถทำรายการในเทิร์นฝ่ายตรงข้ามได้',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }
    setter((prev) => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      broadcast(actionType, next);
      return next;
    });
  };

  // ----------------------------------------------------
  // 🛡️ APPLY UPDATERS
  // ----------------------------------------------------

  const updateAvatar = createSafeUpdater(boardMod.setAvatarSlots, "update_avatar");
  const updateMods = createSafeUpdater(boardMod.setModSlots, "update_mods");
  const updateEnd1 = createSafeUpdater(boardMod.setEnd1Cards, "update_end1");
  const updateEnd2 = createSafeUpdater(boardMod.setEnd2Cards, "update_end2");
  const updateDeck = createSafeUpdater(boardMod.setDeckCards, "update_deck");
  const updateRotation = createSafeUpdater(boardMod.setAvatarRotation, "update_rotation");
  const updateHand = createSafeUpdater(boardMod.setHandCards, "update_hand");
  const updateMagic = createSafeUpdater(boardMod.setMagicSlots, "update_magic");

  const updateStartCards = createUpdater(startMod.setStartCards, "update_start_cards");
  const updateStartImages = createUpdater(startMod.setStartImages, "update_start_images");
  const updateStartStage = createUpdater(startMod.setStartStage, "update_start_stage");

  const resetGame = () => {
    boardMod.resetBoard();
    updateMagic([null, null, null, null]);
  };

  // ----------------------------------------------------
  // 🎧 CENTRAL SOCKET LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    if (!isEnemy && boardMod.handCards) {
      broadcast("update_hand_count", boardMod.handCards.length);
    }
  }, [boardMod.handCards, isEnemy]); // ทำงานเมื่อการ์ดเราเปลี่ยน
  useEffect(() => {
    if (!socket) return;
    const listener = (data) => {
      try {
        if (data.sender !== enemyRole && data.sender !== myRole) return;

        switch (data.actionType) {
          case "initial_turn":
            turnMod.setCurrentTurn(data.payload);
            showStartPopup(data.payload, myRole);
            break;

          case "change_turn":
            turnMod.setCurrentTurn(data.payload);
            if (data.payload === myRole) {
              Swal.fire({
                title: "⚔️ ตาของคุณแล้ว!",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                position: 'center'
              });
            }
            break;

          // ✅ 3. เพิ่ม Case รับจำนวนการ์ดจากศัตรู
          case "update_hand_count":
            if (data.sender === enemyRole) {
              setEnemyHandCount(data.payload);
            }
            break;
          // Board & Game Logic
          case "update_magic": boardMod.setEnemyMagicSlots(data.payload); break;
          case "update_avatar": boardMod.setEnemyAvatarSlots(data.payload); break;
          case "update_mods": boardMod.setEnemyModSlots(data.payload); break;
          case "update_end1": boardMod.setEnemyEnd1(data.payload); break;
          case "update_end2": boardMod.setEnemyEnd2(data.payload); break;
          case "update_rotation": boardMod.setEnemyRotation(data.payload); break;
          case "update_deck": boardMod.setEnemyDeck(data.payload); break;
          case "shuffle_start": boardMod.setIsShuffling(true); break;
          case "shuffle_done":
            boardMod.setIsShuffling(false);
            boardMod.setEnemyDeck(data.payload);
            break;
          case "update_start_cards": startMod.setEnemyStartCards(data.payload); break;
          case "update_start_images": startMod.setEnemyStartImages(data.payload); break;
          case "update_start_stage": startMod.setEnemyStartStage(data.payload); break;
          case "roll_dice": diceMod.setDiceState(data.payload); break;

          case "update_enemy_after_attack": {
            if (!isEnemy) {
              const { enemyEnd1, enemyAvatar, enemyMods, attackerIndex } = data.payload;
              updateEnd1(enemyEnd1);
              updateAvatar(enemyAvatar);
              updateMods(enemyMods);
              boardMod.setEnemyRotation((prev) => {
                const next = [...prev];
                next[attackerIndex] = 90;
                return next;
              });
            }
            break;
          }
          case "receive_base_damage": {
            const { newCards, hitCardImage } = data.payload;
            startMod.setStartCards(newCards);
            Swal.fire({
              title: "💥 ฐานทัพถูกโจมตี!",
              text: "การ์ดของคุณถูกเปิดเผย",
              imageUrl: hitCardImage,
              imageHeight: 300,
              timer: 3000,
              showConfirmButton: false,
              background: "#222",
              color: "#fff",
            });
            break;
          }
          case "trigger_battle_anim":
            battleMod.setBattleAnim({
              isOpen: true,
              attackerImg: data.payload.attackerImg,
              defenderImg: data.payload.defenderImg,
            });
            break;
          case "game_over": {
            Swal.fire({ title: "พ่ายแพ้! 💀", icon: "error" });
            break;
          }
          case "snoop_init": snoopMod.setSnoopState(data.payload); break;
          case "snoop_flip":
            snoopMod.setSnoopState((prev) => ({
              ...prev,
              revealedIndexes: [...prev.revealedIndexes, data.payload.index],
            }));
            break;
          case "snoop_end": {
            snoopMod.setSnoopState((prev) => ({ ...prev, isOpen: false }));
            if (data.payload.updatedDeck) {
              boardMod.setEnemyDeck(data.payload.updatedDeck);
            }
            const { action } = data.payload;
            if (action === "pick") {
              Swal.fire({ title: "👁️ ฝ่ายตรงข้ามเลือกการ์ด!", icon: 'warning', timer: 1500 });
            } else {
              Swal.fire({ title: "👁️ ฝ่ายตรงข้ามไม่เลือก", icon: "info", timer: 1500 });
            }
            break;
          }

          // ✅✅✅ SUMMON SYSTEM (CLEANED) ✅✅✅
          case "summon_update":
            summonMod.setSummonState(data.payload);
            break;

          case "summon_reset":
            summonMod.setSummonState(data.payload);
            break;

          // ✅✅✅ แก้ไขตรงนี้ครับ ✅✅✅
          case "summon_finish":

            if (data.sender !== myRole) {
              summonMod.resolveBattle(data.payload);
            }
            break;


          default: break;
        }
      } catch (err) {
        console.error("Socket Error:", err);
      }
    };

    socket.on("receive_action", listener);
    return () => socket.off("receive_action", listener);
  }, [socket, enemyRole, myRole, isEnemy, boardMod.deckCards, boardMod.handCards, boardMod.magicSlots, snoopMod.snoopState]);

  // ----------------------------------------------------
  // 📦 EXPORT
  // ----------------------------------------------------
  return {
    ...turnMod,
    ...boardMod,
    onShuffleDeck: safeShuffleDeck,

    updateHand,
    updateMagic,
    updateAvatar,
    updateMods,
    updateEnd1,
    updateEnd2,
    updateDeck,
    updateRotation,
    resetGame,

    ...startMod,
    updateStartCards,
    updateStartImages,
    updateStartStage,

    broadcast,
    ...battleMod,

    ...diceMod,
    rollDice: safeRollDice,

    ...snoopMod,
    startSnoopSession: safeStartSnoop,

    // ✅ Summon Module
    ...summonMod,
    enemyHandCount,
  };
}