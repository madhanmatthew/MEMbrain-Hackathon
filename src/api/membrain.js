const API_KEY = import.meta.env.VITE_MEMBRAIN_API_KEY;
const BASE_URL = "https://mem-brain-api-cutover-v4-production.up.railway.app";

// helper function
async function request(endpoint, body = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("API Response:", data); // for debugging
  return data;
}

// 🔹 STORE MEMORY
export async function storeMemory(memory) {
  return request("/memory", memory);
}

// 🔹 SEARCH
export async function searchMemories(query) {
  return request("/search", { query });
}

// 🔹 GRAPH
export async function getGraph() {
  return request("/graph");
}

// 🔹 DECAY
export async function getDecay() {
  return request("/decay");
}