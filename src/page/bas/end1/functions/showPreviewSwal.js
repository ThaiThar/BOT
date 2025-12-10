import Swal from "sweetalert2";
import { shuffleCards } from "./shuffleCards";   

export function showPreviewSwal(images, setDeckCards) {
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
                    .map(
                        (img) =>
                            `<img src="${img}" style="width: 100%; border-radius: 8px; border: 2px solid #000;" />`
                    )
                    .join("")}
            </div>
        `,
        confirmButtonText: "ตกลง",
        width: "800px",
    }).then(() => {

        if (typeof setDeckCards === "function") {
            //  เซ็ตการ์ดเข้าเด็คก่อน
            setDeckCards(images);

            //  สับหลังจากเซ็ตเสร็จ
            setTimeout(() => {
                shuffleCards(images, setDeckCards);
            }, 10);
        }
    });
}
