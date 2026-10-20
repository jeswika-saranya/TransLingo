"use strict";

const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const sourceText = document.getElementById("sourceText");
const translationOutput = document.getElementById("translationOutput");
const characterCount = document.getElementById("characterCount");
const toast = document.getElementById("toast");
const translateButton = document.getElementById("translateButton");
const outputStatus = document.getElementById("outputStatus");

const sourceFlag = document.getElementById("sourceFlag");
const targetFlag = document.getElementById("targetFlag");

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

const lightThemeButton = document.getElementById("lightTheme");
const darkThemeButton = document.getElementById("darkTheme");

const languageFlags = {
    en: "🇺🇸",
    hi: "🇮🇳",
    te: "🇮🇳",
    ta: "🇮🇳",
    kn: "🇮🇳",
    ml: "🇮🇳",
    bn: "🇮🇳",
    mr: "🇮🇳",
    gu: "🇮🇳",
    es: "🇪🇸",
    fr: "🇫🇷",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    ja: "🇯🇵",
    ko: "🇰🇷",
    zh: "🇨🇳",
    ar: "🇸🇦",
    ru: "🇷🇺"
};

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("visible");
    }, 3000);
}

function updateCharacterCount() {
    characterCount.textContent = `${sourceText.value.length}/5000`;
}

function updateLanguageFlags() {
    sourceFlag.textContent =
        languageFlags[sourceLanguage.value] || "🌐";

    targetFlag.textContent =
        languageFlags[targetLanguage.value] || "🌐";
}

function getOutputText() {
    return translationOutput.dataset.translation || "";
}

