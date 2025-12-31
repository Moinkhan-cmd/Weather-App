// ============================================
// Configuration
// ============================================
const API_KEY = "bf4d6df40766a270916777f06feaae3d";
const WEATHER_API = "https://api.openweathermap.org/data/2.5";
const GEO_API = "https://api.openweathermap.org/geo/1.0";

// ============================================
// DOM Elements
// ============================================
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    themeToggle: document.getElementById('themeToggle'),
    status: document.getElementById('status'),
    error: document.getElementById('error'),
    errorText: document.querySelector('.error-text'),
    weatherCard: document.getElementById('weatherCard'),
    loader: document.getElementById('loader'),
    favoritesContainer: document.getElementById('favoritesContainer'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    
    // Weather display elements
    cityName: document.getElementById('cityName'),
    dateTime: document.getElementById('dateTime'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),
    windSpeed: document.getElementById('windSpeed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    uvIndex: document.getElementById('uvIndex'),
    airQuality: document.getElementById('airQuality'),
    visibility: document.getElementById('visibility'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    hourlyForecast: document.getElementById('hourlyForecast'),
    dailyForecast: document.getElementById('dailyForecast'),
};

// ============================================
// State Management
// ============================================
const state = {
    currentCity: null,
    favorites: JSON.parse(localStorage.getItem('weatherFavorites') || '[]'),
    theme: localStorage.getItem('weatherTheme') || 'light',
    isLoading: false,
};

// ============================================
// Weather Icon Mapping
// ============================================
const iconMap = {
    '01d': 'clear', '01n': 'clear',
    '02d': 'clouds', '02n': 'clouds',
    '03d': 'clouds', '03n': 'clouds',
    '04d': 'clouds', '04n': 'clouds',
    '09d': 'drizzle', '09n': 'drizzle',
    '10d': 'rain', '10n': 'rain',
    '11d': 'rain', '11n': 'rain', // Thunderstorm uses rain icon
    '13d': 'snow', '13n': 'snow',
    '50d': 'mist', '50n': 'mist',
};

const weatherMainMap = {
    Clear: 'Clear',
    Clouds: 'Clouds',
    Rain: 'Rain',
    Drizzle: 'Rain',
    Thunderstorm: 'Rain',
    Snow: 'Snow',
    Mist: 'Mist',
    Fog: 'Mist',
    Haze: 'Mist',
};

// ============================================
// Utility Functions
// ============================================
function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatHour(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
    });
}

function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function getUVIndexLevel(uv) {
    if (uv <= 2) return { level: 'Low', color: '#4ade80' };
    if (uv <= 5) return { level: 'Moderate', color: '#fbbf24' };
    if (uv <= 7) return { level: 'High', color: '#f97316' };
    if (uv <= 10) return { level: 'Very High', color: '#ef4444' };
    return { level: 'Extreme', color: '#dc2626' };
}

function getAQILevel(aqi) {
    const levels = {
        1: { level: 'Good', color: '#4ade80', emoji: '😊' },
        2: { level: 'Fair', color: '#fbbf24', emoji: '😐' },
        3: { level: 'Moderate', color: '#f97316', emoji: '😷' },
        4: { level: 'Poor', color: '#ef4444', emoji: '😰' },
        5: { level: 'Very Poor', color: '#dc2626', emoji: '😱' },
    };
    return levels[aqi] || levels[1];
}

function updateDateTime() {
    const now = new Date();
    elements.dateTime.textContent = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

// Update time every minute
setInterval(updateDateTime, 60000);

// ============================================
// Theme Management
// ============================================
function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    elements.themeToggle.querySelector('.theme-icon').textContent = 
        state.theme === 'light' ? '🌙' : '☀️';
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('weatherTheme', state.theme);
    initTheme();
}

elements.themeToggle.addEventListener('click', toggleTheme);
initTheme();

// ============================================
// Favorites Management
// ============================================
function saveFavorites() {
    localStorage.setItem('weatherFavorites', JSON.stringify(state.favorites));
    renderFavorites();
}

