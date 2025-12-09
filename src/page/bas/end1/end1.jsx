import { useState } from "react";
import Swal from "sweetalert2";
import "./end1style.css";
import myPic from "../../../assets/backcard.jpg";

import { shuffleCards } from "./functions/shuffleCards";
import { handleChooseCards } from "./functions/handleChooseCards";
import { discardCard } from "./functions/discardCard";
import { viewDeck } from "./functions/viewDeck";
import { drawCard } from "./functions/drawCard";
import { showPreviewSwal } from "./functions/showPreviewSwal";
import { returnToDeck } from "./functions/returnToDeck";

function End1({ onDrawCard }) {
  const [deckCards, setDeckCards] = useState([]);
  const [endCards, setEndCards] = useState([]);
  const [end2Cards, setEnd2Cards] = useState([]);

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
          <img src={myPic} className="deckSingleImg" alt="deck card" />

          <div className="deck-buttom">
            <div className="deckcard">
              {/* ดูเด็ค */}
              <div
                className="buttomdeckcard select"
                onClick={() => viewDeck(deckCards)}
              >
                เลือกการ์ด
              </div>

              {/* ทิ้งการ์ด */}
              <div
                className="buttomdeckcard discard"
                onClick={() =>
                  discardCard(
                    deckCards,
                    setDeckCards,
                    setEndCards,
                    setEnd2Cards
                  )
                }
              >
                ทิ้งการ์ด
              </div>

              {/* จั่วการ์ด */}
              <div
                className="buttomdeckcard jua"
                onClick={() => drawCard(deckCards, setDeckCards, onDrawCard)}
              >
                จั่วการ์ด
              </div>

              {/* สับการ์ด */}
              <div
                className="buttomdeckcard shuffle"
                onClick={() => shuffleCards(deckCards, setDeckCards)}
              >
                สับการ์ด
              </div>

              <div className="buttomdeckcard snoop">สอดแนม</div>
              <div className="buttomdeckcard down">ใต้กอง</div>
            </div>
          </div>
        </div>

        <div className="end">
          <div className="endzone-cards">
            {endCards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                style={{ "--r": Math.random() }}
                onClick={() =>
                  returnToDeck(
                    img,
                    i,
                    "end",
                    deckCards,
                    setDeckCards,
                    endCards,
                    setEndCards,
                    end2Cards,
                    setEnd2Cards
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="end2">
          <div className="endzone-cards">
            {end2Cards.map((img, i) => (
              <img
                key={i}
                src={img}
                className="endcard-img"
                style={{ "--r": Math.random() }}
                onClick={() =>
                  returnToDeck(
                    img,
                    i,
                    "end2",
                    deckCards,
                    setDeckCards,
                    endCards,
                    setEndCards,
                    end2Cards,
                    setEnd2Cards
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default End1;
