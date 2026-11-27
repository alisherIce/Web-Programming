const { useEffect, useState } = React;

const conditions = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Drizzle",
  55: "Dense drizzle", 56: "Freezing drizzle", 57: "Dense freezing drizzle",
  61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain",
  67: "Heavy freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  77: "Snow grains", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Heavy snow showers", 95: "Thunderstorm",
  96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

function WeatherDashboard() {
  const [query, setQuery] = useState("Seongnam");
  const [city, setCity] = useState("Seongnam");
  const [result, setResult] = useState({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadWeather() {
      setResult({ status: "loading", city });
      try {
        const searchUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        searchUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
        const searchResponse = await fetch(searchUrl, { signal });
        if (!searchResponse.ok) throw new Error(`City lookup failed (${searchResponse.status}). Try again.`);
        const searchData = await searchResponse.json();
        const place = searchData.results?.[0];
        if (!place) throw new Error(`No city found for “${city}”. Check the spelling and try again.`);

        const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
        weatherUrl.search = new URLSearchParams({
          latitude: String(place.latitude), longitude: String(place.longitude),
          current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day",
          timezone: "auto",
        });
        const weatherResponse = await fetch(weatherUrl, { signal });
        if (!weatherResponse.ok) throw new Error(`Weather request failed (${weatherResponse.status}). Try again.`);
        const weatherData = await weatherResponse.json();
        if (!weatherData.current) throw new Error("The weather service returned no current conditions.");

        setResult({ status: "ready", place, current: weatherData.current, units: weatherData.current_units });
      } catch (error) {
        if (error.name === "AbortError") return;
        setResult({ status: "error", message: error instanceof TypeError ? "Could not reach the weather service. Check your connection and try again." : error.message });
      }
    }

    loadWeather();
    return () => controller.abort();
  }, [city]);

  function search(event) {
    event.preventDefault();
    const nextCity = query.trim();
    if (nextCity) setCity(nextCity);
  }

  const { status } = result;
  return (
    <section className="panel weather-panel" aria-labelledby="weather-title">
      <div className="panel-heading"><div><div className="mono">CURRENT CONDITIONS</div><h2 id="weather-title">Weather at a glance</h2></div><span className={`weather-state state-${status}`}>{status === "ready" ? "LIVE" : status.toUpperCase()}</span></div>
      <form className="weather-search" onSubmit={search} role="search">
        <label className="sr-only" htmlFor="city-search">City name</label>
        <input id="city-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city" autoComplete="off" />
        <button className="btn primary" type="submit" disabled={!query.trim()}>Search city</button>
      </form>
      {status === "loading" && <div className="weather-message" role="status"><span className="spinner" aria-hidden="true"></span><span>Finding current conditions for {result.city || city}…</span></div>}
      {status === "error" && <div className="weather-message error" role="alert"><strong>Could not load weather</strong><span>{result.message}</span></div>}
      {status === "ready" && (
        <div className="weather-result">
          <div className="weather-main"><span className="weather-icon" aria-hidden="true">{result.current.is_day ? "☀️" : "🌙"}</span><div><p className="place-name">{result.place.name}{result.place.admin1 ? `, ${result.place.admin1}` : ""}</p><p className="country">{result.place.country}</p><p className="description">{conditions[result.current.weather_code] || "Current conditions"}</p></div><div className="temperature">{Math.round(result.current.temperature_2m)}<span>{result.units.temperature_2m}</span></div></div>
          <div className="weather-metrics"><div><span>Feels like</span><strong>{Math.round(result.current.apparent_temperature)}{result.units.apparent_temperature}</strong></div><div><span>Humidity</span><strong>{result.current.relative_humidity_2m}{result.units.relative_humidity_2m}</strong></div><div><span>Wind</span><strong>{Math.round(result.current.wind_speed_10m)} {result.units.wind_speed_10m}</strong></div></div>
          <p className="updated">Coordinates: {result.place.latitude.toFixed(2)}, {result.place.longitude.toFixed(2)} · Local time zone: {result.place.timezone || "city time"}</p>
        </div>
      )}
      <p className="attribution">Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>. Search needs an internet connection.</p>
    </section>
  );
}

ReactDOM.createRoot(document.getElementById("weather-app")).render(<WeatherDashboard />);