function addToFavorites(city) {
    if (!state.favorites.includes(city)) {
        state.favorites.push(city);
        saveFavorites();
    }
}

function removeFromFavorites(city) {
    state.favorites = state.favorites.filter(f => f !== city);
    saveFavorites();
}

function isFavorite(city) {
    return state.favorites.includes(city);
}

function renderFavorites() {
    elements.favoritesContainer.innerHTML = '';
    state.favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'favorite-chip';
        chip.textContent = city;
        chip.addEventListener('click', () => {
            elements.cityInput.value = city;
            checkWeather(city);
        });
        elements.favoritesContainer.appendChild(chip);
    });
}

elements.favoriteBtn.addEventListener('click', () => {
    if (state.currentCity) {
        if (isFavorite(state.currentCity)) {
            removeFromFavorites(state.currentCity);
            elements.favoriteBtn.classList.remove('active');
        } else {
            addToFavorites(state.currentCity);
            elements.favoriteBtn.classList.add('active');
        }
    }
});

renderFavorites();

// ============================================
// UI State Management
// ============================================
function setLoading(isLoading, message = '') {
    state.isLoading = isLoading;
    elements.status.textContent = message;
    elements.loader.style.display = isLoading ? 'block' : 'none';
    elements.searchBtn.disabled = isLoading;
    elements.cityInput.disabled = isLoading;
    elements.locationBtn.disabled = isLoading;
    
    if (!isLoading) {
        elements.status.textContent = '';
    }
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.error.style.display = 'flex';
    elements.weatherCard.style.display = 'none';
    setTimeout(() => {
        elements.error.style.animation = 'none';
        setTimeout(() => {
            elements.error.style.animation = '';
        }, 10);
    }, 100);
}

function hideError() {
    elements.error.style.display = 'none';
}

function showWeather() {
    hideError();
    elements.weatherCard.style.display = 'block';
    elements.weatherCard.style.animation = 'fadeInUp 0.8s ease-out';
}

function updateWeatherBackground(weatherMain) {
    document.body.setAttribute('data-weather', weatherMain);
}

// ============================================
// API Functions
// ============================================
async function fetchWeatherData(city) {
    const url = `${WEATHER_API}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
        } else if (response.status === 401) {
            throw new Error('API key invalid. Please check configuration.');
        } else {
            throw new Error('Unable to fetch weather data. Please try again later.');
        }
    }
    
    return await response.json();
}

async function fetchForecastData(city) {
    const url = `${WEATHER_API}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
        return null; // Forecast is optional
    }
    
    return await response.json();
}

