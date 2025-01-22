import axios from "axios";

const VERCELURL = 'https://server-1-0.vercel.app/'
const LOCALHOST = 'http://localhost:3000/'

const api = axios.create({
    baseURL: LOCALHOST,
})

export default api;