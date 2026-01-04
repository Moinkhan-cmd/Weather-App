class WeatherApp {
    constructor() {
        this.apiKey = "bf4d6df40766a270916777f06feaae3d";
        this.apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
        this.searchBox = document.querySelector('.search input');
        this.searchBtn = document.querySelector('.search button');
        this.statusEl = document.querySelector('.status');
        this.weatherEl = document.querySelector('.weather');
        this.errorEl = document.querySelector('.error');
        this.errorTextEl = document.querySelector('.error-text');
        
        // UI Elements
        this.cityEl = document.querySelector('.city');
        this.dateEl = document.querySelector('.date');
        this.timeEl = document.querySelector('.live-clock');
        this.tempEl = document.querySelector('.temp');
        this.humEl = document.querySelector('.humidity');
        this.windEl = document.querySelector('.wind');
        this.pressureEl = document.querySelector('.pressure');
        this.iconEl = document.querySelector('.weather-icon');
        this.descEl = document.querySelector('.desc');
        this.feelsLikeEl = document.querySelector('.feels-like');
        this.updateTimeEl = document.getElementById('updateTime');

        this.currentCity = localStorage.getItem("lastCity") || "";
        this.clockInterval = null;
        this.refreshInterval = null;
        
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
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchBox.addEventListener('keydown', (e) => {
            if (e.key === "Enter") this.handleSearch();
        });

        if (this.currentCity) {
            this.checkWeather(this.currentCity);
            this.startAutoRefresh();
        }
    }

    handleSearch() {
        const city = this.searchBox.value.trim();
        if (city) {
            this.checkWeather(city);
            this.searchBox.value = "";
            this.startAutoRefresh(); // Restart interval on new search
        }
    }

    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        // Refresh weather data every 5 minutes
        this.refreshInterval = setInterval(() => {
            if (this.currentCity) {
                console.log(`Auto-refreshing weather for ${this.currentCity}...`);
                this.checkWeather(this.currentCity, true);
            }
        }, 5 * 60 * 1000);
    }

    async checkWeather(city, isAutoRefresh = false) {
        if (!isAutoRefresh) this.setLoading(true, "Fetching data...");
        
        try {
            const res = await fetch(this.apiUrl + encodeURIComponent(city) + `&appid=${this.apiKey}`);
            
            if (!res.ok) {
                if (res.status === 404) this.showError("City not found. Please try again.");
                else this.showError("Unable to fetch weather data.");
                return;
            }

            const data = await res.json();
            this.updateUI(data);
            this.currentCity = city;
            localStorage.setItem("lastCity", city);
            this.errorEl.style.display = "none";
            
        } catch (error) {
            console.error(error);
            this.showError("Network error. Check your connection.");
        } finally {
            this.setLoading(false);
        }
    }

    updateUI(data) {
        // Basic Info
        this.cityEl.textContent = data.name;
        this.tempEl.textContent = Math.round(data.main.temp) + "°";
        this.humEl.textContent = data.main.humidity + "%";
        
        // Wind: m/s -> km/h
        const windSpeed = Math.round((data.wind.speed || 0) * 3.6);
        this.windEl.textContent = windSpeed + " km/h";
        
        // Pressure
        this.pressureEl.textContent = (data.main.pressure || "--") + " hPa";

        // Description & Feels Like
        this.descEl.textContent = data.weather?.[0]?.description || "";
        this.feelsLikeEl.textContent = Math.round(data.main.feels_like);

        // Icon
        const mainWeather = data.weather?.[0]?.main;
        this.iconEl.src = this.iconMap[mainWeather] || "images/clouds.png";

        // Update Time
        const now = new Date();
        this.updateTimeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Start Live Clock with timezone offset (seconds)
        this.startClock(data.timezone);

        this.weatherEl.classList.add("is-visible");
        this.weatherEl.style.display = "block";
        
        // Dynamic background tweak based on weather (simple logic)
        this.updateBackground(mainWeather);
    }

    startClock(timezoneOffset) {
        if (this.clockInterval) clearInterval(this.clockInterval);

        const updateTime = () => {
            // Get current UTC time in ms
            const now = new Date();
            const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
            
            // Calculate city time
            const cityTime = new Date(utcTime + (timezoneOffset * 1000));

            // Format Time
            this.timeEl.textContent = cityTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });

            // Format Date
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            this.dateEl.textContent = cityTime.toLocaleDateString('en-US', options);
        };

        updateTime(); // Initial call
        this.clockInterval = setInterval(updateTime, 1000);
    }

    updateBackground(weatherMain) {
        const root = document.documentElement;
        let gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default/Clear

        switch(weatherMain) {
            case 'Clouds':
                gradient = 'linear-gradient(135deg, #636fa4 0%, #e8cbc0 100%)'; 
                break;
            case 'Rain':
            case 'Drizzle':
            case 'Thunderstorm':
                gradient = 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)';
                break;
            case 'Snow':
                gradient = 'linear-gradient(135deg, #83a4d4 0%, #b6fbff 100%)';
                break;
            case 'Clear':
                gradient = 'linear-gradient(135deg, #2980B9 0%, #6DD5FA 100%, #FFFFFF 100%)'; // Or keep default
                // Let's use a nice sunny gradient
                gradient = 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)';
                break;
            default:
                gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        
        // Slightly change body background for immersive feel
        if(weatherMain === 'Clear') {
             // Warmer for clear day
             document.body.style.background = 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)';
        } else if (weatherMain === 'Rain') {
             document.body.style.background = 'linear-gradient(135deg, #20002c 0%, #cbb4d4 100%)';
        } else {
            // Reset to default style CSS var or just keep it dynamic
             document.body.style.background = 'var(--bg-gradient)'; 
        }
    }

    setLoading(isLoading, msg = "") {
        this.statusEl.textContent = msg;
        this.searchBtn.disabled = isLoading;
        this.searchBox.disabled = isLoading;
        if(isLoading) {
            this.statusEl.style.opacity = '1';
        } else {
             this.statusEl.style.opacity = '0'; // fade out
        }
    }

    showError(message) {
        this.errorTextEl.textContent = message;
        this.errorEl.style.display = "block";
        this.weatherEl.style.display = "none";
    }
}

// Initialize App
const app = new WeatherApp();
app.init();