function showEmptyOutput() {
    translationOutput.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 48 48">
                    <path d="M24 4c2.2 10 6 13.8 16 16-10 2.2-13.8 6-16 16C21.8 26 18 22.2 8 20 18 17.8 21.8 14 24 4Z"/>
                </svg>
            </div>
            <p>Your translation will appear here...</p>
        </div>
    `;

    delete translationOutput.dataset.translation;
    outputStatus.textContent = "";
}

function showTranslation(text) {
    translationOutput.textContent = text;
    translationOutput.dataset.translation = text;

    const favoriteButton = document.getElementById("favoriteTranslation");

    if (favoriteButton) {
        favoriteButton.textContent = "☆";
        favoriteButton.classList.remove("active");
        favoriteButton.setAttribute("aria-pressed", "false");
    }
}

function getTranslationHistory() {
    try {
        const savedHistory = localStorage.getItem(
            "translingo-history"
        );

        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch {
        return [];
    }
}

function renderHistory() {
    const historyList = document.getElementById("historyList");
    const historyCount = document.getElementById("historyCount");
    const history = getTranslationHistory();

    historyList.replaceChildren();

    historyCount.textContent =
        `${history.length} ${history.length === 1 ? "translation" : "translations"}`;

    if (history.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "history-empty";
        emptyState.textContent =
            "No translation history yet. Translate some text to see it here.";

        historyList.appendChild(emptyState);
        return;
    }

    history.forEach((entry, index) => {
        const card = document.createElement("article");
        card.className = "history-item";

        const header = document.createElement("div");
        header.className = "history-item-header";

        const languages = document.createElement("span");
        languages.className = "history-languages";
        languages.textContent =
            `${getLanguageName(entry.from)} → ${getLanguageName(entry.to)}`;

        const date = document.createElement("span");
        date.className = "history-date";

        const parsedDate = new Date(entry.date);

        date.textContent = Number.isNaN(parsedDate.getTime())
            ? "Date unavailable"
            : parsedDate.toLocaleString();

        header.append(languages, date);

        const texts = document.createElement("div");
        texts.className = "history-texts";

        const sourceBox = createHistoryTextBox(
            "Original text",
            entry.source
        );

        const translatedBox = createHistoryTextBox(
            "Translation",
            entry.translated
        );

        texts.append(sourceBox, translatedBox);

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const copySourceButton = createHistoryButton(
            "Copy Original",
            () => copyText(entry.source, "Original text")
        );

        const copyTranslationButton = createHistoryButton(
            "Copy Translation",
            () => copyText(entry.translated, "Translation")
        );

        const reuseButton = createHistoryButton(
            "Translate Again",
            () => {
                document.getElementById("sourceText").value = entry.source;
                document.getElementById("sourceLanguage").value = entry.from;
                document.getElementById("targetLanguage").value = entry.to;

                updateLanguageFlags();
                updateCharacterCount();

                document.querySelector('[data-page="translate"]').click();
                showToast("Previous text loaded into the translator.");
            }
        );

        const deleteButton = createHistoryButton(
            "Delete",
            () => {
                const updatedHistory = getTranslationHistory();
                updatedHistory.splice(index, 1);

                localStorage.setItem(
                    "translingo-history",
                    JSON.stringify(updatedHistory)
                );

                renderHistory();
                showToast("Translation removed from history.");
            }
        );

        actions.append(
            copySourceButton,
            copyTranslationButton,
            reuseButton,
            deleteButton
        );

        card.append(header, texts, actions);
        historyList.appendChild(card);
    });
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("translingo-favorites")) || [];
    } catch {
        return [];
    }
}

function saveFavorites(favorites) {
    localStorage.setItem("translingo-favorites", JSON.stringify(favorites));
}

function renderFavorites() {
    const favoritesList = document.getElementById("favoritesList");
    const favoritesCount = document.getElementById("favoritesCount");

    if (!favoritesList || !favoritesCount) return;

    const favorites = getFavorites();

    favoritesCount.textContent =
        `${favorites.length} favorite${favorites.length === 1 ? "" : "s"}`;

    favoritesList.innerHTML = "";

    if (favorites.length === 0) {
        favoritesList.innerHTML = `
            <div class="history-empty">
                <h3>No favorites yet</h3>
                <p>Translate some text and save your favorite translations using the star button.</p>
            </div>
        `;
        return;
    }

    favorites.forEach((item, index) => {
        const card = document.createElement("article");
        card.className = "history-card";

        const heading = document.createElement("div");
        heading.className = "history-card-heading";

        const languages = document.createElement("span");
        languages.textContent =
            `${getLanguageName(item.from)} → ${getLanguageName(item.to)}`;

        const date = document.createElement("span");
        date.textContent = item.date || "";

        heading.append(languages, date);

        const original = createHistoryTextBox("Original", item.source);
        const translated = createHistoryTextBox("Translation", item.translated);

        const actions = document.createElement("div");
        actions.className = "history-card-actions";

        const copyOriginal = createHistoryButton("Copy Original");
        copyOriginal.addEventListener("click", () => copyText(item.source));

        const copyTranslation = createHistoryButton("Copy Translation");
        copyTranslation.addEventListener("click", () => copyText(item.translated));

        const remove = createHistoryButton("Remove");
        remove.addEventListener("click", () => {
            const updated = getFavorites();
            updated.splice(index, 1);
            saveFavorites(updated);
            renderFavorites();
            showToast("Removed from Favorites");
        });

        actions.append(copyOriginal, copyTranslation, remove);
        card.append(heading, original, translated, actions);
        favoritesList.appendChild(card);
    });
}

const favoriteButton = document.getElementById("favoriteTranslation");

if (favoriteButton) {
    favoriteButton.addEventListener("click", () => {
        const source = document.getElementById("sourceText").value.trim();
        const translated = document.getElementById("translationOutput").innerText.trim();
        const from = document.getElementById("sourceLanguage").value;
        const to = document.getElementById("targetLanguage").value;

        if (!source || !translated ||
            translated.includes("Your translation will appear here")) {
            showToast("Translate some text before adding it to Favorites.");
            return;
        }

        const favorites = getFavorites();

        const alreadySaved = favorites.some(item =>
            item.source === source &&
            item.translated === translated &&
            item.from === from &&
            item.to === to
        );

        if (alreadySaved) {
            showToast("This translation is already in Favorites.");
            return;
        }

        favorites.unshift({
            source,
            translated,
            from,
            to,
            date: new Date().toLocaleString()
        });

        saveFavorites(favorites);
        renderFavorites();

        favoriteButton.textContent = "★";
        showToast("Added to Favorites!");
    });
}

function createHistoryTextBox(label, text) {
    const box = document.createElement("div");
    box.className = "history-text-box";

    const heading = document.createElement("h3");
    heading.textContent = label;

    const paragraph = document.createElement("p");
    paragraph.textContent = text || "";

    box.append(heading, paragraph);

    return box;
}

function createHistoryButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-action";
    button.textContent = label;
    button.addEventListener("click", onClick);

    return button;
}

function getLanguageName(languageCode) {
    const languageSelects = [
        document.getElementById("sourceLanguage"),
        document.getElementById("targetLanguage")
    ];

    for (const select of languageSelects) {
        const option = Array.from(select.options).find(
            (item) => item.value === languageCode
        );

        if (option) {
            return option.textContent.trim();
        }
    }

    return languageCode;
}

function saveTranslationToHistory(source, translated, from, to) {
    const history = getTranslationHistory();

    history.unshift({
        source,
        translated,
        from,
        to,
        date: new Date().toISOString()
    });

    try {
        localStorage.setItem(
            "translingo-history",
            JSON.stringify(history.slice(0, 50))
        );
    } catch {
        showToast(
            "Translation completed, but browser storage is unavailable."
        );
    }
}

let translationRequestNumber = 0;
let isTranslating = false;

async function translateText() {
    const text = sourceText.value.trim();
    const from = sourceLanguage.value;
    const to = targetLanguage.value;

    if (isTranslating) {
        return;
    }

    if (!text) {
        showToast("Please enter some text to translate.");
        sourceText.focus();
        return;
    }

    if (text.length > 5000) {
        showToast("Please limit your text to 5,000 characters.");
        return;
    }

    if (from === to) {
        showToast("Choose two different languages to translate.");
        return;
    }

    const currentRequest = ++translationRequestNumber;

    isTranslating = true;
    translateButton.disabled = true;
    translateButton.setAttribute("aria-busy", "true");

    const buttonLabel = translateButton.querySelector(".button-label");
    const originalButtonText = buttonLabel.textContent;

    buttonLabel.textContent = "Translating...";
    outputStatus.textContent = "Translating...";
    outputStatus.setAttribute("role", "status");

    try {
        const endpoint =
            "https://api.mymemory.translated.net/get" +
            `?q=${encodeURIComponent(text)}` +
            `&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(
                `The translation service returned an error (${response.status}).`
            );
        }

        const data = await response.json();

        if (currentRequest !== translationRequestNumber) {
            return;
        }

        if (data.responseStatus && data.responseStatus !== 200) {
            throw new Error(
                data.responseDetails ||
                "The translation service could not complete your request."
            );
        }

        const translatedText =
            data.responseData &&
            data.responseData.translatedText;

        if (
            typeof translatedText !== "string" ||
            !translatedText.trim()
        ) {
            throw new Error("The service returned an empty translation.");
        }

        const decodedTranslation = decodeHtmlEntities(translatedText);

        showTranslation(decodedTranslation);

        outputStatus.textContent =
            `${sourceLanguage.options[sourceLanguage.selectedIndex].text}` +
            ` → ` +
            `${targetLanguage.options[targetLanguage.selectedIndex].text}`;

        saveTranslationToHistory(
            text,
            decodedTranslation,
            from,
            to
        );

        showToast("Translation completed!");
    } catch (error) {
        console.error("TransLingo translation error:", error);

        if (currentRequest !== translationRequestNumber) {
            return;
        }

        outputStatus.textContent = "Translation failed";

        if (error instanceof TypeError) {
            showToast(
                "Unable to connect. Check your internet and try again."
            );
        } else {
            showToast(
                error.message ||
                "Translation failed. Please try again."
            );
        }
    } finally {
        if (currentRequest === translationRequestNumber) {
            isTranslating = false;
            translateButton.disabled = false;
            translateButton.removeAttribute("aria-busy");
            buttonLabel.textContent = originalButtonText;
        }
    }
}

