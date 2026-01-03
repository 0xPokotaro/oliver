import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import hardhatIgnitionViemPlugin from "@nomicfoundation/hardhat-ignition-viem";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, hardhatIgnitionViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    local: {
      type: "edr-simulated",
      chainType: "l1",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("LOCAL_PRIVATE_KEY")],
    },
    avalanche: {
      type: "http",
      chainType: "l1",
      url: "https://avalanche-mainnet.g.allthatnode.com/full/evm/1f8f793ddd57475e8fef99406e81432f",
      accounts: ['0xfb777e39701f4549cef6adbb221e6bfd257fb263f535d4c9c5aeccc271f5dd27'],
    },
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: 'https://base-sepolia-rpc.publicnode.com',
      accounts: ['0x6d684f435d9b952a07630e42abdda061de67e1498a1fafbb5641c8d1f5526f02'],
    },
  },
});
