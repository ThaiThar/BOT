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
  onShuffleDeck, // 🔥 เรียกสับการ์ดแบบ shared animation
}) {
  // ใช้สำหรับโชว์ปุ่ม reset/เลือกการ์ด 50 ใบ
  const [isLoaded, setIsLoaded] = useState(false);

  // ---------------------------------------------------------
  // 🔥 Reset ทั้งเกม + Reset ระบบเลือกไฟล์
  // ---------------------------------------------------------
  const resetLocal = () => {
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

  // ---------------------------------------------------------
  // 🔥 เลือกการ์ดจาก END1 / END2 → คืนเข้ามือ, กอง, END1, END2
  // ---------------------------------------------------------
  const returnToDeck = (img, index, zone) => {
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

  // ---------------------------------------------------------
  // UI Render
  // ---------------------------------------------------------
  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* 🔥 ปุ่มเลือกการ์ด หรือปุ่ม Reset */}
      {/* ---------------------------------------------------------------- */}
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

      <div className="enddeck">
        {/* ---------------------------------------------------------------- */}
        {/* 🟩 DECK (กองการ์ด) */}
        {/* ---------------------------------------------------------------- */}
        <div className="deck">
          <img src={myPic} className="deckSingleImg" alt="Back Card" />

          <div className="deck-buttom">
            <div className="deckcard">
              <div
                className="buttomdeckcard select"
                onClick={() => viewDeck(deckCards, setDeckCards, setHandCards)}
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
                onClick={() => onShuffleDeck()} // 🔥 sync สับการ์ด
              >
                สับการ์ด
              </div>

              <div
                className="buttomdeckcard snoop"
                onClick={() =>
                  snoopCards(deckCards, setDeckCards, setHandCards)
                }
              >
                สอดแนม
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 🟥 END1 */}
        {/* ---------------------------------------------------------------- */}
        <div className="end">
          <div className="endzone-cards">
            {end1Cards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                onClick={() => returnToDeck(img, i, "end")}
                alt={`End1-${i}`}
              />
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* 🟪 END2 */}
        {/* ---------------------------------------------------------------- */}
        <div className="end2">
          <div className="endzone-cards">
            {end2Cards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                onClick={() => returnToDeck(img, i, "end2")}
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
