import React, { useMemo, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from "./App";
import Pool from "./Pool"
import LiquidityManager from "./components/LiquidityManager";
import "./index.css";
import { WalletProvider } from "@demox-labs/aleo-wallet-adapter-react";
import { WalletModalProvider } from "@demox-labs/aleo-wallet-adapter-reactui";
import { 
  PuzzleWalletAdapter, 
  LeoWalletAdapter, 
  FoxWalletAdapter, 
  SoterWalletAdapter,
  AvailWalletAdapter,
  configureConnectionForPuzzle  
} from 'aleo-adapters';
import { 
  WalletAdapterNetwork,
  DecryptPermission
 } from "@demox-labs/aleo-wallet-adapter-base";
import "@demox-labs/aleo-wallet-adapter-reactui/styles.css";
import UpperMenubar from "./components/Menubar";

const MainApp = () => {
  const wallets = useMemo(
    () => [
        new LeoWalletAdapter({
            appName: 'Aleo Crowdfunding',
        }),
        new PuzzleWalletAdapter({
            appName: 'Aleo Crowdfunding',
        }),
        new FoxWalletAdapter({
            appName: 'Aleo Crowdfunding',
        }),
        new SoterWalletAdapter({
            appName: 'Aleo Crowdfunding',
        }),
        new AvailWalletAdapter({
            appName: 'Aleo Crowdfunding',
        })
    ],
    [],
  );

  useEffect(() => {
    configureConnectionForPuzzle({
        dAppName: 'Aleo DEX Example',
        dAppDescription: 'Aleo DEX Example',
        dAppUrl: `http://localhost:5173/`,
        dAppIconURL: ``
    });
  }, []);

  return (
    <WalletProvider 
      network={WalletAdapterNetwork.TestnetBeta}
      decryptPermission={DecryptPermission.OnChainHistory}
      programs={['credits.aleo']}
      wallets={wallets} 
      autoConnect
    >
      <WalletModalProvider>
        <UpperMenubar />
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/pool" element={<Pool />} />
            <Route path="/liquidity" element={<LiquidityManager />} />
          </Routes>
        </Router>
      </WalletModalProvider>
    </WalletProvider>
  );
};

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <MainApp />
    </React.StrictMode>,
  );
} else {
  throw new Error("Root element not found");
}
