import { useEffect } from "react";
import { storeMemory, getMemoryJob } from "./api/membrain";

function App() {
  useEffect(() => {
    async function test() {
      const res = await storeMemory({
        content: "Increase monthly profit",
        metadata: {
          type: "goal",
          reasoning: "To grow business",
        },
      });

      console.log("STORE:", res);

      // 🔥 WAIT a bit (important)
      setTimeout(async () => {
        const jobResult = await getMemoryJob(res.job_id);
        console.log("FINAL RESULT:", jobResult);
      }, 2000);
    }

    test();
  }, []);

  return <h1>Membrain Connected ✅</h1>;
}

export default App;