
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (account) => {
    if (account && account.length > 0) {
      console.log("Account connected: ", account[0]);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);
      getATMContract();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const balance = await atm.getBalance();
        setBalance(Math.round(ethers.utils.formatEther(balance)));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const getTransactionHistory = async () => {
    if (atm) {
      try {
        const transactions = await atm.getTransactionHistory();
        setTransactions(transactions.map(tx => ({
          ...tx,
          timestamp: new Date(tx.timestamp * 1000).toLocaleString()
        })));
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      }
    }
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === "" || parseFloat(value) <= 0) {
      setAmount("");
    } else {
      setAmount(value);
    }
  };

  const deposit = async () => {
    if (atm && amount > 0) {
      try {
        let tx = await atm.deposit(ethers.utils.parseEther(amount.toString()));
        await tx.wait();
        getBalance();
        getTransactionHistory();
        setAmount("");
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm && amount > 0) {
      try {
        let tx = await atm.withdraw(ethers.utils.parseEther(amount.toString()));
        await tx.wait();
        getBalance();
        getTransactionHistory();
        setAmount("");
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const withdrawAll = async () => {
    if (atm && balance > 0) {
      try {
        let tx = await atm.withdrawAll();
        await tx.wait();
        getBalance();
        getTransactionHistory();
        setAmount("");
      } catch (error) {
        console.error("Error withdrawing all:", error);
      }
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p><b>Your Account:</b> <span>{account}</span></p>
        <p><b>Your Balance:</b> <span>{balance} ETH</span></p>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          placeholder="Enter amount"
        />
        <div><br></br></div>
        <div>
          <button className onClick={deposit}>
            Deposit
          </button>
          <button className onClick={withdraw}>
            Withdraw
          </button>
          <button className onClick={withdrawAll}>
            Withdraw All
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    if (atm) {
      getTransactionHistory();
    }
  }, [atm]);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      {transactions.length > 0 && (
        <div className="transaction-history">
          <h2>Transaction History</h2>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index} className="transaction-item">
                {tx.action}: {ethers.utils.formatEther(tx.amount)} ETH ({tx.timestamp})
              </li>
            ))}
          </ul>
        </div>
      )}
      <style jsx>{`
        .container {
          text-align: center;
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #aaecec; /* White background for container */
          color: #333;
          max-width: 600px;
          margin: auto;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }
        header {
          margin-bottom: 20px;
        }
        .transaction-history {
          margin-top: 30px;
          text-align: left;
          padding: 20px;
          background-color: #f9f9f9; /* Light grey background for transaction history */
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .transaction-history ul {
          list-style-type: none;
          padding: 0;
        }
        .transaction-item {
          padding: 10px;
          margin: 5px 0;
          background-color: #fff; /* White background for transaction items */
          border: 1px solid #ddd;
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}
