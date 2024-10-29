import { useState, useEffect } from "react";
import { getPairData, getAllowancesForLiquidity } from "./utils/readMapping";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import utils from "../leo_utils/build/main.aleo?raw";
import { AleoWorker } from "./workers/AleoWorker";
import { useNavigate } from "react-router-dom";

const aleoWorker = AleoWorker();

function Pool() {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [firstToken, setFirstToken] = useState("ALEO");
  const [customTokenId, setCustomTokenId] = useState("");
  const [secondTokenId, setSecondTokenId] = useState("");
  const [pairMissing, setPairMissing] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [pid, setPid] = useState("");
  const [approvedAmount1, setApprovedAmount1] = useState<number | null>(null);
  const [approvedAmount2, setApprovedAmount2] = useState<number | null>(null);

  const handleFirstTokenChange = (e: any) => {
    const value = e.target.value;
    setFirstToken(value);
    if (value !== "Other") {
      setCustomTokenId("");
    }
  };

  
  const fetchPairData = async () => {
    const token1 = firstToken === "Other" ? customTokenId : firstToken;

    if (customTokenId && secondTokenId && publicKey) {
      setIsLoading(true);
      const result = await aleoWorker.localProgramExecution(
        utils,
        "swap_needed_keys",
        [publicKey, "test_swap_14.aleo", token1, secondTokenId]
      );
      console.log(JSON.stringify(result));
      setPid(result[2]);

      if (result[2]) {
        try {
          const pairDataResult = await getPairData(result[2]);

          console.log(pairDataResult)

          if (!pairDataResult) {
            setPairMissing(true);
            return;
          }

          if (result[0] && result[1]) { 

            const allowance_keys = await getAllowancesForLiquidity(result[0], result[1]);

            console.log(allowance_keys)

            if (allowance_keys) {

              console.log("Called")

              let approvedAmount_1 = 0;
              let approvedAmount_2 = 0;
              if (typeof allowance_keys.allowances_1 === "string" && typeof allowance_keys.allowances_2 === "string") {
                const match_1 = allowance_keys.allowances_1.match(/^(\d+)u128$/);
                const match_2 = allowance_keys.allowances_2.match(/^(\d+)u128$/);

                approvedAmount_1 = match_1 ? parseInt(match_1[1], 10) : 0;
                approvedAmount_2 = match_2 ? parseInt(match_2[1], 10) : 0;

                console.log(approvedAmount_1)
                console.log(approvedAmount_2)

                setApprovedAmount1(approvedAmount_1);
                setApprovedAmount2(approvedAmount_2);

              }
            }

          }

        } catch (error) {
          console.error("Error fetching allowance mapping:", error);
          setPairMissing(true); // Set to false if there's an error
        } finally {
          setIsLoading(false); // Stop loading
        }
      }
    }
  };
  // Effect to fetch pair data when both token IDs are provided
  useEffect(() => {
    if (
      (firstToken === "Other" ? customTokenId : firstToken) &&
      secondTokenId
    ) {
      const debounceTimeout = setTimeout(() => {
        fetchPairData();
      }, 1000); // 1-second debounce delay

      // Clear timeout if input changes within the delay period
      return () => clearTimeout(debounceTimeout);
    }
  }, [firstToken, customTokenId, secondTokenId, publicKey]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 border border-gray-300 rounded-lg shadow-md mx-auto mt-10">
     
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
            onChange={(e) => setCustomTokenId(e.target.value)}
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

      {/* Import or Create Pair Button */}
      <button
        className={`w-full p-4 rounded-lg font-bold ${
          !pairMissing
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"  
        }`}
        onClick={() => {
          const token1 = firstToken === "Other" ? customTokenId : firstToken;
          if (token1 === "") {
            alert("Please enter a Token ID for Token 1");
          } else if (secondTokenId === "") {
            alert("Please enter a Token ID for Token 2");
          } else {
            if (pairMissing) {
              alert(`Creating pair with ${token1} and ${secondTokenId}`);
            } else {
              navigate("/liquidity", { state: { token1, token2: secondTokenId, utils, pid, approvedAmount1, approvedAmount2 } });
            }
          }
        }}
        disabled={isLoading}
      >
        {isLoading
          ? "Loading..."
          : !pairMissing
          ? "Import Pool"
          : "Create Pair"}
      </button>
    </div>
  );
}

export default Pool;
