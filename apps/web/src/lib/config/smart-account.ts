import {
  parseUnits,
  getAbiItem,
  toFunctionSelector,
  type AbiFunction,
  encodeFunctionData,
} from "viem";
import { baseSepolia } from "viem/chains";
import { getSudoPolicy, type Instruction } from "@biconomy/abstractjs";
import { JPYC_ABI } from "./jpyc-abi";
import { CONTRACT_ADDRESSES } from "@oliver/shared/configs/blockchain";

export const transferAbi = getAbiItem({
  abi: JPYC_ABI,
  name: "transfer",
}) as AbiFunction;

export const transferSelector = toFunctionSelector(transferAbi);

export const ALLOWED_ACTION = {
  chainId: baseSepolia.id,
  actionTarget: CONTRACT_ADDRESSES.BASE_SEPOLIA.JPYC,
  actionTargetSelector: transferSelector,
  actionPolicies: [getSudoPolicy()],
};

export const getInstruction = (address: `0x${string}`) => {
  return {
    chainId: baseSepolia.id,
    calls: [
      {
        to: CONTRACT_ADDRESSES.BASE_SEPOLIA.JPYC,
        data: encodeFunctionData({
          abi: JPYC_ABI,
          functionName: "transfer",
          args: [address, parseUnits("500", 18)],
        }),
      },
    ],
  } as Instruction;
};

export const getSessionSignerPrivateKey = (): `0x${string}` => {
  const key = process.env.NEXT_PUBLIC_PRIVY_PRIVATE_KEY;

  if (!key) {
    throw new Error("Session signer private key not configured");
  }

  return key as `0x${string}`;
};
