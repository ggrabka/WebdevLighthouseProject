const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

function getWeatherText(weatherCode) {
  if (weatherCode === 0) {
    return "Clear sky";
  }

  if (weatherCode === 1 || weatherCode === 2 || weatherCode === 3) {
    return "Partly cloudy";
  }

  if (weatherCode >= 45 && weatherCode <= 48) {
    return "Foggy";
  }

  if (weatherCode >= 51 && weatherCode <= 67) {
    return "Rainy";
  }

  if (weatherCode >= 71 && weatherCode <= 77) {
    return "Snowy";
  }

  if (weatherCode >= 80 && weatherCode <= 82) {
    return "Rain showers";
  }

  if (weatherCode >= 95) {
    return "Thunderstorm";
  }

  return "Weather condition unknown";
}

router.get("/", requireLogin, async function (req, res) {
  try {
    // Coordinates are roughly for Vienna / Seestadt
    const latitude = 48.226;
    const longitude = 16.508;

    const weatherUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + latitude +
      "&longitude=" + longitude +
      "&current=temperature_2m,wind_speed_10m,weather_code" +
      "&timezone=Europe/Vienna";

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Weather API could not be reached"
      });
    }

    const weatherData = await weatherResponse.json();

    const currentWeather = weatherData.current;

    res.json({
      success: true,
      location: "Vienna / Seestadt",
      temperature: currentWeather.temperature_2m,
      windSpeed: currentWeather.wind_speed_10m,
      weatherCode: currentWeather.weather_code,
      weatherText: getWeatherText(currentWeather.weather_code),
      message: "Weather data loaded from external API"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load weather data"
    });
  }
});

module.exports = router;