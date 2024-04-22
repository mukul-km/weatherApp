// WEATHER APP
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const currentWeather = document.querySelector(".current-weather");
const forecastCards = document.querySelector(".forecast-cards");
const API_KEY = "57a3e7bc0f3d9695b802b265239ecd83";

const createWeatherCard = (data, index, cityName) => {
  let {
    dt_txt,
    main: { temp, humidity },
    wind: { speed },
    weather: [{ description, icon }],
  } = data;

  dt_txt = String(dt_txt).split(" ", 1);
  temp = (temp - 273.15).toFixed(1);

  if (index == 0) {
    return `<div class="weather-info">
          <h2>${cityName} (${dt_txt})</h2>
          <h4>Temperature: ${temp}°C</h4>
          <h4>Wind: ${speed} M/S</h4>
          <h4>Humidity: ${humidity}%</h4>
        </div>
        <div class="weather-img">
          <img
            src="https://openweathermap.org/img/wn/${icon}@2x.png"
            alt="weather-icon"
          />
          <h4>${description}</h4>
        </div>`;
  } else {
    return `<li class="card">
            <h2>(${dt_txt})</h2>
            <img
              src="https://openweathermap.org/img/wn/${icon}@2x.png"
              alt="weather-icon"
            />
            <h4>${description}</h4>
            <h4>Temp: ${temp}°C</h4>
            <h4>Wind: ${speed} M/S</h4>
            <h4>Humidity: ${humidity}%</h4>
          </li>`;
  }
};

function getUserCoordinates() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

      fetch(REVERSE_GEOCODING_URL)
        .then((res) => res.json())
        .then((data) => {
          const { name } = data[0];
          getWeatherData(latitude, longitude, name);
        })
        .catch(() => {
          alert("An error occurred while fetching the city!");
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Geoloction request denied. Please reset location permission to grant access again."
        );
      }
    }
  );
}

function getCityCoordinates() {
  const cityName = searchInput.value.trim();

  if (!cityName) return;

  const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);

      const { lat, lon, name } = data[0];

      getWeatherData(lat, lon, name);
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates!");
    });
}

function getWeatherData(lat, lon, name) {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      const forecastDays = [];

      const forecastData = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!forecastDays.includes(forecastDate)) {
          return forecastDays.push(forecastDate);
        }
      });

      currentWeather.innerHTML = "";
      forecastCards.innerHTML = "";

      forecastData.forEach((weatherItem, index) => {
        if (index == 0) {
          currentWeather.innerHTML = "";
          currentWeather.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(weatherItem, index, name)
          );
        } else if (index > 0 && index < 5) {
          forecastCards.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(weatherItem, index, name)
          );
        }
      });
    })
    .catch((error) => {
      alert(error);
    });
}

searchBtn.addEventListener("click", getCityCoordinates);

locationBtn.addEventListener("click", getUserCoordinates);
