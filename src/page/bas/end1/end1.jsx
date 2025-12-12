import Swal from "sweetalert2";
import "./end1style.css";
import myPic from "../../../assets/backcard.jpg";

import { viewDeck } from "./functions/viewDeck";
import { drawCard } from "./functions/drawCard";
import { showPreviewSwal } from "./functions/showPreviewSwal";
import { snoopCards } from "./functions/snoopCards";
import { handleChooseCards } from "./functions/handleChooseCards";

import { useState } from "react";

function End1({
  onDrawCard,
  deckCards,
  setDeckCards,
  end1Cards,
  setEnd1Cards,
  end2Cards,
  setEnd2Cards,
  handCards,
  setHandCards,
  resetGame,
  onShuffleDeck,
  isEnemy,
  broadcast,
  startSnoopSession,
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  const resetLocal = () => {
    if (isEnemy) return;

    Swal.fire({
      title: "รีเซตเกมใหม่?",
      text: "การ์ดทุกใบจะหายหมด คุณต้องเลือกการ์ดใหม่ทั้งหมด",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "รีเซตเลย",
      cancelButtonText: "ยกเลิก",
    }).then((res) => {
      if (res.isConfirmed) {
        resetGame();
        setIsLoaded(false);
        Swal.fire("รีเซตสำเร็จ!", "", "success");
      }
    });
  };

  // ✅✅✅ อัปเดตฟังก์ชันนี้: ถ้าเป็นศัตรูให้ดูรูปได้อย่างเดียว ✅✅✅
  const returnToDeck = (img, index, zone) => {
    // 1. ถ้าเป็นฝ่ายศัตรู ให้แสดง pop-up ดูรูปภาพขยายใหญ่ (View Only)
    if (isEnemy) {
      Swal.fire({
        imageUrl: img,
        imageHeight: "80vh", // กำหนดความสูงให้เหมาะสม (80% ของจอ)
        imageAlt: "Card Preview",
        background: "transparent", // พื้นหลังใสเพื่อให้ดูเด่น
        showConfirmButton: false, // ไม่ต้องมีปุ่ม OK
        showCloseButton: true, // แสดงปุ่มกากบาทปิด
        backdrop: `rgba(0,0,0,0.8)`, // ฉากหลังมืดทึบ
      });
      return; // จบการทำงานฟังก์ชัน ไม่ทำส่วนข้างล่างต่อ
    }

    // 2. ถ้าเป็นฝ่ายเรา ให้แสดงเมนูจัดการการ์ดตามปกติ
    Swal.fire({
      title: "เลือกการกระทำ",
      html: `
        <div style="margin-bottom:15px; text-align:center;">
          <img src="${img}" style="width:180px;border-radius:10px;border:2px solid #fff;" />
        </div>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <button class="zone-btn" id="btnHand">🖐 คืนเข้ามือ</button>
          <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง</button>
          <button class="zone-btn" id="btnEnd1">🔥 ไป END1</button>
          <button class="zone-btn" id="btnEnd2">💀 ไป END2</button>
        </div>
      `,
      background: "#222",
      color: "#fff",
      width: 320,
      showConfirmButton: false,
      didOpen: () => {
        const modal = Swal.getHtmlContainer();

        const removeCard = () => {
          if (zone === "end") {
            setEnd1Cards((prev) => prev.filter((_, i) => i !== index));
          } else {
            setEnd2Cards((prev) => prev.filter((_, i) => i !== index));
          }
        };

        modal.querySelector("#btnHand").onclick = () => {
          removeCard();
          setHandCards((p) => [...p, img]);
          Swal.close();
        };

        modal.querySelector("#btnDeck").onclick = () => {
          removeCard();
          setDeckCards((p) => [...p, img]);
          Swal.close();
        };

        modal.querySelector("#btnEnd1").onclick = () => {
          removeCard();
          setEnd1Cards((p) => [...p, img]);
          Swal.close();
        };

        modal.querySelector("#btnEnd2").onclick = () => {
          removeCard();
          setEnd2Cards((p) => [...p, img]);
          Swal.close();
        };
      },
    });
  };

  return (
    <div>
      {/* ส่วนเลือกไฟล์ / Reset (แสดงเฉพาะฝั่งเรา) */}
      {!isEnemy && (
        <div style={{ marginBottom: "5px", textAlign: "center" }}>
          {!isLoaded ? (
            <label className="select-file-btn">
              เลือกการ์ดทั้งหมด (50 ใบ)
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  handleChooseCards(e.target.files, (imgs) => {
                    showPreviewSwal(imgs, setDeckCards);
                    setIsLoaded(true);
                  });
                  e.target.value = null;
                }}
              />
            </label>
          ) : (
            <button className="select-file-btn" onClick={resetLocal}>
              🔄 รีเซตเกมใหม่
            </button>
          )}
        </div>
      )}

      <div className="enddeck">
        <div className="deck">
          <img src={myPic} className="deckSingleImg" alt="Back Card" />

          {/* แผงควบคุม Deck (แสดงเฉพาะฝั่งเรา) */}
          {!isEnemy && (
            <div className="deck-buttom">
              <div className="deckcard">
                <div
                  className="buttomdeckcard select"
                  onClick={() =>
                    viewDeck(deckCards, setDeckCards, setHandCards)
                  }
                >
                  เลือกการ์ด
                </div>

                <div
                  className="buttomdeckcard discard"
                  onClick={() => {
                    if (deckCards.length === 0)
                      return Swal.fire("ไม่มีการ์ดในกอง");
                    Swal.fire("ฟังก์ชัน discard ยังไม่เปิดใช้");
                  }}
                >
                  ทิ้งการ์ด
                </div>

                <div
                  className="buttomdeckcard jua"
                  onClick={() => drawCard(deckCards, setDeckCards, onDrawCard)}
                >
                  จั่วการ์ด
                </div>

                <div
                  className="buttomdeckcard shuffle"
                  onClick={() => onShuffleDeck()}
                >
                  สับการ์ด
                </div>

                {/* ✅ ใส่ broadcast กลับเข้าไปเพื่อให้สอดแนมทำงานได้ */}
                <div
                  className="buttomdeckcard snoop"
                  onClick={() =>
                    snoopCards(deckCards, startSnoopSession, broadcast)
                  }
                >
                  สอดแนม
                </div>
              </div>
            </div>
          )}
        </div>

        {/* END1 Zone */}
        <div className="end">
          <div className="endzone-cards">
            {end1Cards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                onClick={() => returnToDeck(img, i, "end")}
                // ✅ แก้ไข: ให้เป็น pointer เสมอ เพื่อให้รู้ว่ากดดูได้
                style={{ cursor: "pointer" }}
                alt={`End1-${i}`}
              />
            ))}
          </div>
        </div>

        {/* END2 Zone */}
        <div className="end2">
          <div className="endzone-cards">
            {end2Cards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                onClick={() => returnToDeck(img, i, "end2")}
                // ✅ แก้ไข: ให้เป็น pointer เสมอ
                style={{ cursor: "pointer" }}
                alt={`End2-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default End1;