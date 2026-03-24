const API_KEY = import.meta.env.VITE_MEMBRAIN_API_KEY;
const BASE_URL = "https://mem-brain-api-cutover-v4-production.up.railway.app/api/v1";

// 🔹 helper
async function request(endpoint, method = "POST", body = null) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  console.log("API Response:", data);
  return data;
}

// ✅ CREATE MEMORY
export async function storeMemory(memory) {
  return request("/memories", "POST", {
    content: memory.content,
    metadata: memory.metadata || {},
  });
}

// ✅ SEARCH (SEMANTIC)
export async function searchMemories(query) {
  return request("/memories/search", "POST", {
    query,
  });
}

// ✅ GET GRAPH (we’ll use neighborhood)
export async function getGraph(memoryId) {
  return request(`/graph/neighborhood?memory_id=${memoryId}`, "GET");
}

// ✅ STATS (instead of decay for now)
export async function getStats() {
  return request("/stats", "GET");
}