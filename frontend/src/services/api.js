import axios from "axios";

const API = axios.create({
baseURL: "http://127.0.0.1:8000/api/",
timeout: 5000
});

export const getOrganizations = () => API.get("organizations/");

export const getServices = (orgId) =>
API.get(`services/?organization=${orgId}`);

export const registerCustomer = (data) =>
API.post("register/", data);

export const getQueue = () =>
API.get("queue/");

export const callNext = (data) =>
API.post("call-next/", data);

export const completeToken = (data) =>
API.post("complete/", data);

export const getCounters = (orgId) =>
API.get(`counters/?organization=${orgId}`);