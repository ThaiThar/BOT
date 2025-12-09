import Swal from "sweetalert2";

export function returnToDeck(
  img,         // รูปที่คลิก
  index,       // index ในกองนั้น
  from,        // "end" หรือ "end2"
  deckCards,
  setDeckCards,
  endCards,
  setEndCards,
  end2Cards,
  setEnd2Cards
) {
  Swal.fire({
    title: "นำการ์ดกลับเข้ากอง?",
    html: `<img src="${img}" style="width:200px; border-radius:10px;" />`,
    showCancelButton: true,
    confirmButtonText: "นำกลับเข้ากอง (ท้ายสุด)",
    cancelButtonText: "ปิด",
  }).then((res) => {
    if (!res.isConfirmed) return;

    // ลบออกจาก end หรือ end2
    if (from === "end") {
      const newEnd = [...endCards];
      newEnd.splice(index, 1);
      setEndCards(newEnd);
    } else {
      const newEnd2 = [...end2Cards];
      newEnd2.splice(index, 1);
      setEnd2Cards(newEnd2);
    }

    // ใส่เข้ากอง deck ท้ายสุด
    setDeckCards([...deckCards, img]);

    Swal.fire({
      title: "สำเร็จ!",
      html: `<img src="${img}" style="width:180px; border-radius:10px;" />`,
      icon: "success",
      timer: 1400,
    });
  });
}
