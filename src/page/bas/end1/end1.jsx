import { useState } from "react";
import Swal from "sweetalert2";
import "./end1style.css";
import myPic from '../../../assets/backcard.jpg';

function End1() {
    const [deckCards, setDeckCards] = useState([]); // เก็บ 50 ใบ

    const handleChooseCards = (files) => {
        const selected = Array.from(files);

        // ⭐ ตรวจสอบจำนวนก่อน (ต้องได้ 50 ใบเท่านั้น)
        if (selected.length !== 50) {
            Swal.fire({
                icon: "error",
                title: "จำนวนการ์ดไม่ครบ!",
                text: `กรุณาเลือกให้ครบ 50 ใบ (ปัจจุบันเลือก ${selected.length} ใบ)`,
                confirmButtonText: "ตกลง",
            });
            return; // ❌ หยุด ไม่ต้องอ่านรูป ไม่ต้องเปิด Swal preview
        }

        // ⭐ ถ้าครบ 50 ใบ → อ่านไฟล์ตามปกติ
        Promise.all(
            selected.map(
                (file) =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    })
            )
        ).then((results) => {
            showPreviewSwal(results);
        });
    };


    const showPreviewSwal = (images) => {
        Swal.fire({
            title: `การ์ดที่เลือกทั้งหมด (${images.length} ใบ)`,
            html: `
                <div style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                ">
                    ${images
                    .map(img => `<img src="${img}" style="width: 100%; border-radius: 8px; border: 2px solid #000;" />`)
                    .join("")}
                </div>
            `,
            confirmButtonText: "ตกลง",
            width: "800px",
        }).then(() => {
            setDeckCards(images);  // ✔ เก็บ 50 ใบลงเด็ค
        });
    };

    const viewDeck = () => {
        if (deckCards.length === 0) {
            Swal.fire("ยังไม่มีการ์ดในเด็ค");
            return;
        }

        Swal.fire({
            title: `การ์ดในเด็คทั้งหมด (${deckCards.length} ใบ)`,
            html: `
                <div style="
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                ">
                    ${deckCards
                    .map(img => `<img src="${img}" style="width:100%; border-radius:8px; border:2px solid #000;" />`)
                    .join("")}
                </div>
            `,
            confirmButtonText: "ปิด",
            width: "800px",
        });
    };

    return (
        <div>

            {/* ปุ่มเลือกการ์ด */}
            <div style={{ marginBottom: "5px", textAlign: "center" }}>
                <label className="select-file-btn">
                    เลือกการ์ดทั้งหมด (สูงสุด 50 ใบ)
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={(e) => handleChooseCards(e.target.files)}
                    />
                </label>
            </div>

            <div className="enddeck">

                <div className="deck">

                    {/* ✔ แสดงแค่หลังการ์ดอย่างเดียว */}
                    <img src={myPic} className="deckSingleImg" alt="deck card" />

                    <div className="deck-buttom">
                        <div className="deckcard">
                            <div className="buttomdeckcard select" onClick={viewDeck}>เลือกการ์ด</div>
                            <div className="buttomdeckcard discard">ทิ้งการ์ด</div>
                            <div className="buttomdeckcard jua">จั่วการ์ด</div>
                            <div className="buttomdeckcard shuffle">สับการ์ด</div>
                            <div className="buttomdeckcard snoop">สอดแนม</div>
                            <div className="buttomdeckcard down">ใต้กอง</div>
                        </div>
                    </div>

                </div>
                        {/* นรก */}
                <div className="end">
                    <img src={myPic} className="deckSingleImg" alt="deck card" />
                    <div className="end-buttom"> 
                        <div className="deckcard">
                            <div className="buttomdeckcard end-select">เลือกการ์ด</div>
                            <div className="buttomdeckcard end-discard">ทิ้งการ์ด</div>
                        </div>
                    </div>

                </div>
                        {/* นรก2 */}
                <div className="end2">
                </div>
            </div>
        </div>
    );
}

export default End1;
