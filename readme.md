# Weather App

Small weather app using the [OpenWeather API](https://openweathermap.org/api).

## Setup
- Create an OpenWeather API key.
- Put the key where the app expects it (currently in `index.js`).

## Run
- Open `index.html` (or use VS Code “Live Server”).
- Enter a city and press **Enter** / click search.

## Deploy (Netlify)
- Publish the folder that contains `index.html` **and** `index.js` (often the repo root).
- Ensure the script path/casing in `index.html` matches the real file (`./index.js` vs `Index.js`).

## Note
- Client-side API keys can be copied; for anything beyond a demo, proxy requests through a small server.
