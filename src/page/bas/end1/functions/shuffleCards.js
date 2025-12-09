import Swal from "sweetalert2";
import "./HinduGodMode.css"; // Import CSS ตัวใหม่

export function shuffleCards(deckCards, setDeckCards) {
    if (!deckCards || deckCards.length === 0) return;

    Swal.fire({
        title: '<span style="color:#ffaa00; text-shadow: 0 0 10px #ffaa00;">✨ MYSTIC SHUFFLE ✨</span>',
        html: `
            <div class="hindu-wrapper">
                <div class="hindu-container">
                    <!-- กองต้นทาง -->
                    <div class="stack source-stack"></div>
                    
                    <!-- กองปลายทาง พร้อม Shockwaves -->
                    <div class="stack target-stack">
                        <div class="shockwave s1"></div>
                        <div class="shockwave s2"></div>
                        <div class="shockwave s3"></div>
                    </div>

                    <!-- ไพ่ที่บิน พร้อม Trail -->
                    <div class="packet p1">
                        <div class="trail"></div>
                    </div>
                    <div class="packet p2">
                        <div class="trail"></div>
                    </div>
                    <div class="packet p3">
                        <div class="trail"></div>
                    </div>
                </div>
            </div>
            <div style="color: #888; margin-top: 10px; font-size: 0.8em; letter-spacing: 2px;">CHANNELING ENERGY...</div>
        `,
        background: "#050505 url('https://www.transparenttextures.com/patterns/stardust.png')", // เพิ่ม Texture พื้นหลัง
        color: "#ffaa00",
        showConfirmButton: false,
        allowOutsideClick: false,
        width: 500, // กว้างขึ้นเพื่อความอลังการ
        padding: "2em",
        backdrop: `
            rgba(0,0,0,0.9)
            center left
            no-repeat
        `,
        
        didOpen: () => {
            // แนะนำ: ใส่เสียง Effect ที่นี่
            // const audio = new Audio('/assets/sounds/card-shuffle-magic.mp3');
            // audio.play();
        },

        willClose: () => {
            // Clean up DOM เพื่อความปลอดภัย
            const wrapper = document.querySelector(".hindu-wrapper");
            if(wrapper) wrapper.remove();
        }
    });

    // Timing ปรับให้แมทช์กับ Animation loop (1.4s * 2 loops + buffer)
    setTimeout(() => {
        // Fisher-Yates Shuffle Logic
        let newDeck = [...deckCards];
        for (let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        setDeckCards(newDeck);

        Swal.fire({
            title: "DESTINY IS SET",
            text: "สำรับไพ่ถูกลิขิตแล้ว",
            icon: "success",
            iconColor: "#ffaa00",
            background: "#050505",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false,
            backdrop: `rgba(0,0,0,0.8)`
        });
    }, 3200); // เพิ่มเวลาให้โชว์ความอลังการนานขึ้นนิดนึง
}