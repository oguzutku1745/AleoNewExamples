import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";
import { getBalanceData, getPairData, getRegisteredTokenData } from "../utils/readMapping";
import { AleoWorker } from "../workers/AleoWorker";
import LiquidityForm from "./LiquidityForm";

const worker = AleoWorker();

function LiquidityManager() {
  const { state } = useLocation();
  const { token1, token2, utils, pid, approvedAmount1, approvedAmount2 } = state || {};
  const { publicKey } = useWallet();
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<"add" | "remove" | null>(null);
  const [reserveA, setReserveA] = useState<number | null>(null)
  const [reserveB, setReserveB] = useState<number | null>(null)
  const [supply, setSupply] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (publicKey && token1 && token2) {
        setIsLoading(true);
        try {
          const { token_id, balance } = await fetchUserTokenBalance();
          setTokenId(token_id);
          setBalance(balance);
        } catch (error) {
          console.error("Error fetching user balance:", error);
          setTokenId(null);
          setBalance(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserBalance();
  }, [publicKey, token1, token2]);

  async function calculate_balance_id() {
    try {
      if (pid && publicKey) {
        const result = await worker.localProgramExecution(
          utils,
          "get_balance_key",
          [pid, publicKey]
        );

        return result[0];
      } else {
        console.log("Inputs are not fully provided");
      }
    } catch (e) {
      console.error("Error calculating the id", e);
    }
  }

  async function fetchUserTokenBalance(): Promise<{ token_id: string; balance: string }> {
    try {
      const balance_id = await calculate_balance_id();
      const pairDataResult = await getPairData(pid);
      const result = await getBalanceData(balance_id);
      const tokenResult = await getRegisteredTokenData(pid);


      if (typeof result === "string") {
        const tokenIdMatch = result.match(/token_id:\s*(\S+)/);
        const balanceMatch = result.match(/balance:\s*(\d+u128)/);

        if (typeof pairDataResult === "string") {
            try {
              const reserveAMatch = pairDataResult.match(/reserve_a:\s*(\d+)u128/);
              const reserveBMatch = pairDataResult.match(/reserve_b:\s*(\d+)u128/);
    
              const reserve_a = reserveAMatch ? parseInt(reserveAMatch[1], 10) : 0;
              const reserve_b = reserveBMatch ? parseInt(reserveBMatch[1], 10) : 0;

              if (typeof tokenResult === "string") {

                const supplyMatch = tokenResult.match(/supply:\s*(\d+)u128/);
                const supply = supplyMatch ? parseInt(supplyMatch[1], 10) : 0;
                setSupply(supply);
              } else {
                console.error("Couldn't fetch supply.")
              }
              setReserveA(reserve_a);
              setReserveB(reserve_b);
              
              
            } catch (e) {
                console.error("Error while setting reserve: ", e);
            }
        }

        if (tokenIdMatch && balanceMatch) {
          const token_id = tokenIdMatch[1];
          const balance = balanceMatch[1];
          return { token_id, balance };
        } else {
          throw new Error("Could not parse token_id or balance from the result.");
        }
      } else {
        throw new Error("Balance data is not a string.");
      }


    } catch (error) {
      console.error("Error while fetching balance", error);
      throw new Error("Failed to fetch balance data.");
    }
  }

  const formattedTokenId = tokenId ? `${tokenId.slice(0, 10)}...${tokenId.slice(-5)}` : "No token ID available";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 border border-gray-300 rounded-lg shadow-md mx-auto mt-10 text-white bg-black">
      {isLoading ? (
        <p>Loading balance...</p>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-5">Manage Liquidity</h2>
          <p>Token ID: {formattedTokenId}</p>
          <p>User Balance: {balance || "No balance available"}</p>
          <div className="flex gap-4 mt-4">
            <button
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
              onClick={() => setAction("add")}
            >
              Add Liquidity
            </button>
            {balance && parseInt(balance) > 0 && (
              <button
                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                onClick={() => setAction("remove")}
              >
                Remove Liquidity
              </button>
            )}
          </div>

          {action && (
            <LiquidityForm action={action} balance={balance} token1={token1} token2={token2} reserve_a={reserveA} reserve_b={reserveB} supply={supply} approvedAmount1={approvedAmount1} approvedAmount2={approvedAmount2} />
          )}
        </div>
      )}
    </div>
  );
}

export default LiquidityManager;
