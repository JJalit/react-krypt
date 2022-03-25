import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext<State | null>(null);

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};

interface Props {
  children: React.ReactNode;
}

export const TransactionsProvider = ({ children }: Props) => {
  const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
  const [currentAccount, setCurrentAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData(prevState => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();

        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction: any) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log('Ethereum is not present');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert('Please install MetaMask.');

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log('No Accounts Found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (ethereum) {
        const transactionsContract = createEthereumContract();
        const currentTransactionCount = await transactionsContract.getTransactionCount();

        window.localStorage.setItem('transactionCount', currentTransactionCount);
      }
    } catch (error) {
      console.log(error);

      throw new Error('No Ethereum Object');
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Pleas install MetaMask.');

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error('No Ethereum Object');
    }
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);

        await ethereum.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: currentAccount,
              to: addressTo,
              gas: '0x5208',
              value: parsedAmount._hex,
            },
          ],
        });

        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();
        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log('No Ethereum Object');
      }
    } catch (error) {
      console.log(error);

      throw new Error('No Ethereum Object');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{ handleChange, connectWallet, sendTransaction, formData, isLoading, currentAccount, transactions, transactionCount }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
