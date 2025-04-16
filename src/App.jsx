import React, { useState } from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog, WiThunderstorm } from 'react-icons/wi'; // love these icons lol
import './App.css';

// weather app start
function App() {
  const [city_name, setCityName] = useState(''); 
  const [currentCity, setcurrentCity] = useState(""); 
  const [weatherVibes, setWeatherVibes] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isFetching, setIsFetching] = useState(false); 

  // Grab weather data from api
  const grabWeather = async () => {
    setIsFetching(true);
    try {
      let geoStuff = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city_name}&count=1`);
      if (!geoStuff.ok) throw new Error('Geo API is not working try later');
      geoStuff = await geoStuff.json();
      if (!geoStuff.results || geoStuff.results.length === 0) {
        setErrorMsg("Incorrect city name please enter correct city");
        setWeatherVibes(null);
        setCityName('');
        setIsFetching(false);
        return;
      }

      const lat = geoStuff.results[0].latitude; 
      const lon = geoStuff.results[0].longitude;
      let weatherData = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      if (!weatherData.ok) throw new Error('Weather API not working');
      weatherData = await weatherData.json(); // forgot to parse this once, ugh
      if (!weatherData.current) {
        throw new Error('No current weather data');
      }

      setWeatherVibes({
        now: weatherData.current, 
        dailyStuff: weatherData.daily
      });
      setcurrentCity(city_name); 
      setErrorMsg('');
    } catch (err) {
      setErrorMsg('Weather API crapped out, sorry');
      setWeatherVibes(null);
      console.log("Error was:", err); 
    }
    setIsFetching(false); 
  };

  // Form part here
  const handle_submit = e => {
    e.preventDefault();
    if (city_name.trim()) grabWeather(); // only if city is present
  }

  // Weather codes
  const describeWeather = (code) => {
    const vibes = {
      0: 'Clear sky',
      1: 'Mostly clear',
      2: 'Some clouds',
      3: 'Lots of clouds',
      45: 'Foggy',
      48: 'Dense fog',
      51: 'Slow rain',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Light rain',
      63: 'Raining',
      65: 'Raining aggressively',
      71: 'Snow drizzle',
      73: 'Snowy',
      75: 'Snowstorm',
      80: 'Light showers',
      81: 'Moderate showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with light hail',
      99: 'Thunderstorm with heavy hail'
    };
    return vibes[code] || 'Nothing';
  };

  // Icons here
  const getIcon = code => {
    if ([0,1].includes(code)) return <WiDaySunny size={40} />;
    if ([2,3].includes(code)) return <WiCloudy size={40} />;
    if ([45,48].includes(code)) return <WiFog size={40} />;
    if ([51,53,55,61,63,65,80,81,82].includes(code)) return <WiRain size={40} />;
    if ([71,73,75].includes(code)) return <WiSnow size={40} />;
    if ([95,96,99].includes(code)) return <WiThunderstorm size={48} />; 
    return null;
  }

  // weather based theme here
  const weatherStyle = (code) => {
    if ([0, 1].includes(code)) return 'sunny';
    if ([2, 3].includes(code)) return 'cloudy';
    if ([45, 48].includes(code)) return 'foggy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'rainy';
    if ([71, 73, 75].includes(code)) return 'snowy';
    if ([95, 96, 99].includes(code)) return 'thunder';
    return ''; // default
  }

  return (
    <div className="weather-app" style={{textAlign: 'center'}}> {}
      <h1 style={{color: 'white'}}>Free Weather App</h1>
      <form onSubmit={handle_submit}>
        <input
          type="text"
          placeholder="Type a name of a city"
          value={city_name}
          onChange={(e) => setCityName(e.target.value)}
          style={{padding: '10px'}} 
        />
        <button
          type="submit"
          disabled={isFetching}
        >
          {isFetching ? 'Searching..' : 'Search'}
        </button>
      </form>

      {isFetching && <div className="loading"><div className="loader"></div></div>}
      {errorMsg && <p className="error">{errorMsg}</p>}

      {weatherVibes && currentCity && weatherVibes.now && (
        <div className={`weather-box ${weatherStyle(weatherVibes.now.weather_code)}`}>
          <h2>Weather in {currentCity[0].toUpperCase() + currentCity.slice(1)}</h2>
          <div className="weather-icon">{getIcon(weatherVibes.now.weather_code)}</div>
          <p>Temp: {weatherVibes.now.temperature_2m}°C</p>
          <p>Vibes: {describeWeather(weatherVibes.now.weather_code)}</p>
          {weatherVibes.dailyStuff && (
            <>
              <p>High: {weatherVibes.dailyStuff.temperature_2m_max[0]}°C</p>
              <p>Low: {weatherVibes.dailyStuff.temperature_2m_min[0]}C</p> {}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;