import { useMoralis, useWeb3Contract } from "react-moralis";
import { useState } from "react";
import { abi, addresses } from "../constants";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";
import { getNetwork, getPosition } from "../utils";

export default function Head() {
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const { chainId, isWeb3Enabled } = useMoralis();
  const [readContract, setReadContract] = useState(false);
  const dispatch = useNotification();

  const fundMeAddress =
    getNetwork(chainId) in addresses ? addresses[getNetwork(chainId)][0] : null;

  const handleNewNotification = (tx, type) => {
    console.log("Here's your transaction: ", tx);
    dispatch({
      type: type,
      message:
        type === "error" ? "Something went wrong" : "Transaction Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
    setAmount(0);
  };

  const { runContractFunction: getBalance } = useWeb3Contract({
    abi,
    contractAddress: fundMeAddress,
    functionName: "getBalance",
    params: {},
  });

  const getContractBalance = async () => {
    console.log("Getting contract balance...");
    await getBalance({
      onSuccess: async (tx) => setBalance(ethers.utils.formatUnits(tx)),
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const {
    runContractFunction: fundContract,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: fundMeAddress,
    functionName: "fund",
    params: {},
    msgValue: amount * 10 ** 18,
  });

  const fund = async () => {
    console.log("Funding account with " + amount + " ETH");
    await fundContract({
      onSuccess: async (tx) => handleNewNotification(tx, "success"),
      onError: async (tx) => handleNewNotification(tx, "error"),
    });
  };

  return (
    <div className="flex justify-center">
      {fundMeAddress && (
        <div className="block p-6 rounded-lg bg-white w-1/3 border shadow">
          <div className="form-group mb-6">
            <div
              className="form-control block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <div className="flex items-center justify-around">
                <span>Funds Raised: {balance} ETH</span>
                <button
                  onClick={() => getContractBalance()}
                  className="inline bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 ml-2 px-3 border border-gray-400 rounded"
                >
                  <span> Update Balance</span>
                </button>
              </div>
            </div>
          </div>
          <div className="form-group mb-6 flex flex-col justify-center items-center">
            <label
              className="w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        rounded
        transition
        text-center
        ease-in-out"
            >
              <span className="font-black">Enter Amount in ETH</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        text-center
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              id="exampleInput91"
              placeholder="10"
            />
          </div>
          <div className="form-group form-check text-center mb-6">
            <input
              type="checkbox"
              value={readContract}
              onChange={(e) => setReadContract((current) => !current)}
              className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain mr-2 cursor-pointer"
              id="exampleCheck96"
            />
            <label
              className="form-check-label inline-block text-gray-800"
              for="exampleCheck96"
            >
              I have read the{" "}
              <a
                className="text-blue-600 hover:text-blue-700"
                href="https://rinkeby.etherscan.io/address/0x2CF4bb45EDa5b5547c5576b9d08713Ff9bd503eD"
              >
                smart contract
              </a>
            </label>
          </div>
          <button
            onClick={() => fund()}
            className="
      w-full
      px-6
      py-2.5
      bg-blue-600
      text-white
      font-medium
      text-xs
      leading-tight
      uppercase
      rounded
      shadow-md
      hover:bg-blue-700 hover:shadow-lg
      focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0
      active:bg-blue-800 active:shadow-lg
      transition
      duration-150
      ease-in-out"
          >
            Raise
          </button>
        </div>
      )}
      {!fundMeAddress && <div> No Contract Deployed on this Network</div>}
    </div>
  );
}