function decodeHtmlEntities(value) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = value;
    return textArea.value;
}

translateButton.addEventListener("click", translateText);

sourceText.addEventListener("keydown", (event) => {
    if (
        event.key === "Enter" &&
        (event.ctrlKey || event.metaKey)
    ) {
        event.preventDefault();
        translateText();
    }
});

async function copyText(text, description) {
    if (!text) {
        showToast("There is no text to copy yet.");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast(`${description} copied!`);
    } catch {
        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = text;
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";

        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        const copied = document.execCommand("copy");
        temporaryInput.remove();

        showToast(
            copied
                ? `${description} copied!`
                : "Copy failed. Please copy the text manually."
        );
    }
}

function speakText(text, language) {
    if (!text) {
        showToast("There is no text to read yet.");
        return;
    }

    if (!("speechSynthesis" in window)) {
        showToast(
            "Text-to-speech is not supported in this browser."
        );
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
}

function swapLanguages() {
    const previousSource = sourceLanguage.value;
    const previousTarget = targetLanguage.value;

    sourceLanguage.value = previousTarget;
    targetLanguage.value = previousSource;

    const existingTranslation = getOutputText();

    if (existingTranslation) {
        sourceText.value = existingTranslation;
        showEmptyOutput();
        updateCharacterCount();
    }

    updateLanguageFlags();

    showToast("Languages swapped.");
}

document
    .getElementById("swapLanguages")
    .addEventListener("click", swapLanguages);

function clearSourceText() {
    sourceText.value = "";
    showEmptyOutput();
    updateCharacterCount();
    sourceText.focus();
}

document
    .getElementById("clearText")
    .addEventListener("click", clearSourceText);

sourceLanguage.addEventListener("change", updateLanguageFlags);
targetLanguage.addEventListener("change", updateLanguageFlags);

sourceText.addEventListener("input", updateCharacterCount);

document
    .getElementById("copySource")
    .addEventListener("click", () => {
        copyText(sourceText.value, "Source text");
    });

document
    .getElementById("copyTranslation")
    .addEventListener("click", () => {
        copyText(getOutputText(), "Translation");
    });

document
    .getElementById("speakSource")
    .addEventListener("click", () => {
        speakText(sourceText.value, sourceLanguage.value);
    });

document
    .getElementById("speakTranslation")
    .addEventListener("click", () => {
        speakText(getOutputText(), targetLanguage.value);
    });

document
    .getElementById("copyLanguages")
    .addEventListener("click", () => {
        const sourceLanguageName =
            sourceLanguage.options[sourceLanguage.selectedIndex].text;

        const targetLanguageName =
            targetLanguage.options[targetLanguage.selectedIndex].text;

        const originalText = sourceText.value.trim();
        const translatedText = getOutputText();

        if (!originalText && !translatedText) {
            showToast("There is no text to copy yet.");
            return;
        }

        if (!translatedText) {
            showToast("Please translate your text first.");
            return;
        }

        const combinedText =
            `Source (${sourceLanguageName}):\n` +
            `${originalText}\n\n` +
            `Translation (${targetLanguageName}):\n` +
            `${translatedText}`;

        copyText(
            combinedText,
            "Source text and translation"
        );
    });

function setTheme(theme) {
    const isLight = theme === "light";

    document.body.classList.toggle("light-theme", isLight);

    lightThemeButton.classList.toggle("selected", isLight);
    darkThemeButton.classList.toggle("selected", !isLight);

    document.documentElement.style.colorScheme =
        isLight ? "light" : "dark";

    try {
        localStorage.setItem("translingo-theme", theme);
    } catch {
        // The theme still works if browser storage is unavailable.
    }
}

lightThemeButton.addEventListener("click", () => {
    setTheme("light");
});

darkThemeButton.addEventListener("click", () => {
    setTheme("dark");
});

try {
    const savedTheme = localStorage.getItem("translingo-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
    }
} catch {
    // Keep the default dark theme.
}

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (event) => {
        event.preventDefault();

        const page = item.dataset.page;

        document.querySelectorAll(".nav-item").forEach((navItem) => {
            navItem.classList.remove("active");
        });

        item.classList.add("active");

        const historyPage = document.getElementById("historyPage");
        const favoritesPage = document.getElementById("favoritesPage");
        const settingsPage = document.getElementById("settingsPage");

        historyPage.hidden = true;
        favoritesPage.hidden = true;
        settingsPage.hidden = true;

        document.querySelectorAll(
            ".hero, .features-grid, #translate"
        ).forEach((element) => {
            element.style.display = "";
        });

        document.querySelectorAll(".eyebrow").forEach((element) => {
            if (element.textContent.includes("YOUR WORLD, CONNECTED")) {
                element.style.display = "";
            }
        });

        
        if (page === "home") {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        else if (page === "translate") {
            document.getElementById("translate").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }

        else if (page === "history") {
            document.querySelectorAll(
                ".hero, .features-grid, #translate"
            ).forEach((element) => {
                element.style.display = "none";
            });

            document.querySelectorAll(".eyebrow").forEach((element) => {
                if (element.textContent.includes("YOUR WORLD, CONNECTED")) {
                    element.style.display = "none";
                }
            });

            historyPage.hidden = false;
            renderHistory();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }


        else if (page === "favorites") {
            document.querySelectorAll(
                ".hero, .features-grid, #translate"
            ).forEach((element) => {
                element.style.display = "none";
            });

            favoritesPage.hidden = false;
            renderFavorites();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        else if (page === "settings") {
            document.querySelectorAll(
                ".hero, .features-grid, #translate"
            ).forEach((element) => {
                element.style.display = "none";
            });

            settingsPage.hidden = false;
            loadLanguageSettings();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }

        sidebar.classList.remove("open");
    });
});

