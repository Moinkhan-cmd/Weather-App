const apiKey = "bf4d6df40766a270916777f06feaae3d";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q="

const searchBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');

const weatherEl = document.querySelector('.weather');
const errorEl = document.querySelector('.error');
const errorTextEl = document.querySelector('.error-text');
const statusEl = document.querySelector('.status');

const cityEl = document.querySelector('.city');
const tempEl = document.querySelector('.temp');
const humidityEl = document.querySelector('.humidity');
const windEl = document.querySelector('.wind');
const iconEl = document.querySelector('.weather-icon');
const descEl = document.querySelector('.desc');
const feelsLikeEl = document.querySelector('.feels-like');

const iconMap = {
  Clouds: "images/clouds.png",
  Clear: "images/clear.png",
  Rain: "images/rain.png",
  Drizzle: "images/drizzle.png",
  Mist: "images/mist.png",
  Snow: "images/snow.png",
  Thunderstorm: "images/thunder.png",
};

function setLoading(isLoading, msg = "") {
  statusEl.textContent = msg;
  searchBtn.disabled = isLoading;
  searchBox.disabled = isLoading;
}

function showError(message) {
  errorTextEl.textContent = message;
  errorEl.style.display = "block";
  weatherEl.classList.remove("is-visible");
  weatherEl.style.display = "none";
}

function showWeather() {
  errorEl.style.display = "none";
  weatherEl.style.display = "block";
  weatherEl.classList.add("is-visible");
}

async function checkWeather(city) {
  const q = (city || "").trim();
  if (!q) {
    showError("Please enter a city name.");
    return;
  }

  setLoading(true, "Loading...");
  try {
    const res = await fetch(apiUrl + encodeURIComponent(q) + `&appid=${apiKey}`);

    if (!res.ok) {
      if (res.status === 404) showError("City not found. Check spelling and try again.");
      else showError("Could not fetch weather right now. Try again.");
      return;
    }

    const data = await res.json();

    cityEl.textContent = data.name;
    tempEl.textContent = Math.round(data.main.temp) + "°C";
    feelsLikeEl.textContent = Math.round(data.main.feels_like) + "°C";
    descEl.textContent = data.weather?.[0]?.description || "";

    humidityEl.textContent = data.main.humidity + "%";

    // OpenWeather wind speed is m/s -> convert to km/h
    const windKmh = Math.round((data.wind.speed || 0) * 3.6);
    windEl.textContent = windKmh + " km/h";

    const main = data.weather?.[0]?.main;
    iconEl.src = iconMap[main] || "images/clouds.png";

    localStorage.setItem("lastCity", q);
    showWeather();
  } catch (e) {
    showError("Network error. Check your connection and try again.");
  } finally {
    setLoading(false, "");
  }
}

searchBtn.addEventListener('click', () => checkWeather(searchBox.value));
searchBox.addEventListener('keydown', (e) => {
  if (e.key === "Enter") checkWeather(searchBox.value);
});

const last = localStorage.getItem("lastCity");
if (last) checkWeather(last);

