import axios from "axios";

const baseUrl = "http://localhost:3001/persons";

const getAllpersons = () =>
  axios.get(baseUrl).then((response) => response.data);

const createperson = (personObject) =>
  axios.post(baseUrl, personObject).then((response) => response.data);

const updateperson = (id, updatedPersonObject) =>
  axios
    .put(`${baseUrl}/${id}`, updatedPersonObject)
    .then((response) => response.data);

const removeperson = (id) =>
  axios.delete(`${baseUrl}/${id}`).then((response) => response.data);

export default { getAllpersons, createperson, updateperson, removeperson };
