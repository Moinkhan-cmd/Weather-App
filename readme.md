# Weather Pro - Advanced Weather App 🌤️

A super advanced, stylish, and fully responsive weather application with cutting-edge features and modern UI design.

## ✨ Features

### Core Features
- **Real-time Weather Data** - Get current weather conditions for any city worldwide
- **Geolocation Support** - Automatically detect and show weather for your current location
- **Smart Search** - Search cities with autocomplete-ready input
- **Favorites System** - Save and quickly access your favorite cities
- **Dark/Light Theme** - Toggle between beautiful themes with smooth transitions

### Advanced Weather Information
- **Current Conditions** - Temperature, feels-like temperature, weather description
- **Detailed Metrics**:
  - Wind Speed (km/h)
  - Humidity (%)
  - Atmospheric Pressure (hPa)
  - UV Index with safety levels
  - Air Quality Index (AQI) with health indicators
  - Visibility (km)
- **Sun Times** - Sunrise and sunset times
- **Hourly Forecast** - 12-hour detailed forecast with icons
- **7-Day Forecast** - Extended forecast with high/low temperatures

### Design & UX
- **Glassmorphism UI** - Modern frosted glass effect design
- **Dynamic Backgrounds** - Weather-based gradient backgrounds that change with conditions
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Particle Effects** - Animated background particles
- **Fully Responsive** - Perfect on desktop, tablet, and mobile devices
- **Accessibility** - ARIA labels and keyboard navigation support

### Technical Features
- **Local Storage** - Remembers your last searched city and favorites
- **Error Handling** - Graceful error messages and fallbacks
- **Loading States** - Beautiful loading animations
- **Offline-Friendly** - Caches last viewed weather data

## 🚀 Setup

1. **Get API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api)
   - Get your free API key
   - Replace the API key in `index.js` (line 2)

2. **Run the App**
   - Simply open `index.html` in a modern web browser
   - Or use VS Code Live Server extension for better development experience
   - No build process required!

## 📱 Usage

1. **Search for a City**
   - Type a city name in the search box
   - Press Enter or click the search button

2. **Use Your Location**
   - Click the location button (📍) to get weather for your current location
   - Grant location permissions when prompted

3. **Save Favorites**
   - Click the heart icon (♡) on any weather card to save it
   - Click favorite chips at the top to quickly switch cities

4. **Toggle Theme**
   - Click the moon/sun icon to switch between light and dark themes

## 🎨 Design Highlights

- **Modern Glassmorphism** - Frosted glass cards with backdrop blur
- **Dynamic Gradients** - Background colors change based on weather conditions
- **Smooth Animations** - Fade-in, slide-up, and hover effects
- **Responsive Grid** - Adaptive layouts for all screen sizes
- **Custom Scrollbars** - Styled scrollbars for forecast sections

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Notes

- **API Key Security**: The API key is currently in the client-side code. For production, consider proxying requests through a backend server.
- **Geolocation**: Requires HTTPS or localhost for geolocation to work properly.
- **Rate Limits**: Free OpenWeather API has rate limits. The app handles errors gracefully.

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Variables, Grid, Flexbox, Animations
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **OpenWeatherMap API** - Weather data source
- **Google Fonts** - Inter font family

## 📄 License

This project is open source and available for personal and commercial use.

---

**Enjoy your advanced weather experience!** ☀️🌧️❄️🌤️