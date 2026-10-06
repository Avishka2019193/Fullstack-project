import { useState, useEffect } from 'react'
import weatherService from '../services/weather'

const Country = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const languages = Object.values(country.languages || {})
  const capital = country.capital?.[0]

  useEffect(() => {
    if (capital) {
      weatherService.getWeather(capital)
        .then(data => setWeather(data))
        .catch(() => setWeather(null))
    }
  }, [capital])

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>capital {capital}</p>
      <p>area {country.area}</p>

      <h3>languages</h3>
      <ul>
        {languages.map(lang => <li key={lang}>{lang}</li>)}
      </ul>

      <img src={country.flags.png} alt={`flag of ${country.name.common}`} width="150" />

      {weather && (
        <div>
          <h3>Weather in {capital}</h3>
          <p>temperature {weather.main.temp} °C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p>wind {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default Country