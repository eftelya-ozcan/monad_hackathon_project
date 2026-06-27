import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: "0.8.20",
  networks: {
    // 🚀 Monad Testnet Ayarları
    monadTestnet: {
      url: "https://testnet-rpc.monad.xyz", 
      chainId: 10143, // Güncel Monad Testnet ID'si
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // 🌐 Alternatif Olarak Sepolia Ayarları
    sepolia: {
      url: "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;