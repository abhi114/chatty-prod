import axios from "axios";
//withCredentials means send each requrest with cookies
// import.meta.env is a special object provided by Vite that contains environment variables.
// import.meta.env.MODE specifically refers to the current mode of the application (development, production, etc.).
// This is similar to process.env.NODE_ENV in Webpack-based applications.
export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api":"/api",
    withCredentials:true,
})