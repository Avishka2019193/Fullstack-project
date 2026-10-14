import axios from "axios";

const baseUrl = "http://localhost:3001/api/persons";

const getAllpersons = () =>
  axios.get(baseUrl).then((response) => response.data);

const createperson = (personObject) =>
  axios.post(baseUrl, personObject).then((response) => response.data);

const removeperson = (id) =>
  axios.delete(`${baseUrl}/${id}`).then((response) => response.data);

export default { getAllpersons, createperson, removeperson };