async function fetchAirQuality(lat, lon) {
    try {
        const url = `${WEATHER_API}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.list[0]?.main?.aqi || null;
    } catch (error) {
        return null;
    }
}

async function fetchUVIndex(lat, lon) {
    try {
        // OpenWeather UV Index API (requires One Call API subscription)
        // For free tier, we'll estimate based on time and location
        const hour = new Date().getHours();
        const month = new Date().getMonth();
        
        // Simple estimation based on time of day and season
        if (hour >= 6 && hour <= 18) {
            // Peak UV around noon (12 PM)
            const hoursFromNoon = Math.abs(hour - 12);
            const baseUV = month >= 4 && month <= 8 ? 7 : 5; // Higher in summer
            const estimatedUV = Math.max(0, baseUV - hoursFromNoon);
            return Math.round(estimatedUV);
        }
        return 0;
    } catch (error) {
        return null;
    }
}

async function getCoordinates(city) {
    try {
        const url = `${GEO_API}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// ============================================
// Display Functions
// ============================================
function displayCurrentWeather(data) {
    const weather = data.weather[0];
    const main = data.main;
    const wind = data.wind;
    
    // Update main info
    elements.cityName.textContent = data.name + (data.sys.country ? `, ${data.sys.country}` : '');
    elements.temperature.textContent = `${Math.round(main.temp)}°`;
    elements.weatherDescription.textContent = weather.description;
    elements.feelsLike.textContent = `${Math.round(main.feels_like)}°`;
    
    // Update metrics
    elements.windSpeed.textContent = `${Math.round((wind.speed || 0) * 3.6)} km/h`;
    elements.humidity.textContent = `${main.humidity}%`;
    elements.pressure.textContent = `${main.pressure} hPa`;
    elements.visibility.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : '-- km';
    
    // Update icon
    const iconCode = weather.icon || '01d';
    const iconName = iconMap[iconCode] || 'clouds';
    elements.weatherIcon.src = `images/${iconName}.png`;
    elements.weatherIcon.alt = weather.description;
    
    // Update background based on weather
    const weatherMain = weatherMainMap[weather.main] || 'Clouds';
    updateWeatherBackground(weatherMain);
    
    // Update date/time
    updateDateTime();
    
    // Update sunrise/sunset
    if (data.sys.sunrise && data.sys.sunset) {
        elements.sunrise.textContent = formatTime(data.sys.sunrise);
        elements.sunset.textContent = formatTime(data.sys.sunset);
    }
    
    // Update favorite button
    if (isFavorite(state.currentCity)) {
        elements.favoriteBtn.classList.add('active');
    } else {
        elements.favoriteBtn.classList.remove('active');
    }
}

async function displayAdditionalData(data) {
    const coords = await getCoordinates(state.currentCity);
    
    if (coords) {
        // Fetch UV Index
        const uv = await fetchUVIndex(coords.lat, coords.lon);
        if (uv !== null) {
            const uvInfo = getUVIndexLevel(uv);
            elements.uvIndex.textContent = `${uv} (${uvInfo.level})`;
            elements.uvIndex.style.color = uvInfo.color;
        } else {
            elements.uvIndex.textContent = '--';
        }
        
        // Fetch Air Quality
        const aqi = await fetchAirQuality(coords.lat, coords.lon);
        if (aqi !== null) {
            const aqiInfo = getAQILevel(aqi);
            elements.airQuality.textContent = `${aqiInfo.emoji} ${aqiInfo.level}`;
            elements.airQuality.style.color = aqiInfo.color;
        } else {
            elements.airQuality.textContent = '--';
        }
    } else {
        elements.uvIndex.textContent = '--';
        elements.airQuality.textContent = '--';
    }
}

function displayHourlyForecast(forecastData) {
    if (!forecastData || !forecastData.list) {
        elements.hourlyForecast.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Hourly forecast unavailable</p>';
        return;
    }
    
    elements.hourlyForecast.innerHTML = '';
    
    // Get next 12 hours
    const hourlyData = forecastData.list.slice(0, 12);
    
    hourlyData.forEach(item => {
        const hourItem = document.createElement('div');
        hourItem.className = 'hourly-item';
        
        const iconCode = item.weather[0].icon || '01d';
        const iconName = iconMap[iconCode] || 'clouds';
        
        hourItem.innerHTML = `
            <div class="hourly-time">${formatHour(item.dt)}</div>
            <img src="images/${iconName}.png" alt="${item.weather[0].description}" class="hourly-icon">
            <div class="hourly-temp">${Math.round(item.main.temp)}°</div>
        `;
        
        elements.hourlyForecast.appendChild(hourItem);
    });
}

function displayDailyForecast(forecastData) {
    if (!forecastData || !forecastData.list) {
        elements.dailyForecast.innerHTML = '<p style="text-align: center; color: var(--text-tertiary);">Daily forecast unavailable</p>';
        return;
    }
    
    elements.dailyForecast.innerHTML = '';
    
    // Group by day and get daily max/min
    const dailyData = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!dailyData[dayKey]) {
            dailyData[dayKey] = {
                date: item.dt,
                temps: [],
                weather: item.weather[0],
                icon: item.weather[0].icon,
            };
        }
        
        dailyData[dayKey].temps.push(item.main.temp);
        dailyData[dayKey].temps.push(item.main.temp_max);
        dailyData[dayKey].temps.push(item.main.temp_min);
    });
    
    // Convert to array and get next 7 days
    const dailyArray = Object.values(dailyData).slice(0, 7);
    
    dailyArray.forEach(day => {
        const dayItem = document.createElement('div');
        dayItem.className = 'daily-item';
        
        const maxTemp = Math.max(...day.temps);
        const minTemp = Math.min(...day.temps);
        const iconCode = day.icon || '01d';
        const iconName = iconMap[iconCode] || 'clouds';
        
        dayItem.innerHTML = `
            <div class="daily-left">
                <img src="images/${iconName}.png" alt="${day.weather.description}" class="daily-icon">
                <div class="daily-info">
                    <div class="daily-day">${formatDay(day.date)}</div>
                    <div class="daily-desc">${day.weather.description}</div>
                </div>
            </div>
            <div class="daily-right">
                <div class="daily-temps">
                    <span class="daily-temp-high">${Math.round(maxTemp)}°</span>
                    <span class="daily-temp-low">${Math.round(minTemp)}°</span>
                </div>
            </div>
        `;
        
        elements.dailyForecast.appendChild(dayItem);
    });
}

