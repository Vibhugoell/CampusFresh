import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("dept-token");
  if (token) {
    req.headers["x-dept-token"] = token;   // 👈 matches backend
  }
  req.headers["Content-Type"] = "application/json";
  return req;
});

export default API;