const footerYear = document.getElementById("footerYear");

if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
}

updateLanguageFlags();

function loadLanguageSettings() {
    const defaultSource = document.getElementById("defaultSourceLanguage");
    const defaultTarget = document.getElementById("defaultTargetLanguage");

    try {
        const savedSource = localStorage.getItem("translingo-default-source");
        const savedTarget = localStorage.getItem("translingo-default-target");

        defaultSource.value = savedSource || sourceLanguage.value;
        defaultTarget.value = savedTarget || targetLanguage.value;
    } catch {
        defaultSource.value = sourceLanguage.value;
        defaultTarget.value = targetLanguage.value;
    }
}

document.getElementById("settingsLightTheme").addEventListener("click", () => {
    setTheme("light");
    showToast("Light theme enabled.");
});

document.getElementById("settingsDarkTheme").addEventListener("click", () => {
    setTheme("dark");
    showToast("Dark theme enabled.");
});

document.getElementById("saveLanguageSettings").addEventListener("click", () => {
    const defaultSource = document.getElementById("defaultSourceLanguage").value;
    const defaultTarget = document.getElementById("defaultTargetLanguage").value;

    if (defaultSource === defaultTarget) {
        showToast("Choose two different languages.");
        return;
    }

    try {
        localStorage.setItem("translingo-default-source", defaultSource);
        localStorage.setItem("translingo-default-target", defaultTarget);
    } catch {
        showToast("Unable to save preferences in this browser.");
        return;
    }

    sourceLanguage.value = defaultSource;
    targetLanguage.value = defaultTarget;

    updateLanguageFlags();
    showToast("Language preferences saved!");
});