// ============================================
// Main Weather Check Function
// ============================================
async function checkWeather(city) {
    const cityName = (city || '').trim();
    
    if (!cityName) {
        showError('Please enter a city name.');
        return;
    }
    
    setLoading(true, 'Loading weather data...');
    hideError();
    
    try {
        // Fetch current weather
        const weatherData = await fetchWeatherData(cityName);
        state.currentCity = cityName;
        
        // Display current weather
        displayCurrentWeather(weatherData);
        
        // Fetch and display additional data (UV, Air Quality)
        displayAdditionalData(weatherData).catch(console.error);
        
        // Fetch and display forecasts
        const forecastData = await fetchForecastData(cityName);
        if (forecastData) {
            displayHourlyForecast(forecastData);
            displayDailyForecast(forecastData);
        }
        
        showWeather();
        
        // Save to localStorage
        localStorage.setItem('lastCity', cityName);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message || 'Failed to fetch weather data. Please try again.');
    } finally {
        setLoading(false);
    }
}

// ============================================
// Geolocation
// ============================================
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }
    
    setLoading(true, 'Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                
                // Reverse geocoding to get city name
                const url = `${GEO_API}/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.length > 0) {
                        const city = data[0].name;
                        elements.cityInput.value = city;
                        await checkWeather(city);
                        return;
                    }
                }
                
                // Fallback: use coordinates directly
                const weatherUrl = `${WEATHER_API}/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
                const weatherResponse = await fetch(weatherUrl);
                
                if (weatherResponse.ok) {
                    const weatherData = await weatherResponse.json();
                    elements.cityInput.value = weatherData.name;
                    state.currentCity = weatherData.name;
                    displayCurrentWeather(weatherData);
                    displayAdditionalData(weatherData).catch(console.error);
                    
                    const forecastData = await fetchForecastData(weatherData.name);
                    if (forecastData) {
                        displayHourlyForecast(forecastData);
                        displayDailyForecast(forecastData);
                    }
                    
                    showWeather();
                    localStorage.setItem('lastCity', weatherData.name);
                } else {
                    showError('Unable to fetch weather for your location.');
                }
            } catch (error) {
                console.error('Location error:', error);
                showError('Failed to get weather for your location.');
            } finally {
                setLoading(false);
            }
        },
        (error) => {
            setLoading(false);
            showError('Unable to access your location. Please enable location permissions.');
        }
    );
}

// ============================================
// Event Listeners
// ============================================
elements.searchBtn.addEventListener('click', () => {
    checkWeather(elements.cityInput.value);
});

elements.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !state.isLoading) {
        checkWeather(elements.cityInput.value);
    }
});

elements.locationBtn.addEventListener('click', getCurrentLocation);

// ============================================
// Initialize App
// ============================================
function init() {
    updateDateTime();
    
    // Load last searched city
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        elements.cityInput.value = lastCity;
        checkWeather(lastCity);
    } else {
        // Try to get location on first load
        getCurrentLocation();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}