# Weather App

Small weather app using the [OpenWeather API](https://openweathermap.org/api).

## Setup
- Create an OpenWeather API key.
- Add the key where the app expects it (currently in `index.js`).

## Run
- Open `index.html` in a browser (or use VS Code “Live Server”).
- Type a city name and press **Enter** or click the search button.

## Troubleshooting
- **Nothing loads / request fails:** confirm your API key is valid and active, and check the browser console/network tab for errors.
- **City not found:** verify spelling (and optionally try “City, CountryCode”).

## Notes
- Putting an API key in client-side code means it can be copied/abused. For anything beyond a demo, proxy requests through a small server (or use a restricted key with tight limits).
- `.gitignore` is included to avoid committing OS/editor files and common generated folders.
