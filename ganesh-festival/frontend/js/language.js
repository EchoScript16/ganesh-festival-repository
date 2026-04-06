function setLanguage(lang) {
    document.querySelectorAll("[data-en]").forEach(el => {
        el.textContent = el.getAttribute("data-" + lang);
    });

    localStorage.setItem("lang", lang);
}

function loadLanguage() {
    const savedLang = localStorage.getItem("lang") || "en";

    document.querySelectorAll("[data-en]").forEach(el => {
        el.textContent = el.getAttribute("data-" + savedLang);
    });

    const select = document.getElementById("langSelect");
    if (select) select.value = savedLang;
}

document.addEventListener("DOMContentLoaded", loadLanguage);