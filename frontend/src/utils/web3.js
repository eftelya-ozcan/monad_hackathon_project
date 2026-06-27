import { ethers } from "ethers";

// ─── Monad Testnet Ağ Bilgileri ───────────────────────────────────────────────
export const MONAD_TESTNET = {
  chainId: "0x279f", // 10143
  chainName: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: ["https://testnet-rpc.monad.xyz/"],
  blockExplorerUrls: ["https://testnet.monadexplorer.com/"],
};

// ─── Kontrat Bilgileri ────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = "0x04a249031829C0Da84aD67E7C25AbCd271389a02";

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_account", type: "address" },
      { internalType: "uint8", name: "_role", type: "uint8" },
    ],
    name: "assignRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_chipHash", type: "bytes32" },
      { internalType: "string", name: "_partNumber", type: "string" },
      { internalType: "string", name: "_batchNo", type: "string" },
      { internalType: "string", name: "_productionFacility", type: "string" },
      { internalType: "string", name: "_qualityTest", type: "string" },
    ],
    name: "registerComponent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_chipHash", type: "bytes32" },
      { internalType: "address", name: "_to", type: "address" },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_chipHash", type: "bytes32" },
      { internalType: "string", name: "_pcbId", type: "string" },
    ],
    name: "mountToPcb",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_chipHash", type: "bytes32" }],
    name: "recallComponent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_chipHash", type: "bytes32" }],
    name: "verifyComponent",
    outputs: [
      {
        components: [
          { internalType: "string", name: "partNumber", type: "string" },
          { internalType: "string", name: "batchNo", type: "string" },
          { internalType: "string", name: "productionFacility", type: "string" },
          { internalType: "uint256", name: "productionDate", type: "uint256" },
          { internalType: "string", name: "qualityTest", type: "string" },
          { internalType: "address", name: "currentOwner", type: "address" },
          { internalType: "uint8", name: "status", type: "uint8" },
          { internalType: "string", name: "associatedPcbId", type: "string" },
        ],
        internalType: "struct ComponentPassport.Component",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "isRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "roles",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "chipHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "partNumber", type: "string" },
      { indexed: true, internalType: "address", name: "manufacturer", type: "address" },
    ],
    name: "ComponentRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "chipHash", type: "bytes32" },
      { indexed: false, internalType: "uint8", name: "status", type: "uint8" },
      { indexed: false, internalType: "string", name: "pcbId", type: "string" },
    ],
    name: "ComponentStatusUpdated",
    type: "event",
  },
];

// Sözleşmedeki: enum Status { Produced, InTransit, Mounted, Scrapped, Recalled }
const STATUS_ENUM_LABELS = [
  "In Stock",
  "In Transit",
  "Mounted",
  "Scrapped",
  "❌ RECALLED — KULLANIMI YASAK",
];

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
export const shortAddress = (addr) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

/**
 * UID stringini kontratın beklediği bytes32 chipHash'e çevirir.
 * ethers v5: keccak256 + utils.toUtf8Bytes
 */
export function chipHashFromUid(uid) {
  if (!uid) return null;
  const clean = String(uid).trim();
  if (/^0x[0-9a-fA-F]{64}$/.test(clean)) return clean.toLowerCase();
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(clean.toLowerCase()));
}

async function ensureMonadNetwork() {
  if (!window.ethereum) {
    throw new Error("MetaMask veya uyumlu bir Web3 cüzdanı bulunamadı.");
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainId }],
    });
  } catch (switchError) {
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [MONAD_TESTNET],
      });
    } else {
      throw switchError;
    }
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error(
      "MetaMask veya uyumlu bir Web3 cüzdanı bulunamadı. Lütfen yükleyip tekrar deneyin."
    );
  }
  await ensureMonadNetwork();
  // ethers v5: Web3Provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  return { address: accounts[0], provider };
}

export const connectAndSwitchToMonad = connectWallet;

