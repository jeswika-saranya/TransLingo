# 🌐 TransLingo — Break Language Barriers

**A multilingual text translation web application built using HTML, CSS, and JavaScript.**

TransLingo integrates the MyMemory Translation API to translate text between supported languages. It provides a simple interface with useful features for managing and accessing translations.

## ✨ Features

* **Multilingual Translation:** Translate text between supported languages.
* **Language Switching:** Swap source and target languages.
* **Translation History:** View previously translated text.
* **Favorite Translations:** Save important translations.
* **Text-to-Speech:** Listen to text using browser speech capabilities.
* **Copy Translation:** Copy translated text to the clipboard.
* **Theme Customization:** Switch between light and dark themes.
* **Language Preferences:** Configure default languages.
* **Local Storage:** Preserve history, favorites, and preferences in the browser.

## 🛠️ Technologies Used

### Frontend
* HTML5
* CSS3
* JavaScript

### API Integration
* MyMemory Translation API

### Browser Technologies
* Fetch API
* Local Storage API
* Web Speech API
* Clipboard API

## 📁 Project Structure

```text
TransLingo/
├── assets/
│   └── translingo-logo.png
├── index.html
├── styles.css
├── script.js
├── .gitignore
└── README.md
```

## ⚙️ Requirements

* A modern web browser
* An active internet connection
* Visual Studio Code (recommended)
* Git (optional)

## 🚀 Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/jeswika-saranya/TransLingo.git
cd TransLingo
```

### 2. Run the application

Open the project folder in Visual Studio Code and launch `index.html` using a browser or the Live Server extension.

An internet connection is required for API-based translations.

## 🧠 How It Works

1. The user enters text and selects the source and target languages.
2. JavaScript validates the input and sends a request to the MyMemory Translation API.
3. The API returns the translation.
4. The application displays the translated text.
5. Users can copy, listen to, or save translations.
6. History, favorites, and preferences are stored locally in the browser.

## 💾 Data Storage

TransLingo uses browser Local Storage to save:

* Translation history
* Favorite translations
* Language preferences
* Theme preference, if configured to persist

Saved data is browser-specific and does not automatically synchronize across devices.

## 🔮 Future Improvements

* Expand language support.
* Improve API error handling.
* Enhance mobile responsiveness and accessibility.
* Add translation export functionality.
* Introduce automated testing.
* Explore additional translation providers.


## 🎯 Project Goal

TransLingo aims to simplify multilingual communication while demonstrating practical frontend development, API integration, browser storage, and interactive UI design.

---

**TransLingo — Break Language Barriers. 🌍**