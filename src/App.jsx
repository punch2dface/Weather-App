import { useState, useEffect } from "react";
import "./App.css";

const STORAGE_KEYS ={
  city: "weatherCity",
  weather: "weatherData",
  selectedLocation: "selectedLocation",
  forecast: "forecastData",
};

function App() {

  // Persist the most recent city search so the input remains populated on refresh
  const [city, setCity] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.city) || "";
  });

  // Persist the most recent current-weather response.
  const [weather, setWeather] = useState(() => {
    const savedWeather = localStorage.getItem(STORAGE_KEYS.weather);
    return savedWeather ? JSON.parse(savedWeather) : null;
  });

  // Persist the selected geocoded location to state/country formatting survives refresh.
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = localStorage.getItem(STORAGE_KEYS.selectedLocation);
    return savedLocation ? JSON.parse(savedLocation) : null;
  });

  // Persist the simiplified 5-day forecast data.
  const [forecast, setForecast] = useState(() => {
    const savedForecast = localStorage.getItem(STORAGE_KEYS.forecast);
    return savedForecast ? JSON.parse(savedForecast) : [];
  });

  // UI state for request feedback and location disambiguation.
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Keep persisted state in sync with React state.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.city, city);
  }, [city]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.weather, JSON.stringify(weather));
  }, [weather]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.selectedLocation, JSON.stringify(selectedLocation));
  }, [selectedLocation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.forecast, JSON.stringify(forecast));
  }, [forecast]);

  // Fetch a 5-day / 3-hour forecast and reduce it to one entry per day.
  const fetchForecastByCoords = async (lat, lon) => {
    try{
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      const data = await response.json();

      if (Number(data.cod) !== 200){
        throw new Error(data.message || "Could not fetch forecast");
      }
      
      // Keep one forecast item per day.
      const dailyForecast = data.list.filter((item) => 
        item.dt_txt.includes("12:00:00")
      );

      setForecast(dailyForecast);
    } catch (err) {
      setForecast([]);
    }
  };

  // Fetch current weather for a specific location using coordinates.
  // Coordinates are used to avoid ambiguity between cities with the same name.
  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );

      const data = await response.json();

      if (Number(data.cod) !== 200) {
        throw new Error(data.message || "Could not fetch weather");
      }

      setWeather(data);
      await fetchForecastByCoords(lat, lon);
    } catch (err) {
      setError("Could not fetch weather data. Please try again.");
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // Resolve a typed city name into one or more matching location.
  // If there is only one result, fetch weather immediately.
  // If there are multiple results, let the user choose the intended location.
  const fetchLocationMatches = async () => {
    if (city.trim() === "") return;

    setLoading(true);
    setError("");
    setWeather(null);
    setMatches([]);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`
      );

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError("City not found. Please enter a valid city.");
        return;
      }

      if (data.length === 1) {
        const location = data[0];
        setMatches([]);
        setSelectedLocation(location);
        await fetchWeatherByCoords(location.lat, location.lon);
        return;
      }

      setMatches(data);
    } catch (err) {
      setError("Could not fetch location data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Convert forecast timestamps into compact, user-friendly labels.
  const formatDay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  // Handle location selection when geocoding returns multiple possible matches.
  const handleSelectLocation = async (location) => {
    setMatches([]);
    setSelectedLocation(location);
    await fetchWeatherByCoords(location.lat, location.lon);
  };

  // Allow users to search by pressing "Enter".
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchLocationMatches();
    }
  };

  // Build a consistent location label for display in the weather card.
  const locationLabel = selectedLocation
    ? `${selectedLocation.name}${selectedLocation.state ? `, ${selectedLocation.state}` : ""
    }, ${selectedLocation.country}`
    : weather
      ? `${weather.name}, ${weather.sys.country}`
      : "";

  return (
    <div className="app">
      <h1>Weather App</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            setSelectedLocation(null)
          }}
          onKeyDown={handleKeyDown}
        />
        <button onClick={fetchLocationMatches}>Search</button>
      </div>

      {loading && <p className="loading-message">Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {matches.length > 1 && (
        <div className="matches-list">
          <p className="matches-title">Select a location:</p>

          {matches.map((location, index) => (
            <button
              key={`${location.lat}-${location.lon}-${index}`}
              className="match-btn"
              onClick={() => handleSelectLocation(location)}
            >
              {location.name}
              {location.state ? `, ${location.state}` : ""}
              {`, ${location.country}`}
            </button>
          ))}
        </div>
      )}

      {weather && (
        <div className="weather-card">
          <div className="weather-header">
            <div>
              <h2>
                {locationLabel}
              </h2>
              <p className="weather-description">
                {weather.weather[0].description}
              </p>
            </div>

            <div className="weather-icon-wrapper">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
                className="weather-icon"
              />
            </div>
          </div>

          <div className="temperature-section">
            <p className="temperature">{Math.round(weather.main.temp)}°C</p>
            <p className="feels-like">
              Feels like: {Math.round(weather.main.feels_like)}°C
            </p>
          </div>

          <div className="weather-details">
            <div className="detail-box">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{weather.main.humidity}%</span>
            </div>

            <div className="detail-box">
              <span className="detail-label">Wind</span>
              <span className="detail-value">{weather.wind.speed} m/s</span>
            </div>

            <div className="detail-box">
              <span className="detail-label">High</span>
              <span className="detail-value">
                {Math.round(weather.main.temp_max)}°C
              </span>
            </div>

            <div className="detail-box">
              <span className="detail-label">Low</span>
              <span className="detail-value">
                {Math.round(weather.main.temp_min)}°C
              </span>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="forecast-section">
          <h3>5-Day Forecast</h3>

          <div className="forecast-list">
            {forecast.map((item) => (
              <div key={item.dt} className="forecast-card">
                <p className="forecast-day">{formatDay(item.dt_txt)}</p>

                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt={item.weather[0].description}
                  className="forecast-icon"
                />
                
                <p className="forecast-temp">{Math.round(item.main.temp)}°C</p>
                <p className="forecast-desc">{item.weather[0].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;