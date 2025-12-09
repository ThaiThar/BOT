import Swal from "sweetalert2";

export function shuffleCards(deckCards, setDeckCards) {

    if (!deckCards || deckCards.length === 0) {
        Swal.fire("ไม่มีการ์ดในเด็คให้สับ!");
        return;
    }

    // คัดลอกกองเดิม
    let newDeck = [...deckCards];

    // Fisher-Yates shuffle (ดีที่สุด)
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }

    // อัปเดตกองไพ่
    setDeckCards(newDeck);

    Swal.fire({
        title: "สับการ์ดเรียบร้อย!",
        icon: "success",
        timer: 800,
    });
}
