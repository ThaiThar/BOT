// src/components/Bas/hooks/modules/useSnoopModule.js
import { useState } from "react";
import Swal from "sweetalert2";

export function useSnoopModule({ broadcast, myRole, handCards, setHandCards, deckCards, setDeckCards }) {
  const [snoopState, setSnoopState] = useState({
    isOpen: false,
    owner: null,
    cards: [],
    revealedIndexes: [],
  });

  const startSnoopSession = (cardsToSnoop) => {
    const newState = {
      isOpen: true,
      owner: myRole,
      cards: cardsToSnoop,
      revealedIndexes: [],
    };
    setSnoopState(newState);
    broadcast("snoop_init", newState);
  };

  const flipSnoopCard = (index) => {
    setSnoopState((prev) => ({
      ...prev,
      revealedIndexes: [...prev.revealedIndexes, index],
    }));
    broadcast("snoop_flip", { index });
  };

  const endSnoopSession = (chosenCard, chosenIndex) => {
    setSnoopState((prev) => ({ ...prev, isOpen: false }));

    const count = snoopState.cards.length;
    let newHand = [...handCards];
    let actionType = "skip";

    if (chosenCard) {
      actionType = "pick";
      newHand.push(chosenCard);
      setHandCards(newHand);

      Swal.fire({
        title: "✅ เลือกการ์ดสำเร็จ",
        text: "นำการ์ดใบนี้ขึ้นมือแล้ว",
        imageUrl: chosenCard,
        imageWidth: 200,
        imageAlt: "Selected Card",
        background: "#111",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "↩️ ส่งกลับกอง",
        text: "คุณไม่ได้เลือกการ์ดใบใดเลย",
        icon: "info",
        background: "#111",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    const leftover = snoopState.cards.filter((_, i) => i !== chosenIndex);
    const updatedDeck = [...deckCards.slice(count), ...leftover];
    setDeckCards(updatedDeck);

    broadcast("snoop_end", {
      updatedDeck,
      action: actionType,
      chosenCard: chosenCard,
    });
  };

  return { snoopState, setSnoopState, startSnoopSession, flipSnoopCard, endSnoopSession };
}