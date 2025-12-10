import Swal from "sweetalert2";
import "./end1style.css";
import myPic from "../../../assets/backcard.jpg";

import { shuffleCards } from "./functions/shuffleCards";
import { handleChooseCards } from "./functions/handleChooseCards";
import { discardCard } from "./functions/discardCard";
import { viewDeck } from "./functions/viewDeck";
import { drawCard } from "./functions/drawCard";
import { showPreviewSwal } from "./functions/showPreviewSwal";

function End1({
  onDrawCard,
  deckCards,
  setDeckCards,
  end1Cards,
  setEnd1Cards,
  end2Cards,
  setEnd2Cards,
}) {

  const returnToDeck = (img, index, zone) => {
    Swal.fire({
      title: "เลือกการกระทำ",
      html: `
      <div style="margin-bottom:15px;">
          <img src="${img}" 
            style="width:180px; border-radius:10px; border:2px solid #fff;" />
      </div>

      <button class="zone-btn" id="btnDeck">📥 กลับเข้ากอง</button>
      <button class="zone-btn" id="btnEnd1">🔥 ไป END1</button>
      <button class="zone-btn" id="btnEnd2">💀 ไป END2</button>
    `,
      showConfirmButton: false,
      width: 300,
      background: "#222",
      color: "#fff",
    });

    setTimeout(() => {
      const removeFromZone = () => {
        if (zone === "end") {
          setEnd1Cards((prev) => prev.filter((_, i) => i !== index));
        }
        if (zone === "end2") {
          setEnd2Cards((prev) => prev.filter((_, i) => i !== index));
        }
      };

      document.getElementById("btnDeck").onclick = () => {
        removeFromZone();
        setDeckCards((prev) => [...prev, img]);
        Swal.close();
      };

      document.getElementById("btnEnd1").onclick = () => {
        removeFromZone();
        setEnd1Cards((prev) => [...prev, img]);
        Swal.close();
      };

      document.getElementById("btnEnd2").onclick = () => {
        removeFromZone();
        setEnd2Cards((prev) => [...prev, img]);
        Swal.close();
      };
    }, 20);
  };


  return (
    <div>
      <div style={{ marginBottom: "5px", textAlign: "center" }}>
        <label className="select-file-btn">
          เลือกการ์ดทั้งหมด (50 ใบ)
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) =>
              handleChooseCards(e.target.files, (imgs) =>
                showPreviewSwal(imgs, setDeckCards)
              )
            }
          />
        </label>
      </div>

      <div className="enddeck">
        <div className="deck">
          <img src={myPic} className="deckSingleImg" />

          <div className="deck-buttom">
            <div className="deckcard">

              <div className="buttomdeckcard select"
                onClick={() => viewDeck(deckCards)}>
                เลือกการ์ด
              </div>

              <div className="buttomdeckcard discard"
                onClick={() =>
                  discardCard(deckCards, setDeckCards, setEnd1Cards, setEnd2Cards)
                }>
                ทิ้งการ์ด
              </div>

              <div className="buttomdeckcard jua"
                onClick={() => drawCard(deckCards, setDeckCards, onDrawCard)}>
                จั่วการ์ด
              </div>

              <div className="buttomdeckcard shuffle"
                onClick={() => shuffleCards(deckCards, setDeckCards)}>
                สับการ์ด
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
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default End1;
