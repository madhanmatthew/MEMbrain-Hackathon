import { useEffect } from "react";
import { storeMemory } from "./api/membrain";

function App() {
  useEffect(() => {
    storeMemory({
      content: "Increase monthly profit",
      metadata: {
        type: "goal",
        reasoning: "To grow business",
      },
    }).then((res) => {
      console.log("STORE RESULT:", res);
    });
  }, []);

  return <h1>Testing Membrain API...</h1>;
}

export default App;