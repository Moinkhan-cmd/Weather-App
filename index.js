class WeatherApp {
    constructor() {
        this.apiKey = "bf4d6df40766a270916777f06feaae3d";
        this.apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";
        
        // Input Elements
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.themeToggle = document.getElementById('themeToggle');
        
        // Output Elements
        this.weatherCard = document.getElementById('weatherCard');
        this.loader = document.getElementById('loader');
        this.errorEl = document.getElementById('error');
        this.errorTextEl = document.querySelector('.error-text');
        this.statusEl = document.getElementById('status');
        
        // Weather Info Elements
        this.cityNameEl = document.getElementById('cityName');
        this.dateTimeEl = document.getElementById('dateTime');
        this.tempEl = document.getElementById('temperature');
        this.descEl = document.getElementById('weatherDescription');
        this.feelsLikeEl = document.getElementById('feelsLike');
        this.iconEl = document.getElementById('weatherIcon');
        
        // Metrics
        this.windEl = document.getElementById('windSpeed');
        this.humidityEl = document.getElementById('humidity');
        this.pressureEl = document.getElementById('pressure');
        this.visibilityEl = document.getElementById('visibility');
        this.uvIndexEl = document.getElementById('uvIndex');
        this.airQualityEl = document.getElementById('airQuality');
        this.sunriseEl = document.getElementById('sunrise');
        this.sunsetEl = document.getElementById('sunset');

        this.iconMap = {
            Clouds: "images/clouds.png",
            Clear: "images/clear.png",
            Rain: "images/rain.png",
            Drizzle: "images/drizzle.png",
            Mist: "images/mist.png",
            Snow: "images/snow.png",
            Thunderstorm: "images/thunder.png",
            Haze: "images/mist.png", 
            Smoke: "images/mist.png",
            Fog: "images/mist.png"
        };
    }

    init() {
        // Event Listeners
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.cityInput.addEventListener('keydown', (e) => {
            if (e.key === "Enter") this.handleSearch();
        });
        
        this.locationBtn.addEventListener('click', () => this.getDeviceLocation());
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Check for last city or auto-locate
        const lastCity = localStorage.getItem("lastCity");
        if (lastCity) {
            this.checkWeather(lastCity);
        } else {
            // Optional: Auto-detect on first load
            // this.getDeviceLocation(); 
        }
    }

    handleSearch() {
        const city = this.cityInput.value.trim();
        if (city) {
            this.checkWeather(city);
            this.cityInput.value = "";
        }
    }

    getDeviceLocation() {
        if (!navigator.geolocation) {
            this.showError("Geolocation is not supported by your browser.");
            return;
        }
        
        this.setLoading(true);
        this.statusEl.textContent = "Locating...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.checkWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.setLoading(false);
                let msg = "Unable to retrieve your location.";
                if (error.code === 1) msg = "Location permission denied.";
                this.showError(msg);
                this.statusEl.textContent = "";
            }
        );
    }

    async checkWeatherByCoords(lat, lon) {
        this.setLoading(true);
        this.errorEl.style.display = "none";
        
        try {
            const url = `${this.apiUrl}&lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
            const res = await fetch(url);
            
            if (!res.ok) throw new Error("Weather data not available.");
            
            const data = await res.json();
            this.updateUI(data);
            this.saveLastCity(data.name);
            
        } catch (error) {
            console.error(error);
            this.showError("Could not fetch weather data.");
        } finally {
            this.setLoading(false);
            this.statusEl.textContent = "";
        }
    }

    async checkWeather(city) {
        this.setLoading(true);
        this.errorEl.style.display = "none";
        
        try {
            const url = `${this.apiUrl}&q=${encodeURIComponent(city)}&appid=${this.apiKey}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                if (res.status === 404) throw new Error("City not found.");
                else throw new Error("Network error.");
            }

            const data = await res.json();
            this.updateUI(data);
            this.saveLastCity(city);
            
        } catch (error) {
            console.error(error);
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    updateUI(data) {
        // Basic Info
        this.cityNameEl.textContent = data.name + (data.sys.country ? `, ${data.sys.country}` : '');
        this.tempEl.textContent = Math.round(data.main.temp) + "°";
        this.descEl.textContent = data.weather?.[0]?.description || "";
        this.feelsLikeEl.textContent = Math.round(data.main.feels_like) + "°";
        
        // Icon
        const main = data.weather?.[0]?.main;
        this.iconEl.src = this.iconMap[main] || "images/clouds.png";
        
        // Update Theme Gradient based on weather
        document.body.setAttribute('data-weather', main);

        // Metrics
        this.humidityEl.textContent = data.main.humidity + "%";
        this.pressureEl.textContent = data.main.pressure + " hPa";
        this.windEl.textContent = Math.round((data.wind.speed || 0) * 3.6) + " km/h";
        this.visibilityEl.textContent = (data.visibility / 1000).toFixed(1) + " km";
        
        // Sun Times
        if (data.sys.sunrise && data.sys.sunset) {
            const sunriseTime = new Date((data.sys.sunrise + data.timezone - 19800) * 1000); // 19800 is optional offset if dealing with UTC, but simpler:
            // Correct way for local time using timezone offset:
            // (Note: data.sys.sunrise is unix UTC. data.timezone is offset in seconds.)
            
            this.sunriseEl.textContent = this.formatTime(data.sys.sunrise, data.timezone);
            this.sunsetEl.textContent = this.formatTime(data.sys.sunset, data.timezone);
        }

        // Live Clock (Local to city)
        this.updateClock(data.timezone);
        
        // Stub values for missing API data (UV, AQI)
        this.uvIndexEl.textContent = "--"; 
        this.airQualityEl.textContent = "--";

        this.weatherCard.style.display = "block";
    }

    formatTime(unixTimestamp, timezoneOffset) {
        // Create date from timestamp (ms)
        const date = new Date((unixTimestamp + timezoneOffset) * 1000);
        // Since we added offset to UTC timestamp, getUTCHours gives the local time
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    }

    updateClock(timezoneOffset) {
        // Clear previous interval if any
        if (this.clockInterval) clearInterval(this.clockInterval);

        const update = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const cityTime = new Date(utc + (timezoneOffset * 1000));
            
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
            };
            this.dateTimeEl.textContent = cityTime.toLocaleDateString('en-US', options);
        };
        update();
        this.clockInterval = setInterval(update, 1000);
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.loader.style.display = "block";
            this.weatherCard.style.display = "none";
        } else {
            this.loader.style.display = "none";
        }
    }

    showError(msg) {
        this.errorTextEl.textContent = msg;
        this.errorEl.style.display = "flex";
        setTimeout(() => {
            this.errorEl.style.display = "none";
        }, 5000);
    }
    
    saveLastCity(city) {
        localStorage.setItem("lastCity", city);
    }
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
    }
}

const app = new WeatherApp();
app.init();
