import axios from "axios";
import { Button } from "./components/ui/button";
import "./index.css";
import { useRef, useState } from "react";

const BACKEND_URL = "http://localhost:3000"

export function App() {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");

  async function pollBackend(submissionId: string) {
    const response = await axios.get(`${BACKEND_URL}/submission/${submissionId}`)
    if (response.data.submission.status !== "Processing") {
      setStatus(response.data.submission.status)
      setOutput(response.data.submission.output)
    } else {
      // TODO : ADD EXPONENTIAL BACKOFF
      await new Promise(r => setTimeout(r, 3000));
      pollBackend(submissionId)
    }
  }

  return (
    <div className="h-screen w-screen flex m-4">
      <div className="flex-1 h-screen">
        <div className="flex justify-between">
          <div>
            <Button variant={selectedLanguage === "cpp" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("cpp")}>CPP</Button>
            <Button variant={selectedLanguage === "js" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("js")}>JS</Button>
            <Button variant={selectedLanguage === "py" ? "destructive" : "outline"} onClick={() => setSelectedLanguage("py")}>Python</Button>
          </div>
          <div>
            <Button onClick={async () => {
              setStatus("Processing");
              setOutput("");

              const response = await axios.post(`${BACKEND_URL}/submission`, {
                "code": textAreaRef.current!.value,
                "language": selectedLanguage
              })

              pollBackend(response.data.id)
            }}>Submit</Button>
          </div>
        </div>
        <textarea ref={textAreaRef} className="h-screen w-full border rounded m-4 p-4" rows={500}>
        </textarea>
      </div>
      <div className="flex-1 h-screen bg-green-300">
        <div>
          {status}
        </div>
        <div>
          {output}
        </div>
      </div>
      
    </div>
  );
}

export default App;