// Salt okunur — ethers v5: JsonRpcProvider
function getReadOnlyContract() {
  const provider = new ethers.providers.JsonRpcProvider(MONAD_TESTNET.rpcUrls[0]);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

async function getSignerContract() {
  await ensureMonadNetwork();
  // ethers v5: Web3Provider + getSigner()
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

function mapContractComponent(raw, chipHash, uidDisplay, txHash) {
  const statusIndex = Number(raw.status);
  const statusLabel = STATUS_ENUM_LABELS[statusIndex] || "Bilinmiyor";
  const productionDateMs = raw.productionDate
    ? Number(raw.productionDate.toString()) * 1000
    : null;
  const pcbId =
    raw.associatedPcbId && raw.associatedPcbId !== "None"
      ? raw.associatedPcbId
      : "—";

  return {
    uid: uidDisplay,
    chip_hash: chipHash,
    part_number: raw.partNumber,
    component_type: raw.qualityTest || "—",
    manufacturer: raw.productionFacility || "—",
    batch_no: raw.batchNo,
    status: statusLabel,
    associated_pcb_id: pcbId,
    monad_tx: txHash || null,
    registered_at: productionDateMs
      ? new Date(productionDateMs).toISOString()
      : null,
    history: [
      `[On-chain] 🏭 Üretim/Tesis bilgisi: ${raw.productionFacility || "—"}`,
      `[On-chain] 📋 Kalite / sertifika notu: ${raw.qualityTest || "—"}`,
      `[On-chain] 👤 Güncel sahip cüzdanı: ${shortAddress(raw.currentOwner)}`,
      `[On-chain] 📦 Güncel durum: ${statusLabel}`,
    ],
    _source: "blockchain",
  };
}

export async function verifyComponentOnChain(uidQuery) {
  const chipHash = chipHashFromUid(uidQuery);
  if (!chipHash) return null;

  try {
    const contract = getReadOnlyContract();
    const raw = await contract.verifyComponent(chipHash);

    let txHash = null;
    try {
      const filter = contract.filters.ComponentRegistered(chipHash);
      const logs = await contract.queryFilter(filter, 0, "latest");
      if (logs.length > 0) txHash = logs[0].transactionHash;
    } catch (_) {
      /* opsiyonel log taraması */
    }

    return mapContractComponent(raw, chipHash, uidQuery, txHash);
  } catch (_err) {
    return null;
  }
}

export async function registerComponentOnChain({
  uid,
  partNumber,
  batchNo,
  productionFacility,
  qualityTest,
}) {
  if (!window.ethereum) {
    throw new Error("Cüzdan bulunamadı. Lütfen Monad cüzdanınızı bağlayın.");
  }
  const chipHash = chipHashFromUid(uid);
  const contract = await getSignerContract();
  const tx = await contract.registerComponent(
    chipHash,
    partNumber,
    batchNo,
    productionFacility,
    qualityTest
  );
  const receipt = await tx.wait();
  return { txHash: receipt?.transactionHash || tx.hash, chipHash };
}

// ─── Distribütör / Fabrika İşlemleri ─────────────────────────────────────────

/**
 * Bir parçanın sahipliğini başka bir adrese devreder.
 * Kontratta: transferOwnership(bytes32 _chipHash, address _to)
 * Rol: Distributor veya Manufacturer
 */
export async function transferOwnershipOnChain({ uid, toAddress }) {
  if (!window.ethereum) throw new Error("Cüzdan bulunamadı.");
  if (!ethers.utils.isAddress(toAddress))
    throw new Error("Geçersiz hedef adres formatı.");
  const chipHash = chipHashFromUid(uid);
  const contract = await getSignerContract();
  const tx = await contract.transferOwnership(chipHash, toAddress);
  const receipt = await tx.wait();
  return { txHash: receipt?.transactionHash || tx.hash };
}

/**
 * Parçayı bir PCB'ye monte eder.
 * Kontratta: mountToPcb(bytes32 _chipHash, string _pcbId)
 * Rol: Factory
 */
export async function mountToPcbOnChain({ uid, pcbId }) {
  if (!window.ethereum) throw new Error("Cüzdan bulunamadı.");
  const chipHash = chipHashFromUid(uid);
  const contract = await getSignerContract();
  const tx = await contract.mountToPcb(chipHash, pcbId);
  const receipt = await tx.wait();
  return { txHash: receipt?.transactionHash || tx.hash };
}

/**
 * Parçayı geri çağırır (Recalled durumuna alır).
 * Kontratta: recallComponent(bytes32 _chipHash)
 * Rol: Manufacturer veya admin
 */
export async function recallComponentOnChain({ uid }) {
  if (!window.ethereum) throw new Error("Cüzdan bulunamadı.");
  const chipHash = chipHashFromUid(uid);
  const contract = await getSignerContract();
  const tx = await contract.recallComponent(chipHash);
  const receipt = await tx.wait();
  return { txHash: receipt?.transactionHash || tx.hash };
}