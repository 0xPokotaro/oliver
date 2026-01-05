import { parseEther, parseUnits, type Address } from "viem";
import { erc20Abi } from "viem";
import { baseSepolia } from "viem/chains";
import { createFaucetWalletClient } from "@/lib/config/faucet";
import { CONTRACT_ADDRESSES } from "@oliver/shared/configs/blockchain";

/**
 * ETHを送信する
 * @param recipient - 受信者のアドレス
 * @returns トランザクションハッシュ
 */
export async function sendETH(recipient: Address): Promise<`0x${string}`> {
  const walletClient = createFaucetWalletClient();
  const amount = parseEther("0.05");

  if (!walletClient.account) {
    throw new Error("Faucet wallet account not found");
  }

  const hash = await walletClient.sendTransaction({
    account: walletClient.account,
    chain: baseSepolia,
    to: recipient,
    value: amount,
  });

  return hash;
}

/**
 * USDCを送信する
 * @param recipient - 受信者のアドレス
 * @returns トランザクションハッシュ
 */
export async function sendUSDC(recipient: Address): Promise<`0x${string}`> {
  const walletClient = createFaucetWalletClient();
  const amount = parseUnits("10", 6); // USDCは6 decimals

  if (!walletClient.account) {
    throw new Error("Faucet wallet account not found");
  }

  const hash = await walletClient.writeContract({
    account: walletClient.account,
    chain: baseSepolia,
    address: CONTRACT_ADDRESSES.BASE_SEPOLIA.USDC,
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient, amount],
  });

  return hash;
}
