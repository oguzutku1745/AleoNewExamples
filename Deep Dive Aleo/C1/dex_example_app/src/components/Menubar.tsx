import React from "react";
import { WalletMultiButton } from "@demox-labs/aleo-wallet-adapter-reactui";
import aleoLogo from "../assets/aleo.svg";


const UpperMenubar: React.FC = () => {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "black",
        boxShadow: "0px 4px 2px -2px gray",
        zIndex: 1000, // Ensures menubar stays on top
      }}
    >
      {/* Logo */}
      <a href="/" style={{ display: "flex", alignItems: "center" }}>
  <img
    src={aleoLogo}
    alt="Logo"
    className="h-8 transition-filter duration-300 hover:drop-shadow-custom"
  />
</a>

      {/* Middle links */}
      <div style={{ display: "flex", gap: "100px", fontSize: "18px", marginLeft: "100px" }}>
        <a href="/" style={{ textDecoration: "none", color: "white" }}>Swap</a>
        <a href="/pool" style={{ textDecoration: "none", color: "white" }}>Pool</a>
      </div>

      {/* Wallet button */}
      <div style={{ justifyContent: "center", display: "flex" }}>
        <WalletMultiButton />
      </div>
    </div>
  );
};

export default UpperMenubar;
