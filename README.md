# Chinese Pronunciation Training App

A web application to practice Chinese pronunciation using Pinyin or simplified Chinese characters. The app randomizes input items and pronounces them sequentially.

## Features
- Enter any combination of Chinese characters and Pinyin.
- Randomizes your input (Fisher-Yates shuffle).
- Read aloud with configurable delays.
- Support for two text-to-speech engines: Azure TTS and Web Speech API.
- Fully responsive dark mode interface.
- English and Russian languages available.

## Usage

Simply open `index.html` in your web browser. No server or build tools are required!
The app works out-of-the-box using your browser's built-in Web Speech API.

## Enabling Azure TTS

To use the high-quality Neural voices from Microsoft Azure:
1. Go to the [Azure Portal](https://portal.azure.com/) and sign up for a free account if you don't have one.
2. Create a new "Speech services" resource. You can select the **F0 Free Tier**, which provides up to 500,000 characters per month for free.
3. Once the resource is created, go to "Keys and Endpoint" to get your **API Key** (Key 1 or Key 2) and **Region** (e.g., `eastus`).
4. In this app, click on **Settings**.
5. Change the "TTS Engine" to **Azure TTS**.
6. Enter your Azure API Key and Region.
7. Start practicing!
4. Copy `js/config.example.js` to `js/config.js`.
5. Open `js/config.js` and enter your Azure API Key and Region.
6. Refresh the app and start practicing!
