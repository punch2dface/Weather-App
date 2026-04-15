# Weather App

A responsive weather application built with React and Vite that allows users to search for cities, view current weather conditions, and browse a 5-day forecast. The app uses OpenWeather's Geocoding API to resolve duplicate city names and fetches weather data based on coordinates for more accurate results.

![Main Weather View](/src/screenshots/main.png)

## Live Demo

https://weather-app-eight-virid-44.vercel.app/

## Features

- Search weather by city name
- Handle duplicate city names with location selection
- Display current weather conditions
- Show temperature, feels like, humidity, wind, high, and low
- Display a 5-day forecast
- Support Enter key search
- Persist recent weather data with localStorage
- Responsive UI for smaller screens

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- OpenWeather API
  - Geocoding API
  - Current Weather API
  - 5-Day Forecast API

## Screenshots

### Duplicate City Selection
![Duplicate City Selection](/src/screenshots/location.png)

### 5-Day Forecast
![5-Day Forecast](/src/screenshots/forecast.png)

## What I Learned

### This project helped me practice:

- React state management with useState
- Side effects and persistence with useEffect
- Fetching and handling API data
- Working with multiple related API endpoints
- Handling ambiguous search results with geocoding
- Persisting app state with localStorage
- Building a more polished and responsive UI

## Challenges

One of the main challenges was handling duplicate city names such as locations that share the same name in different states or countries. I solved this by using the OpenWeather Geocoding API first, then allowing the user to select the correct location before fetching weather data by coordinates.

Another challenge was converting 3-hour forecast data into a cleaner 5-day display. I handled this by filtering the forecast response to use one representative entry per day.

## Future Improvements

- Add temperature unit toggle between Celsius and Fahrenheit
- Add recent search history
- Improve loading states for different API requests
- Add weather condition icons from a custom icon set
- Add better accessibility and keyboard navigation