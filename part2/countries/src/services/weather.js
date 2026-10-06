import axios from "axios";

const apiKey = import.meta.env.VITE_WEATHER_KEY;

const getWeather = (capital) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`;
  return axios.get(url).then((response) => response.data);
};

export default { getWeather };
