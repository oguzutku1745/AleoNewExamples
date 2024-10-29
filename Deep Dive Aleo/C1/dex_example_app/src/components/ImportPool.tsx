import { useState } from "react";

export function ImportPool() {
  // State to track the selected token for the first input (default ALEO)
  const [firstToken, setFirstToken] = useState("ALEO");
  // State to track the custom token ID if "Other" is selected
  const [customTokenId, setCustomTokenId] = useState("");
  
  // State to track the custom token ID for the second input
  const [secondTokenId, setSecondTokenId] = useState("");

  // Handle change for the first token dropdown
  const handleFirstTokenChange = (e:any) => {
    const value = e.target.value;
    setFirstToken(value);
    // If user selects something other than "Other", clear the custom token ID
    if (value !== "Other") {
      setCustomTokenId("");
    }
  };



  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 border border-gray-300 rounded-lg shadow-md mx-auto mt-10">
      {/* First Token Selection (ALEO by default) */}
      <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
        <label className="mr-2 font-bold">Token 1</label>
        <select
          className="p-2 border border-gray-300 rounded-lg w-full"
          value={firstToken}
          onChange={handleFirstTokenChange}
        >
          <option value="ALEO">ALEO</option>
          <option value="Other">+ Token ID</option>
        </select>
      </div>

      {/* Conditionally render Token ID input if "Other" is selected */}
      {firstToken === "Other" && (
        <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Enter custom Token ID for Token 1"
            className="w-full p-2 border border-gray-300 rounded"
            value={customTokenId}
            onChange={(e) => setCustomTokenId(e.target.value)} // Allow user to edit the Token ID
          />
        </div>
      )}

      {/* Second Token ID Input */}
      <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
        <label className="mr-2 font-bold">Token 2</label>
        <input
          type="text"
          placeholder="Enter custom Token ID for Token 2"
          className="p-2 border border-gray-300 rounded-lg w-full"
          value={secondTokenId}
          onChange={(e) => setSecondTokenId(e.target.value)}
        />
      </div>


      {/* Import Pool Button */}
      <button
        className="w-full p-4 text-white bg-blue-500 rounded-lg font-bold hover:bg-blue-600"
        onClick={() => {
          // Handle Import Pool logic
          const token1 = firstToken === "Other" ? customTokenId : firstToken;
          if (token1 === "") {
            alert("Please enter a Token ID for Token 1");
          } else if (secondTokenId === "") {
            alert("Please enter a Token ID for Token 2");
          } else {
            alert(`Importing pool with ${token1} and ${secondTokenId}`);
          }
        }}
      >
        Import Pool
      </button>
    </div>
  );
}
