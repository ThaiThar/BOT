import Swal from "sweetalert2";
import "./end1style.css";
import myPic from "../../../assets/backcard.jpg";

import { shuffleCards } from "./functions/shuffleCards";
import { handleChooseCards } from "./functions/handleChooseCards";
import { discardCard } from "./functions/discardCard";
import { viewDeck } from "./functions/viewDeck";
import { drawCard } from "./functions/drawCard";
import { showPreviewSwal } from "./functions/showPreviewSwal";
import { snoopCards } from "./functions/snoopCards";

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
}) {

  // 🔥 บอกว่ามีการเลือกครบ 50 ใบแล้วหรือยัง
  const [isLoaded, setIsLoaded] = useState(false);

  // 🔥 รีเซตเกมทั้งหมด
  const resetLocal = () => {
    Swal.fire({
      title: "รีเซตเกมใหม่?",
      text: "การ์ดทุกใบจะถูกล้างทั้งหมด",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่ รีเซตเลย",
      cancelButtonText: "ยกเลิก"
    }).then((res) => {
      if (res.isConfirmed) {
        resetGame();        // ✔ รีเซตทุก state ใน Bas.jsx
        setIsLoaded(false); // ✔ กลับเป็นเลือกการ์ดใหม่
        
        Swal.fire("รีเซตสำเร็จ!", "", "success");
      }
    });
  };

  // 🔥 ย้ายการ์ดกลับไป zone ต่างๆ (ปรับปรุงใหม่ใช้ didOpen)
  const returnToDeck = (img, index, zone) => {
    Swal.fire({
      title: "เลือกการกระทำ",
      html: `
      <div style="margin-bottom:15px; text-align:center;">
        <img src="${img}" 
          style="width:180px; border-radius:10px; border:2px solid #fff;" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 5px;">
        <button class="zone-btn" id="btnHand">🖐 คืนเข้ามือ</button>
        <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง</button>
        <button class="zone-btn" id="btnEnd1">🔥 ไป END1</button>
        <button class="zone-btn" id="btnEnd2">💀 ไป END2</button>
      </div>
    `,
      showConfirmButton: false,
      width: 300,
      background: "#222",
      color: "#fff",
      // ✅ ใช้ didOpen แทน setTimeout เพื่อความเสถียร
      didOpen: () => {
        const modal = Swal.getHtmlContainer();
        
        const removeFromZone = () => {
          if (zone === "end") {
            setEnd1Cards((prev) => prev.filter((_, i) => i !== index));
          } else if (zone === "end2") {
            setEnd2Cards((prev) => prev.filter((_, i) => i !== index));
          }
        };

        // ผูก Event Listener กับปุ่มต่างๆ
        modal.querySelector("#btnHand").addEventListener("click", () => {
          removeFromZone();
          setHandCards((prev) => [...prev, img]);
          Swal.close();
        });

        modal.querySelector("#btnDeck").addEventListener("click", () => {
          removeFromZone();
          setDeckCards((prev) => [...prev, img]);
          Swal.close();
        });

        modal.querySelector("#btnEnd1").addEventListener("click", () => {
          removeFromZone();
          setEnd1Cards((prev) => [...prev, img]);
          Swal.close();
        });

        modal.querySelector("#btnEnd2").addEventListener("click", () => {
          removeFromZone();
          setEnd2Cards((prev) => [...prev, img]);
          Swal.close();
        });
      }
    });
  };


  return (
    <div>

      {/* 🔥 ปุ่มเลือกการ์ด หรือ ปุ่ม Reset */}
      <div style={{ marginBottom: "5px", textAlign: "center" }}>
        {isLoaded ? (
          <button className="select-file-btn" onClick={resetLocal}>
            🔄 รีเซตเกมใหม่
          </button>

        ) : (
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
                  setIsLoaded(true); // 🔥 หลังเลือกครบ เปลี่ยนเป็นปุ่ม reset
                });
                // ✅ เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้กรณี Reset
                e.target.value = null;
              }}
            />
          </label>
        )}
      </div>

      <div className="enddeck">
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
                onClick={() =>
                  discardCard(deckCards, setDeckCards, setEnd1Cards, setEnd2Cards)
                }
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
                onClick={() => shuffleCards(deckCards, setDeckCards)}
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

        {/* END1 */}
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

        {/* END2 */}
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