document.getElementById("clearSavedHistory").addEventListener("click", () => {
    if (getTranslationHistory().length === 0) {
        showToast("Translation history is already empty.");
        return;
    }

    if (!confirm("Clear all translation history? This cannot be undone.")) {
        return;
    }

    localStorage.removeItem("translingo-history");
    renderHistory();
    showToast("Translation history cleared.");
});

document.getElementById("clearSavedFavorites").addEventListener("click", () => {
    if (getFavorites().length === 0) {
        showToast("Favorites are already empty.");
        return;
    }

    if (!confirm("Remove all saved favorites? This cannot be undone.")) {
        return;
    }

    localStorage.removeItem("translingo-favorites");
    renderFavorites();

    const star = document.getElementById("favoriteTranslation");
    if (star) star.textContent = "☆";

    showToast("All favorites cleared.");
});

try {
    const savedSource = localStorage.getItem("translingo-default-source");
    const savedTarget = localStorage.getItem("translingo-default-target");

    if (
        savedSource &&
        savedTarget &&
        savedSource !== savedTarget &&
        sourceLanguage.querySelector(`option[value="${savedSource}"]`) &&
        targetLanguage.querySelector(`option[value="${savedTarget}"]`)
    ) {
        sourceLanguage.value = savedSource;
        targetLanguage.value = savedTarget;
        updateLanguageFlags();
    }
} catch {
    // Continue with the HTML default languages.
}

updateCharacterCount();

document
    .getElementById("clearHistoryButton")
    .addEventListener("click", () => {
        const history = getTranslationHistory();

        if (history.length === 0) {
            showToast("Your translation history is already empty.");
            return;
        }

        const confirmed = confirm(
            "Are you sure you want to delete all translation history?"
        );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem("translingo-history");

        renderHistory();

        showToast("Translation history cleared successfully.");
    });