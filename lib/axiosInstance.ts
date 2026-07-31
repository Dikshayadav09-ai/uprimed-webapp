import axios from "axios";
import { apiURL } from "./constants";

export const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 5000,
  withCredentials: true, // allow cookies/session
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  validateStatus: () => true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // or sessionStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
