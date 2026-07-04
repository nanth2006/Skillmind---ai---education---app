import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("Token:", token);
  console.log("Request URL:", config.url);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      "API FAILED:",
      err.response?.status,
      err.config?.url,
      err.response?.data
    );

    return Promise.reject(err);
  }
);

export default API;