import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        'content-Type': "application/json"
    }
});

export async function createTopology(payload) {
    const responce = await api.post("/topology/", payload);
    return responce.data;
}

export async function createDemands(payload) {
    const responce = await api.post("/demands/", payload);
    return responce.data;
}

export async function createOptimization(payload) {
    const responce = await api.post("/optimization/", payload);
    return responce.data;
}