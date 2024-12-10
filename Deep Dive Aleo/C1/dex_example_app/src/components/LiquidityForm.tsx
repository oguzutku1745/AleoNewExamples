import { useState, useEffect, ChangeEvent } from "react";
import { Transaction, WalletAdapterNetwork, WalletNotConnectedError } from "@demox-labs/aleo-wallet-adapter-base";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

type LiquidityFormProps = {
  action: "add" | "remove";
  balance: string | null;
  token1: string;
  token2: string;
  reserve_a: number | null;
  reserve_b: number | null;
  supply: number | null;
  approvedAmount1: number | null;
  approvedAmount2: number | null;
};

function LiquidityForm({ action, balance, token1, token2, reserve_a, reserve_b, supply, approvedAmount1, approvedAmount2 }: LiquidityFormProps) {
  const { publicKey, requestTransaction } = useWallet();
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");
  const [removeAmount, setRemoveAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [withdrawAmountA, setWithdrawAmountA] = useState<string | null>(null);
  const [withdrawAmountB, setWithdrawAmountB] = useState<string | null>(null);
  const [isAllowanceValid1, setIsAllowanceValid1] = useState(false);
  const [isAllowanceValid2, setIsAllowanceValid2] = useState(false);

  useEffect(() => {
    if (action === "add") {
      checkApprovals();
    }
  }, [token1Amount, token2Amount, approvedAmount1, approvedAmount2, action]);

  async function checkApprovals() {
    console.log(approvedAmount1)
    console.log(approvedAmount2)
    if (token1Amount && token2Amount && approvedAmount1 !== null && approvedAmount2 !== null) {


      try {
        setIsAllowanceValid1(Number(token1Amount) <= approvedAmount1);
        setIsAllowanceValid2(Number(token2Amount) <= approvedAmount2);
      } catch (e) {
        console.error("Error while checking approvals: ", e);
      }
    }
  }

  const handleToken1Change = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToken1Amount(value);

    if (token1Amount && reserve_a && reserve_b) {
      const required_amount_b = Math.floor((parseFloat(value) * reserve_b) / reserve_a);
      setToken2Amount(required_amount_b.toString());
    }
  };

  const handleRemoveAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!balance) return;
    const value = e.target.value;
    setRemoveAmount(value);
    setPercentage(Math.floor((parseInt(value) / parseInt(balance)) * 100));
  };

  const handlePercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!balance) return;
    const value = Number(e.target.value);
    setPercentage(value);
    setRemoveAmount((Math.floor((parseFloat(balance) * value) / 100)).toString());
  };

  async function approve_token(tokenId: string, amount: string) {
    if (!publicKey) throw new WalletNotConnectedError();
  
    const inputs = [tokenId, "aleo1789vf4eq3dnm236j4us7w7aqqkgxxly7xf2hxvpqwxx3zzef35zq4t30xl", `${amount}u128`];
    const fee = 35_000;
  
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
        const response = await requestTransaction(aleoTransaction);
        console.log(response);
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }
  }
  

  const calculateWithdrawalAmounts = () => {
    if (reserve_a && reserve_b && removeAmount && supply) {
      const liquidity = parseFloat(removeAmount);
      const amount_a = (liquidity * reserve_a) / supply;
      const amount_b = (liquidity * reserve_b) / supply;

      setWithdrawAmountA(Math.floor(amount_a).toString());
      setWithdrawAmountB(Math.floor(amount_b).toString());
      setShowModal(true);
    }
  };

  async function withdraw_liquidity() {
    if (!publicKey) throw new WalletNotConnectedError();

    if (!withdrawAmountA && !withdrawAmountB && supply) {
      return;
    }

    const inputs = [token1, token2, `${removeAmount}u128`, `${supply}u128`, `${reserve_a}u128`, `${reserve_b}u128`, publicKey];
    const fee = 750_000; // This will fail if fee is not set high enough

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "test_swap_15.aleo",
      "remove_liquidity",
      inputs,
      fee,
      false
    );

    if (requestTransaction) {
      try {
        const response = await requestTransaction(aleoTransaction);
        console.log(response);
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }
  }

  const buttonLabel = () => {
    if (!isAllowanceValid1) return `Approve ${token1}`;
    if (!isAllowanceValid2) return `Approve ${token2}`;
    return "Confirm Add Liquidity";
  };

  async function add_liquidity() {
    
    if (!publicKey) throw new WalletNotConnectedError();
    
    if (!token1Amount && !token2Amount && supply) {
      return;
    }
    
    console.log("called")

    const inputs = [token1, token2, `${token1Amount}u128`, `${token2Amount}u128`, `${supply}u128`, `${reserve_a}u128`, `${reserve_b}u128`];
    const fee = 750_000; // This will fail if fee is not set high enough

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "test_swap_15.aleo",
      "add_liquidity",
      inputs,
      fee,
      false
    );

    if (requestTransaction) {
      try {
        const response = await requestTransaction(aleoTransaction);
        console.log(response);
      } catch (error) {
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }
  }

  const handleButtonClick = async () => {
    if (!isAllowanceValid1) {
      approve_token(token1, token1Amount);
    } else if (!isAllowanceValid2) {
      approve_token(token2, token2Amount);
    } else {
      console.log("Test")
      await add_liquidity();
    }
  };

  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-lg">
      {action === "add" ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Add Liquidity</h3>
          <div className="mb-4">
            <label className="block mb-2">Token 1 Amount ({token1})</label>
            <input
              type="number"
              value={token1Amount}
              onChange={handleToken1Change}
              className="p-2 border border-gray-500 rounded w-full text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Token 2 Amount ({token2})</label>
            <input
              type="number"
              value={token2Amount}
              readOnly
              className="p-2 border border-gray-500 rounded w-full bg-gray-800 text-gray-400"
            />
          </div>
          <button
            className={`p-2 rounded-lg w-full ${!isAllowanceValid1 || !isAllowanceValid2 ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            onClick={handleButtonClick}
          >
            {buttonLabel()}
          </button>

        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-3">Remove Liquidity</h3>
          <div className="mb-4">
            <label className="block mb-2">Amount to Remove</label>
            <input
              type="number"
              value={removeAmount}
              onChange={handleRemoveAmountChange}
              className="p-2 border border-gray-500 rounded w-full text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Percentage of Balance to Remove</label>
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={handlePercentageChange}
              className="w-full"
            />
            <p>{percentage}%</p>
          </div>
          <button
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 w-full"
            onClick={calculateWithdrawalAmounts}
          >
            Confirm Remove Liquidity
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Withdrawal Summary</h3>
            <p>You will receive:</p>
            <p>{withdrawAmountA} of {token1}</p>
            <p>{withdrawAmountB} of {token2}</p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                onClick={withdraw_liquidity}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiquidityForm;
