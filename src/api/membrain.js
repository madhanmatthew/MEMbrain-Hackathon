const API_KEY = import.meta.env.VITE_MEMBRAIN_API_KEY;
const BASE_URL = "https://mem-brain-api-cutover-v4-production.up.railway.app/api/v1";

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
  console.log(`[Membrain] ${method} ${endpoint}`, data);
  return data;
}

export async function storeMemory(memory) {
  return request("/memories", "POST", {
    content: memory.content,
    metadata: memory.metadata || {},
  });
}

export async function searchMemories(query) {
  return request("/memories/search", "POST", { query });
}

export async function getGraph(memoryId) {
  return request(`/graph/neighborhood?memory_id=${memoryId}`, "GET");
}

export async function getStats() {
  return request("/stats", "GET");
}

export async function getMemoryJob(jobId) {
  const res = await fetch(`${BASE_URL}/memories/jobs/${jobId}`, {
    method: "GET",
    headers: { "x-api-key": API_KEY },
  });
  const data = await res.json();
  console.log("JOB RESULT:", data);
  return data;
}

// THIS IS THE KEY ADDITION — polls until job is done
export async function waitForJob(jobId, maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 700));
    const result = await getMemoryJob(jobId);
    const status = result.status;
    if (status === "completed" || status === "complete" || status === "done") {
      return result;
    }
    if (status === "failed") throw new Error("Job failed: " + jobId);
    console.log(`[Job ${jobId}] attempt ${i+1} — status: ${status}`);
  }
  throw new Error("Job timed out: " + jobId);
}