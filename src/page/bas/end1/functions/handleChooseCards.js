import Swal from "sweetalert2";

export function handleChooseCards(files, showPreviewSwal) {
    const selected = Array.from(files);

    if (selected.length !== 50) {
        Swal.fire("จำนวนไม่ครบ!");
        return;
    }

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
        showPreviewSwal(results);   // ✔ ส่งผลลัพธ์ให้ swal
    });
}
