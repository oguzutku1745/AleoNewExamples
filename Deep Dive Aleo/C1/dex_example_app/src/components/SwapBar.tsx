import { useState, useEffect } from "react";
import utils from "../../leo_utils/build/main.aleo?raw";
import { AleoWorker } from "../workers/AleoWorker";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { getAllowanceMapping, getPairData } from "../utils/readMapping";
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";

const aleoWorker = AleoWorker();

const SwapBar = () => {
  const { publicKey, requestTransaction } = useWallet();
  const [selectedInputCoin, setSelectedInputCoin] = useState("ALEO");
  const [selectedOutputCoin, setSelectedOutputCoin] = useState("ALEO");
  const [inputTokenId, setInputTokenId] = useState("");
  const [outputTokenId, setOutputTokenId] = useState("");
  const [inputReserve, setInputReserve] = useState("");
  const [outputReserve, setOutputReserve] = useState("");
  const [selectedInputAmount, setSelectedInputAmount] = useState("");
  const [calculatedOutput, setCalculatedOutput] = useState("");
  const [hasOutputAmount, setHasOutputAmount] = useState(false);
  const [isAllowanceValid, setIsAllowanceValid] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [swapResponse, setSwapResponse] = useState("");
  const [pairMissing, setPairMissing] = useState(false);

  async function execute_swap() {
    console.log(publicKey,selectedInputAmount, inputTokenId, outputTokenId, requiresApproval,hasOutputAmount,pairMissing)
    if (!publicKey) throw new WalletNotConnectedError();

    if (!hasOutputAmount) {
      return
    }
    
    console.log("called")
    const inputs = [inputTokenId, outputTokenId, `${selectedInputAmount}u128`, `${inputReserve}u128`, `${outputReserve}u128`, publicKey];

    const fee = 500_000; // This will fail if fee is not set high enough

    console.log("called 2")
    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "test_swap_15.aleo",
      "swap_exact_tokens_for_tokens",
      inputs,
      fee,
      false
    );

    console.log("Tx: ", aleoTransaction);

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        setSwapResponse(response);
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }

  }

  async function approve_token() {
    if (!publicKey) throw new WalletNotConnectedError();

    if (!inputTokenId && !selectedInputAmount) {
      return
    }

    const inputs = [inputTokenId, "aleo1789vf4eq3dnm236j4us7w7aqqkgxxly7xf2hxvpqwxx3zzef35zq4t30xl", `${selectedInputAmount}u128`];

    const fee = 35_000; // This will fail if fee is not set high enough

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "token_registry.aleo",
      "approve_public",
      inputs,
      fee,
      false
    );

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        console.log(response)
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }

  }

  async function calculate_output(pairDataResult:string | Error) {
    console.log("called");
    setHasOutputAmount(false);


    if (pairDataResult) {
      console.log(pairDataResult);

      if (typeof pairDataResult === "string") {
        try {
          const reserveAMatch = pairDataResult.match(/reserve_a:\s*(\d+)u128/);
          const reserveBMatch = pairDataResult.match(/reserve_b:\s*(\d+)u128/);

          const reserve_a = reserveAMatch ? parseInt(reserveAMatch[1], 10) : 0;
          const reserve_b = reserveBMatch ? parseInt(reserveBMatch[1], 10) : 0;

          setInputReserve(reserve_a.toString())
          setOutputReserve(reserve_b.toString())

          console.log("reserve_a:", reserve_a);
          console.log("reserve_b:", reserve_b);

          // Calculate amount_out
          const inputAmount = parseInt(selectedInputAmount, 10) || 0;
          const amount_out =
            (inputAmount * reserve_b) / (reserve_a + inputAmount);
          setCalculatedOutput(amount_out.toString());
          console.log(amount_out);
          setHasOutputAmount(true);
        } catch (e) {
          setHasOutputAmount(false);
        }
      }
    }
  }

  // Function to get allowance hash when both token IDs are provided
  async function get_allowance_hash() {
    if (inputTokenId && outputTokenId && publicKey) {
      const result = await aleoWorker.localProgramExecution(
        utils,
        "swap_needed_keys",
        [publicKey, "test_swap_15.aleo", inputTokenId, outputTokenId]
      );
      console.log(JSON.stringify(result));

      if (result[0] && result[1]) {
        try {
          // Fetch the allowance mapping based on allowanceKeyResponse
          const allowanceMappingResult = await getAllowanceMapping(result[0]);
          const pairDataResult = await getPairData(result[2]);

          console.log(allowanceMappingResult)
          console.log(pairDataResult)

          if (!pairDataResult) {
            setPairMissing(true);
            return
          }

          let approvedAmount = 0;
          if (typeof allowanceMappingResult === "string") {
            const match = allowanceMappingResult.match(/^(\d+)u128$/);
            approvedAmount = match ? parseInt(match[1], 10) : 0;
          }

          // Compare selected input amount with approved amount
          const inputAmount = parseInt(selectedInputAmount, 10);

          if (inputAmount > approvedAmount) {
            setIsAllowanceValid(false); // Show "Approve" if input is more than approved
            calculate_output(pairDataResult);
            setRequiresApproval(true);
          } else {
            setIsAllowanceValid(true); // Show "Swap" if input is within approved limit
            calculate_output(pairDataResult);
            setRequiresApproval(false);
          }
        } catch (error) {
          console.error("Error fetching allowance mapping:", error);
        }
      }
    }
  }

  // Effect to trigger allowance hash calculation with debounce logic
  useEffect(() => {
    if (inputTokenId && outputTokenId && selectedInputAmount) {
      const debounceTimeout = setTimeout(() => {
        get_allowance_hash();
      }, 1000); // 1-second debounce delay

      // Clear timeout if input changes within the delay period
      return () => clearTimeout(debounceTimeout);
    }
  }, [inputTokenId, outputTokenId, selectedInputAmount, publicKey]);

  return (
    <div
      className={`flex flex-col items-center justify-center w-full max-w-md p-6 border border-gray-300 rounded-lg shadow-md mx-auto ${
        !publicKey ? "blur-sm" : ""
      }`}
    >
      {/* Display "Connect Wallet" if wallet is not connected */}
      {!publicKey && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
          <p className="text-gray-600 font-bold">Connect Wallet</p>
        </div>
      )}

      {/* Input Box with Drop-down */}
      <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter input amount"
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={selectedInputAmount}
          onChange={(e) => setSelectedInputAmount(e.target.value)}
        />
        <select
          className="p-2 border border-gray-300 rounded-lg"
          value={selectedInputCoin}
          onChange={(e) => setSelectedInputCoin(e.target.value)}
        >
          <option value="ALEO">ALEO</option>
          <option value="inputTokenId">+ Token ID</option>
        </select>
      </div>

      {/* Conditionally render the Token ID input box if "+ Token ID" is selected */}
      {selectedInputCoin === "inputTokenId" && (
        <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Enter Token ID"
            className="w-full p-2 border border-gray-300 rounded"
            value={inputTokenId}
            onChange={(e) => setInputTokenId(e.target.value)}
          />
        </div>
      )}

      {/* Output Box */}
      <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
        <input
          type="text"
          placeholder="Output amount"
          className="w-full p-2 border border-gray-300 rounded-lg"
          readOnly
          value={calculatedOutput}
        />
        <select
          className="p-2 border border-gray-300 rounded-lg"
          value={selectedOutputCoin}
          onChange={(e) => setSelectedOutputCoin(e.target.value)}
        >
          <option value="ALEO">ALEO</option>
          <option value="outputTokenId">+ Token ID</option>
        </select>
      </div>

      {selectedOutputCoin === "outputTokenId" && (
        <div className="w-full p-4 mb-4 border border-gray-200 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Enter Token ID"
            className="w-full p-2 border border-gray-300 rounded"
            value={outputTokenId}
            onChange={(e) => setOutputTokenId(e.target.value)}
          />
        </div>
      )}

      {/* Swap or Approve Button */}
      <button
        className={`w-full p-4 rounded-lg font-bold ${
          pairMissing
            ? "bg-gray-400 text-gray-700 cursor-not-allowed" 
            : isAllowanceValid
            ? "bg-blue-500 text-white hover:bg-blue-600"  
            : requiresApproval
            ? "bg-yellow-500 text-white hover:bg-yellow-600" 
            : "bg-gray-400 text-gray-700 cursor-not-allowed"  
        }`}
        onClick={requiresApproval ? approve_token : execute_swap}
        disabled={
          !publicKey ||
          selectedInputAmount === "" ||
          inputTokenId === "" ||
          outputTokenId === "" ||
          (requiresApproval && !hasOutputAmount) ||
          pairMissing
        }
      >
        {!pairMissing ? (isAllowanceValid ? "Swap" : "Approve") : "Pair Does Not Exist"}
      </button>
      {swapResponse}
    </div>
  );
};

export default SwapBar;
