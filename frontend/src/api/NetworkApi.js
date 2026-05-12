import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "application/json"
    }
});

export async function createTopology(payload) {
    const response = await api.post("/topology/", payload);
    return response.data;
}

export async function createDemands(payload) {
    const response = await api.post("/demands/", payload);
    return response.data;
}

export async function createOptimization(payload) {
    const response = await api.post("/optimization/", payload);
    return response.data;
}

export async function saveOptimizationResult(payload) {
    const response = await api.post("/results", payload);
    return response.data;
}

export async function getOptimizationResults(scenarioId) {
    const response = await api.get(`/optimizeResults/${scenarioId}`);
    return response.data;
}