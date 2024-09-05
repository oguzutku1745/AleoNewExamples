import { useState } from "react";
import reactLogo from "./assets/react.svg";
import aleoLogo from "./assets/aleo.svg";
import "./App.css";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import {
  Transaction,
  WalletAdapterNetwork,
  WalletNotConnectedError,
} from "@demox-labs/aleo-wallet-adapter-base";
import { useWallet } from "@demox-labs/aleo-wallet-adapter-react";

function App() {
  const { publicKey, requestTransaction, requestRecordPlaintexts, decrypt } =
    useWallet();
  const [executingPublic, setExecutingPublic] = useState(false);
  const [executingPrivate, setExecutingPrivate] = useState(false);
  const [executingPrivateToPublic, setExecutingPrivateToPublic] =
    useState(false);
  const [executingPublicToPrivate, setExecutingPublicToPrivate] =
    useState(false);
  const [requestForRecords, setRequestForRecords] = useState(false);
  const [plainRecord, setPlainRecord] = useState("");
  const [cipherText, setCipherText] = useState("");
  const [decryptedRecord, setDecryptedRecord] = useState("");
  const [records, setRecords] = useState<any>();
  const [responsePublic, setResponsePublic] = useState("");
  const [responsePrivate, setResponsePrivate] = useState("");
  const [responsePrivateToPublic, setResponsePrivateToPublic] = useState("");
  const [responsePublicToPrivate, setResponsePublicToPrivate] = useState("");

  const decryption = async () => {
    if (!cipherText) throw new WalletNotConnectedError();
    if (decrypt) {
      const decryptedPayload = await decrypt(cipherText);
      setDecryptedRecord(decryptedPayload);
    }
  };

  const reqRecords = async () => {
    const program = "credits.aleo";
    if (!publicKey) throw new WalletNotConnectedError();

    setRequestForRecords(true);

    if (requestRecordPlaintexts) {
      const records = await requestRecordPlaintexts(program);

      // Filter out records that are spent
      const recordsFiltered = records.filter((rec) => !rec.spent);

      // Combine and format the filtered records into single objects
      const recordsCombined = recordsFiltered.map((rec) => ({
        id: rec.id,
        owner: rec.owner,
        program_id: rec.program_id,
        spent: rec.spent,
        recordName: rec.recordName,
        data: rec.data,
      }));

      // Render each combined object in the console
      recordsCombined.forEach((record) =>
        console.log(JSON.stringify(record, null, 2))
      );

      // If you want to set this combined data into state
      setRecords(recordsCombined);
    }

    setRequestForRecords(false);
  };

  const handleInputChange = (event: any) => {
    setPlainRecord(event.target.value);
  };

  const handleInputCiphertext = (event: any) => {
    setCipherText(event.target.value);
  };

  const transfer_private = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!plainRecord) {
      return;
    }
    setExecutingPrivate(true);

    // Note that the inputs must be formatted in the same order as the Aleo program function expects, otherwise it will fail
    const inputs = [JSON.parse(plainRecord), publicKey, `1000000u64`];
    const fee = 35_000; // This will fail if fee is not set high enough

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "credits.aleo",
      "transfer_private",
      inputs,
      fee
    );

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        setResponsePrivate(response);
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }
    setExecutingPrivate(false);
  };

  const transfer_private_to_public = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    if (!plainRecord) {
      return;
    }
    setExecutingPrivateToPublic(true);

    // Note that the inputs must be formatted in the same order as the Aleo program function expects, otherwise it will fail
    const inputs = [JSON.parse(plainRecord), publicKey, `1000000u64`];
    const fee = 35_000; // This will fail if fee is not set high enough

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "credits.aleo",
      "transfer_private_to_public",
      inputs,
      fee
    );

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        setResponsePrivateToPublic(response);
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }
    setExecutingPrivateToPublic(false);
  };

  const transfer_public = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    setExecutingPublic(true);

    // Note that the inputs must be formatted in the same order as the Aleo program function expects, otherwise it will fail
    const inputs = [publicKey, `1000000u64`];
    const fee = 35_000;

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "credits.aleo",
      "transfer_public",
      inputs,
      fee,
      false
    );

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        setResponsePublic(response);
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }

    setExecutingPublic(false);
  };

  const transfer_public_to_private = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    setExecutingPublicToPrivate(true);

    // Note that the inputs must be formatted in the same order as the Aleo program function expects, otherwise it will fail
    const inputs = [publicKey, `1000000u64`];
    const fee = 35_000;

    const aleoTransaction = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      "credits.aleo",
      "transfer_public_to_private",
      inputs,
      fee,
      false
    );

    if (requestTransaction) {
      try {
        // Await the response from the transaction request
        const response = await requestTransaction(aleoTransaction);

        // Set the response to the state using setResponse
        setResponsePublicToPrivate(response);
      } catch (error) {
        // Handle any errors
        console.error("Transaction failed:", error);
      }
    } else {
      console.error("requestTransaction is not available.");
    }

    setExecutingPublicToPrivate(false);
  };

  return (
    <>
      <div>
        <a href="https://aleo.org" target="_blank">
          <img src={aleoLogo} className="logo" alt="Aleo logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Aleo + React + Wallet Adapter</h1>
      <div className="card">
        <div
          style={{ margin: "10px", justifyContent: "center", display: "flex" }}
        >
          <WalletMultiButton />
        </div>
        <p>
          <button disabled={executingPublic} onClick={reqRecords}>
            {requestForRecords
              ? `Executing...check console for details...`
              : `Request Records from credits.aleo`}
          </button>
          <br />
        </p>
        <p>
          <button disabled={executingPublic} onClick={transfer_public}>
            {executingPublic
              ? `Executing...check console for details...`
              : `Transfer 1 AC Publicly to yourself`}
          </button>
          <span style={{ color: "white" }}>{responsePublic}</span>
          <br />
        </p>
        <p>
          <button
            disabled={executingPrivate}
            onClick={transfer_public_to_private}
          >
            {executingPublicToPrivate
              ? `Executing...check console for details...`
              : `Transfer 1 AC From Public to Private`}
          </button>
          <br />

          <span style={{ color: "white" }}>{responsePublicToPrivate}</span>
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            value={plainRecord}
            onChange={handleInputChange}
            placeholder="Enter plain record for transfers"
            style={{
              width: "400px",
              height: "20px",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <p>
          <button disabled={executingPrivate} onClick={transfer_private}>
            {executingPrivate
              ? `Executing...check console for details...`
              : `Transfer 1 AC Privately`}
          </button>
          <br />

          <span style={{ color: "white" }}>{responsePrivate}</span>
        </p>
        <p>
          <button
            disabled={executingPrivate}
            onClick={transfer_private_to_public}
          >
            {executingPrivateToPublic
              ? `Executing...check console for details...`
              : `Transfer 1 AC From Private to Public`}
          </button>
          <br />
          <span style={{ color: "white" }}>{responsePrivateToPublic}</span>
        </p>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            value={cipherText}
            onChange={handleInputCiphertext}
            placeholder="Enter record to decrypt"
            style={{
              width: "400px",
              height: "20px",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <p>
          <button disabled={executingPrivate} onClick={decryption}>
            {decryptedRecord
              ? `Executing...check console for details...`
              : `Decrypt Record`}
          </button>
          <br />
          <span style={{ color: "white" }}>{decryptedRecord}</span>
        </p>

        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      <p className="read-the-docs">
        Click on the Aleo and React logos to learn more
      </p>
    </>
  );
}

export default App;
