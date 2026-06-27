import { ethers } from "ethers";

// ─── Monad Testnet Configuration ────────────────────────────────────────────
export const MONAD_TESTNET = {
  chainId: "0x279f",
  chainIdDecimal: 10143,
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: ["https://rpc-testnet.monad.xyz"],
  blockExplorerUrls: ["https://explorer.testnet.monad.xyz"],
};

// ─── Mock Contract Address & ABI ────────────────────────────────────────────
export const CONTRACT_ADDRESS = "0x4Df2E8cA6B9B2dB14B93C98B3f2aC91F7dD3Aa5";

export const CONTRACT_ABI = [
  // Write: Register a new chip UID hash onto the blockchain
  {
    name: "registerComponent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "uidHash", type: "bytes32" },
      { name: "partNumber", type: "string" },
      { name: "batchNo", type: "string" },
      { name: "manufacturer", type: "string" },
      { name: "componentType", type: "string" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  // Read: Verify a UID hash exists and is valid
  {
    name: "verifyComponent",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "uidHash", type: "bytes32" }],
    outputs: [
      { name: "isValid", type: "bool" },
      { name: "partNumber", type: "string" },
      { name: "manufacturer", type: "string" },
      { name: "registeredAt", type: "uint256" },
      { name: "registeredBy", type: "address" },
    ],
  },
  // Read: Get all components by manufacturer
  {
    name: "getComponentsByManufacturer",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "manufacturer", type: "string" }],
    outputs: [{ name: "tokenIds", type: "uint256[]" }],
  },
  // Write: Flag a component as counterfeit
  {
    name: "flagCounterfeit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "uidHash", type: "bytes32" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
  },
  // Write: Recall a component batch
  {
    name: "recallBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "batchNo", type: "string" },
      { name: "recallReason", type: "string" },
    ],
    outputs: [],
  },
  // Event: Emitted on new registration
  {
    name: "ComponentRegistered",
    type: "event",
    inputs: [
      { name: "uidHash", type: "bytes32", indexed: true },
      { name: "partNumber", type: "string", indexed: false },
      { name: "registeredBy", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
    ],
  },
  // Event: Emitted on counterfeit flag
  {
    name: "CounterfeitFlagged",
    type: "event",
    inputs: [
      { name: "uidHash", type: "bytes32", indexed: true },
      { name: "flaggedBy", type: "address", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
];

// ─── Connect MetaMask & Switch to Monad Testnet ─────────────────────────────
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask bulunamadı. Lütfen MetaMask eklentisini yükleyin."
    );
  }

  // Request account access
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // Switch / add Monad Testnet
  await switchToMonadTestnet();

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();

  return { provider, signer, address, network };
}

// ─── Switch Network to Monad Testnet ────────────────────────────────────────
export async function switchToMonadTestnet() {
  try {
    // Attempt to switch to Monad Testnet
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainId }],
    });
  } catch (switchError) {
    // Chain not found (error code 4902) — add it
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET.chainId,
              chainName: MONAD_TESTNET.chainName,
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
              rpcUrls: MONAD_TESTNET.rpcUrls,
              blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
            },
          ],
        });
      } catch (addError) {
        throw new Error(
          `Monad Testnet eklenemedi: ${addError.message}`
        );
      }
    } else {
      throw new Error(
        `Ağ değiştirilemedi: ${switchError.message}`
      );
    }
  }
}

// ─── Get Contract Instance (read-only) ──────────────────────────────────────
export function getReadOnlyContract() {
  const provider = new ethers.providers.JsonRpcProvider(
    MONAD_TESTNET.rpcUrls[0]
  );
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ─── Get Contract Instance (with signer) ────────────────────────────────────
export function getSignedContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// ─── Hash UID using SHA-256 (via ethers keccak256 for on-chain compat) ───────
export function hashUID(uid) {
  // For Solidity bytes32 compatibility, use keccak256
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(uid));
}

// ─── Hash UID using Web Crypto SHA-256 (for display) ────────────────────────
export async function sha256Hash(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Register Component on Monad ─────────────────────────────────────────────
export async function registerComponent(signer, componentData) {
  const contract = getSignedContract(signer);
  const uidHash = hashUID(componentData.uid);

  // Simulate Monad parallel execution speed
  const t0 = performance.now();

  const tx = await contract.registerComponent(
    uidHash,
    componentData.part_number,
    componentData.batch_no,
    componentData.manufacturer,
    componentData.component_type
  );

  const receipt = await tx.wait();
  const t1 = performance.now();

  return {
    txHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    executionTime: (t1 - t0).toFixed(2),
  };
}

// ─── Verify Component on Monad ───────────────────────────────────────────────
export async function verifyComponentOnChain(uidHash) {
  const contract = getReadOnlyContract();
  const result = await contract.verifyComponent(uidHash);
  return {
    isValid: result.isValid,
    partNumber: result.partNumber,
    manufacturer: result.manufacturer,
    registeredAt: new Date(result.registeredAt.toNumber() * 1000).toISOString(),
    registeredBy: result.registeredBy,
  };
}

// ─── Format Address (short display) ─────────────────────────────────────────
export function shortAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ─── Format Wei to ETH/MON ──────────────────────────────────────────────────
export function formatMON(weiValue) {
  return ethers.utils.formatEther(weiValue);
}