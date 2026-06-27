import React, { useState, useCallback, useEffect } from "react";
import {
  Shield,
  Factory,
  Wallet,
  Search,
  Camera,
  X,
  ChevronRight,
  Cpu,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Hash,
  Activity,
  TrendingUp,
  Globe,
  CircuitBoard,
  FileCheck,
  Send,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Layers,
  BarChart3,
} from "lucide-react";
import dataset from "../dataset.json";
import QRScanner from "./QRScanner";
import { connectWallet, shortAddress, MONAD_TESTNET } from "../utils/web3";

// ─── Status Badge Configuration ──────────────────────────────────────────────
const getStatusConfig = (status) => {
  if (!status) return { color: "#6b7280", bg: "rgba(107,114,128,0.15)", label: status };
  const s = status.toLowerCase();
  if (s.includes("sahte") || s.includes("doğrulanamadı") || s.includes("alarm")) {
    return { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", label: status, icon: "🔴", critical: true };
  }
  if (s.includes("recalled") || s.includes("kullanımı yasak")) {
    return { color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.35)", label: status, icon: "❌", critical: true };
  }
  if (s.includes("ikinci el") || s.includes("yeniden işaretlenmiş")) {
    return { color: "#eab308", bg: "rgba(234,179,8,0.12)", border: "rgba(234,179,8,0.35)", label: status, icon: "⚠️", critical: true };
  }
  if (s.includes("in stock")) return { color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", label: "In Stock", icon: "✅" };
  if (s.includes("mounted")) return { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", label: "Mounted", icon: "🔧" };
  if (s.includes("in transit")) return { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", label: "In Transit", icon: "✈️" };
  if (s.includes("scrapped")) return { color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", label: "Scrapped", icon: "🗑️" };
  return { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.3)", label: status };
};

const isCritical = (status) => {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes("sahte") || s.includes("doğrulanamadı") || s.includes("recalled") || s.includes("ikinci el") || s.includes("alarm") || s.includes("yasak");
};

// ─── Live Stats Bar ───────────────────────────────────────────────────────────
const LiveStats = () => {
  const [tps, setTps] = useState(10247);
  const [blockTime, setBlockTime] = useState(0.52);
  const [pending, setPending] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setTps((v) => Math.floor(v + (Math.random() - 0.3) * 200));
      setBlockTime((v) => parseFloat((v + (Math.random() - 0.5) * 0.05).toFixed(2)));
      setPending((v) => Math.max(0, v + Math.floor((Math.random() - 0.4) * 3)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center gap-6 px-4 py-2 rounded-xl"
      style={{
        background: "rgba(32, 0, 82, 0.6)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-mono" style={{ color: "#22c55e" }}>
          {tps.toLocaleString()} TPS
        </span>
      </div>
      <div className="w-px h-3 bg-purple-800" />
      <div className="flex items-center gap-1.5">
        <Zap size={10} style={{ color: "#a78bfa" }} />
        <span className="text-xs font-mono" style={{ color: "#a78bfa" }}>
          {blockTime}s blok
        </span>
      </div>
      <div className="w-px h-3 bg-purple-800" />
      <div className="flex items-center gap-1.5">
        <Activity size={10} style={{ color: "#7c3aed" }} />
        <span className="text-xs font-mono" style={{ color: "#7c3aed" }}>
          {pending} bekleyen TX
        </span>
      </div>
    </div>
  );
};

// ─── Result Card ──────────────────────────────────────────────────────────────
const ResultCard = ({ component, executionTime }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const status = getStatusConfig(component.status);
  const critical = isCritical(component.status);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: critical
          ? "rgba(40, 0, 10, 0.85)"
          : "rgba(20, 0, 50, 0.85)",
        border: `1px solid ${critical ? "rgba(239,68,68,0.5)" : "rgba(139, 92, 246, 0.3)"}`,
        boxShadow: critical
          ? "0 0 30px rgba(239,68,68,0.15), inset 0 1px 0 rgba(255,255,255,0.03)"
          : "0 0 20px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* ── Critical Banner ── */}
      {critical && (
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            borderBottom: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <AlertTriangle size={14} className="text-red-400 animate-pulse" />
          <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
            Güvenlik Alarmı — Doğrulama Başarısız
          </span>
        </div>
      )}

      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div
              className="p-2.5 rounded-xl flex-shrink-0"
              style={{ background: critical ? "rgba(239,68,68,0.15)" : "rgba(139,92,246,0.15)" }}
            >
              <CircuitBoard
                size={20}
                style={{ color: critical ? "#ef4444" : "#a78bfa" }}
              />
            </div>
            <div>
              <h3 className="text-white font-bold text-base leading-tight">
                {component.part_number}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#7c3aed" }}>
                {component.component_type}
              </p>
            </div>
          </div>
          {/* Status Badge */}
          <div
            className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 max-w-xs text-right"
            style={{
              background: status.bg,
              border: `1px solid ${status.border}`,
              color: status.color,
            }}
          >
            <span>{status.icon}</span>
            <span className="truncate" style={{ maxWidth: "180px" }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* ── Meta Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: Factory, label: "Üretici", value: component.manufacturer },
            { icon: Package, label: "Batch No", value: component.batch_no },
            { icon: Layers, label: "PCB ID", value: component.associated_pcb_id },
            {
              icon: Clock,
              label: "Kayıt Tarihi",
              value: component.registered_at
                ? new Date(component.registered_at).toLocaleDateString("tr-TR")
                : "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={11} style={{ color: "#7c3aed" }} />
                <span className="text-xs" style={{ color: "#6d28d9" }}>
                  {label}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-200 truncate">{value || "—"}</p>
            </div>
          ))}
        </div>

        {/* ── UID Hash ── */}
        <div
          className="p-3 rounded-xl mb-4"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Hash size={11} style={{ color: "#7c3aed" }} />
            <span className="text-xs" style={{ color: "#7c3aed" }}>
              Donanımsal UID Hash (SHA-256)
            </span>
          </div>
          <p
            className="text-xs font-mono break-all leading-relaxed"
            style={{ color: critical ? "#fca5a5" : "#c4b5fd" }}
          >
            {component.uid}
          </p>
        </div>

        {/* ── TX Hash ── */}
        {component.monad_tx ? (
          <div
            className="p-3 rounded-xl mb-4"
            style={{
              background: "rgba(34, 197, 94, 0.05)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <CheckCircle size={11} className="text-green-400" />
              <span className="text-xs text-green-400">
                Monad Blockchain TX
              </span>
            </div>
            <p className="text-xs font-mono text-green-300 break-all">
              {component.monad_tx}
            </p>
          </div>
        ) : (
          <div
            className="p-3 rounded-xl mb-4"
            style={{
              background: "rgba(239,68,68,0.05)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <XCircle size={11} className="text-red-400" />
              <span className="text-xs text-red-400">
                Blockchain kaydı bulunamadı — Monad TX yok
              </span>
            </div>
          </div>
        )}

        {/* ── Execution Time Badge ── */}
        {executionTime && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
            }}
          >
            <Zap size={12} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-mono" style={{ color: "#a78bfa" }}>
              Monad Parallel Execution:{" "}
              <span className="text-white font-bold">{executionTime}ms</span>
            </span>
            <div className="ml-auto flex items-center gap-1">
              <TrendingUp size={11} className="text-green-400" />
              <span className="text-xs text-green-400">~10k TPS</span>
            </div>
          </div>
        )}

        {/* ── History Log ── */}
        {component.history && component.history.length > 0 && (
          <div>
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2">
                <Eye size={13} style={{ color: "#7c3aed" }} />
                <span className="text-xs font-medium" style={{ color: "#a78bfa" }}>
                  Tedarik Zinciri Geçmişi
                </span>
                <span
                  className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: "rgba(124,58,237,0.3)", color: "#c4b5fd" }}
                >
                  {component.history.length}
                </span>
              </div>
              {historyOpen ? (
                <ChevronUp size={14} style={{ color: "#7c3aed" }} />
              ) : (
                <ChevronDown size={14} style={{ color: "#7c3aed" }} />
              )}
            </button>

            {historyOpen && (
              <div
                className="mt-2 p-3 rounded-xl space-y-2"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {component.history.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 pb-2 border-b last:border-0 last:pb-0"
                    style={{ borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div
                      className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: critical ? "#ef4444" : "#7c3aed" }}
                    />
                    <p
                      className="text-xs font-mono leading-relaxed"
                      style={{ color: critical ? "#fca5a5" : "#9ca3af" }}
                    >
                      {log}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Engineer Verification Tab ────────────────────────────────────────────────
const EngineerTab = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    (overrideQuery) => {
      const q = (overrideQuery ?? query).trim().toLowerCase();
      if (!q) return;

      setIsSearching(true);
      setSearched(false);
      setResults([]);

      const t0 = performance.now();

      // Simulate Monad parallel execution with brief async delay
      setTimeout(() => {
        const found = dataset.filter(
          (item) =>
            item.uid?.toLowerCase().includes(q) ||
            item.part_number?.toLowerCase().includes(q) ||
            item.associated_pcb_id?.toLowerCase().includes(q) ||
            item.batch_no?.toLowerCase().includes(q) ||
            item.manufacturer?.toLowerCase().includes(q) ||
            item.component_type?.toLowerCase().includes(q)
        );

        const t1 = performance.now();
        setExecutionTime((t1 - t0).toFixed(1));
        setResults(found);
        setSearched(true);
        setIsSearching(false);
      }, 180 + Math.random() * 80);
    },
    [query]
  );

  const handleScanResult = useCallback(
    ({ uid }) => {
      setShowScanner(false);
      setQuery(uid);
      handleSearch(uid);
    },
    [handleSearch]
  );

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setExecutionTime(null);
  };

  return (
    <div>
      {/* ── Search Controls ── */}
      <div
        className="p-5 rounded-2xl mb-6"
        style={{
          background: "rgba(32, 0, 82, 0.5)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: "#a78bfa" }} />
          <h2 className="text-sm font-semibold text-white">
            Komponent Doğrulama
          </h2>
          <span
            className="ml-auto px-2 py-0.5 rounded-full text-xs"
            style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa" }}
          >
            {dataset.length} parça indekslendi
          </span>
        </div>

        {/* Search Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#7c3aed" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="UID hash, part no, PCB ID, batch no ara..."
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(139,92,246,0.3)",
                color: "white",
                fontFamily: "monospace",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(167,139,250,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.3)")
              }
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X size={13} className="text-gray-500 hover:text-white transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || isSearching}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.35)",
              color: "white",
            }}
          >
            {isSearching ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Search size={15} />
            )}
            Sorgula
          </button>
          <button
            onClick={() => setShowScanner((v) => !v)}
            className="px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"
            style={{
              background: showScanner
                ? "rgba(167,139,250,0.2)"
                : "rgba(255,255,255,0.05)",
              border: "1px solid rgba(139,92,246,0.3)",
              color: "#a78bfa",
            }}
          >
            <Camera size={15} />
            QR
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {["STM32", "FPGA", "PCB-RADAR", "BATCH-2024", "RECALLED", "SAHTE"].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag.toLowerCase());
                  handleSearch(tag.toLowerCase());
                }}
                className="px-2.5 py-1 rounded-lg text-xs transition-all hover:bg-purple-800/40"
                style={{
                  background: "rgba(124,58,237,0.12)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  color: "#c4b5fd",
                }}
              >
                {tag}
              </button>
            )
          )}
        </div>
      </div>

      {/* ── QR Scanner Panel ── */}
      {showScanner && (
        <div className="mb-6">
          <QRScanner
            onScanResult={handleScanResult}
            onClose={() => setShowScanner(false)}
          />
        </div>
      )}

      {/* ── Execution Metrics ── */}
      {executionTime && searched && (
        <div
          className="flex items-center justify-between px-5 py-3 rounded-xl mb-5"
          style={{
            background: "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124,58,237,0.2)",
          }}
        >
          <div className="flex items-center gap-3">
            <Zap size={16} style={{ color: "#a78bfa" }} />
            <div>
              <p className="text-xs font-mono" style={{ color: "#a78bfa" }}>
                ⚡ Monad Parallel Execution:{" "}
                <span className="text-white font-bold text-sm">
                  {executionTime}ms
                </span>
              </p>
              <p className="text-xs" style={{ color: "#6d28d9" }}>
                {results.length} kayıt paralel işlemde tarandı — 10k+ TPS kapasitesi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {results.some((r) => isCritical(r.status)) ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-xs text-red-400 font-bold">
                  {results.filter((r) => isCritical(r.status)).length} ALARM
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle size={12} className="text-green-400" />
                <span className="text-xs text-green-400 font-bold">
                  {results.length} DOĞRULANDI
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {searched && (
        <div>
          {results.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{
                background: "rgba(32,0,82,0.3)",
                border: "1px dashed rgba(139,92,246,0.25)",
              }}
            >
              <Search size={32} className="mx-auto mb-3 opacity-30 text-purple-400" />
              <p className="text-white font-medium mb-1">Kayıt Bulunamadı</p>
              <p className="text-xs" style={{ color: "#7c3aed" }}>
                "{query}" sorgusu için Monad blockchain'de eşleşen komponent yok.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((component, i) => (
                <ResultCard
                  key={component.uid + i}
                  component={component}
                  executionTime={executionTime}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Empty State ── */}
      {!searched && !showScanner && (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "rgba(32,0,82,0.2)",
            border: "1px dashed rgba(139,92,246,0.2)",
          }}
        >
          <div
            className="inline-flex p-4 rounded-2xl mb-4"
            style={{ background: "rgba(124,58,237,0.1)" }}
          >
            <CircuitBoard size={36} style={{ color: "rgba(167,139,250,0.5)" }} />
          </div>
          <p className="text-white font-medium mb-2">Doğrulama Hazır</p>
          <p className="text-xs mb-6" style={{ color: "#7c3aed", maxWidth: "300px", margin: "0 auto 24px" }}>
            Yarı iletken komponent UID hash'ini, parça numarasını veya PCB kimliğini
            yazarak Monad blockchain doğrulaması başlatın.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs" style={{ color: "#6d28d9" }}>
            <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-400" /> Orijinal tespit</span>
            <span className="flex items-center gap-1"><AlertTriangle size={11} className="text-red-400" /> Sahte alarm</span>
            <span className="flex items-center gap-1"><XCircle size={11} className="text-orange-400" /> Recall uyarısı</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Manufacturer Entry Tab ───────────────────────────────────────────────────
const ManufacturerTab = ({ walletAddress }) => {
  const [form, setForm] = useState({
    part_number: "",
    component_type: "",
    manufacturer: "",
    batch_no: "",
    uid: "",
    pcb_id: "",
    fab_location: "",
    process_node: "",
    compliance: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [txHash, setTxHash] = useState("");

  const complianceOptions = [
    "AEC-Q100 Automotive",
    "DO-254 Aerospace",
    "IPC-A-610 Class 3",
    "ITAR Export Controlled",
    "RoHS Compliant",
    "REACH Compliant",
    "AB DPP Ready",
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCompliance = (item) => {
    setForm((prev) => ({
      ...prev,
      compliance: prev.compliance.includes(item)
        ? prev.compliance.filter((c) => c !== item)
        : [...prev.compliance, item],
    }));
  };

  const generateUID = () => {
    const randomHex = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    handleChange("uid", "0x" + randomHex);
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      alert("Lütfen önce Monad cüzdanınızı bağlayın.");
      return;
    }
    setSubmitting(true);

    // Simulate blockchain TX
    await new Promise((r) => setTimeout(r, 2200));

    const mockTx =
      "0x" +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    setTxHash(mockTx);
    setSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({
      part_number: "",
      component_type: "",
      manufacturer: "",
      batch_no: "",
      uid: "",
      pcb_id: "",
      fab_location: "",
      process_node: "",
      compliance: [],
    });
    setSubmitted(false);
    setTxHash("");
  };

  const inputStyle = {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(139,92,246,0.3)",
    color: "white",
    borderRadius: "12px",
    padding: "12px 14px",
    width: "100%",
    fontSize: "13px",
    outline: "none",
    transition: "border-color 0.2s",
  };

  if (submitted) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{
          background: "rgba(20, 0, 50, 0.85)",
          border: "1px solid rgba(34,197,94,0.4)",
          boxShadow: "0 0 40px rgba(34,197,94,0.1)",
        }}
      >
        <div
          className="inline-flex p-5 rounded-2xl mb-5"
          style={{ background: "rgba(34,197,94,0.12)" }}
        >
          <CheckCircle size={40} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Monad'a Başarıyla Yazıldı
        </h3>
        <p className="text-sm mb-6" style={{ color: "#7c3aed" }}>
          {form.part_number || "Komponent"} — Batch {form.batch_no || "—"}{" "}
          blockchain'e kaydedildi.
        </p>
        <div
          className="p-4 rounded-xl mb-6 text-left"
          style={{
            background: "rgba(34,197,94,0.05)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <p className="text-xs text-green-400 mb-1.5 flex items-center gap-1.5">
            <CheckCircle size={11} /> Transaction Hash
          </p>
          <p className="text-xs font-mono text-green-300 break-all">{txHash}</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Blok Onayı", value: "~0.5s", icon: Zap },
            { label: "Gas Ücreti", value: "~0.0002 MON", icon: Activity },
            { label: "AB DPP Uyumu", value: "✅ Aktif", icon: FileCheck },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="p-3 rounded-xl text-center"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Icon size={16} className="mx-auto mb-1.5 text-purple-400" />
              <p className="text-white font-semibold text-sm">{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "#7c3aed" }}>{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={resetForm}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white",
          }}
        >
          Yeni Komponent Kaydet
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(20, 0, 50, 0.85)",
        border: "1px solid rgba(139, 92, 246, 0.25)",
      }}
    >
      {/* Form Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(139,92,246,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            <Factory size={16} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Üretici Komponent Kayıt Formu
            </p>
            <p className="text-xs" style={{ color: "#7c3aed" }}>
              AB DPP • Monad Testnet • IDPP v2.4
            </p>
          </div>
        </div>
        {walletAddress ? (
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-mono"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}
          >
            {shortAddress(walletAddress)}
          </div>
        ) : (
          <div
            className="px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
          >
            Cüzdan Bağlı Değil
          </div>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              Parça Numarası *
            </label>
            <input
              style={inputStyle}
              placeholder="örn: STM32F407VGT6"
              value={form.part_number}
              onChange={(e) => handleChange("part_number", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              Komponent Tipi *
            </label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.component_type}
              onChange={(e) => handleChange("component_type", e.target.value)}
            >
              <option value="" style={{ background: "#200052" }}>Seçin...</option>
              {["Microcontroller", "FPGA", "DSP Processor", "RF Transceiver", "Automotive SoC", "AI MCU", "ARM MCU", "Power IC", "Memory"].map((t) => (
                <option key={t} value={t} style={{ background: "#200052" }}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              Üretici *
            </label>
            <input
              style={inputStyle}
              placeholder="örn: STMicroelectronics"
              value={form.manufacturer}
              onChange={(e) => handleChange("manufacturer", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              Batch Numarası *
            </label>
            <input
              style={inputStyle}
              placeholder="örn: BATCH-2024-ST-0001"
              value={form.batch_no}
              onChange={(e) => handleChange("batch_no", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
          </div>
        </div>

        {/* UID Hash */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
            Donanımsal UID Hash (SHA-256) *
          </label>
          <div className="flex gap-2">
            <input
              style={{ ...inputStyle, fontFamily: "monospace", fontSize: "11px" }}
              placeholder="0x... (64 hex karakter)"
              value={form.uid}
              onChange={(e) => handleChange("uid", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
            <button
              onClick={generateUID}
              className="px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 flex-shrink-0 transition-all hover:bg-purple-700/40"
              style={{
                background: "rgba(124,58,237,0.2)",
                border: "1px solid rgba(124,58,237,0.4)",
                color: "#a78bfa",
              }}
            >
              <RefreshCw size={12} />
              Üret
            </button>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              İlişkili PCB ID
            </label>
            <input
              style={inputStyle}
              placeholder="örn: PCB-MAIN-0042"
              value={form.pcb_id}
              onChange={(e) => handleChange("pcb_id", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
              Fabrika Konumu
            </label>
            <input
              style={inputStyle}
              placeholder="örn: TSMC Hsinchu, Taiwan"
              value={form.fab_location}
              onChange={(e) => handleChange("fab_location", e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(139,92,246,0.3)")}
            />
          </div>
        </div>

        {/* Process Node */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a78bfa" }}>
            Üretim Süreci
          </label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={form.process_node}
            onChange={(e) => handleChange("process_node", e.target.value)}
          >
            <option value="" style={{ background: "#200052" }}>Seçin...</option>
            {["3nm", "5nm", "7nm", "10nm", "12nm", "16nm FinFET", "28nm", "40nm", "55nm BCD", "90nm", "180nm"].map((n) => (
              <option key={n} value={n} style={{ background: "#200052" }}>{n}</option>
            ))}
          </select>
        </div>

        {/* Compliance Checkboxes */}
        <div>
          <label className="block text-xs font-medium mb-2" style={{ color: "#a78bfa" }}>
            Uyumluluk Sertifikaları
          </label>
          <div className="flex flex-wrap gap-2">
            {complianceOptions.map((item) => (
              <button
                key={item}
                onClick={() => toggleCompliance(item)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: form.compliance.includes(item)
                    ? "rgba(124,58,237,0.35)"
                    : "rgba(255,255,255,0.04)",
                  border: form.compliance.includes(item)
                    ? "1px solid rgba(167,139,250,0.6)"
                    : "1px solid rgba(255,255,255,0.1)",
                  color: form.compliance.includes(item) ? "#c4b5fd" : "#6b7280",
                }}
              >
                {form.compliance.includes(item) ? "✓ " : ""}
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={
            submitting ||
            !form.part_number ||
            !form.manufacturer ||
            !form.batch_no ||
            !form.uid
          }
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
            boxShadow: "0 0 30px rgba(124, 58, 237, 0.45)",
            color: "white",
          }}
        >
          {submitting ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Monad'a yazılıyor...
            </>
          ) : (
            <>
              <Send size={15} />
              Monad Blockchain'e Kaydet
            </>
          )}
        </button>

        {!walletAddress && (
          <p className="text-center text-xs" style={{ color: "#ef4444" }}>
            ⚠️ İşlem göndermek için önce Monad cüzdanını bağlayın
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("engineer");
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState(null);

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    setWalletError(null);
    try {
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err) {
      setWalletError(err.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const alarmCount = dataset.filter((d) => isCritical(d.status)).length;

  const navItems = [
    {
      id: "engineer",
      label: "Mühendis Doğrulama",
      sublabel: "Komponent sorgula & doğrula",
      icon: Shield,
    },
    {
      id: "manufacturer",
      label: "Üretici Giriş Paneli",
      sublabel: "Yeni çip kaydet",
      icon: Factory,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0d0020 0%, #200052 40%, #0a0015 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Top Bar ── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b"
        style={{
          borderColor: "rgba(139, 92, 246, 0.2)",
          background: "rgba(13, 0, 32, 0.8)",
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #4c1d95)",
              boxShadow: "0 0 20px rgba(124,58,237,0.4)",
            }}
          >
            <CircuitBoard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight tracking-tight">
              IDPP
            </h1>
            <p className="text-xs" style={{ color: "#7c3aed" }}>
              Industrial Digital Component Passport
            </p>
          </div>
          {/* Monad badge */}
          <div
            className="ml-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.35)",
            }}
          >
            <Globe size={10} style={{ color: "#a78bfa" }} />
            <span className="text-xs font-mono" style={{ color: "#a78bfa" }}>
              Monad Testnet
            </span>
          </div>
        </div>

        {/* Right: Stats + Alarm + Wallet */}
        <div className="flex items-center gap-3">
          <LiveStats />

          {alarmCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full animate-pulse"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
              }}
            >
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-xs font-bold text-red-400">
                {alarmCount} ALARM
              </span>
            </div>
          )}

          {walletAddress ? (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-mono text-green-400">
                {shortAddress(walletAddress)}
              </span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={walletLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 16px rgba(124,58,237,0.4)",
                color: "white",
              }}
            >
              {walletLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} />
              )}
              {walletLoading ? "Bağlanıyor..." : "Monad Cüzdanı Bağla"}
            </button>
          )}
        </div>
      </header>

      {/* ── Wallet Error Banner ── */}
      {walletError && (
        <div
          className="px-6 py-2.5 flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={13} className="text-red-400" />
          <span className="text-xs text-red-400">{walletError}</span>
          <button onClick={() => setWalletError(null)} className="ml-auto">
            <X size={13} className="text-red-400" />
          </button>
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ── */}
        <aside
          className="w-64 flex-shrink-0 border-r flex flex-col"
          style={{
            borderColor: "rgba(139,92,246,0.15)",
            background: "rgba(13, 0, 32, 0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Nav Items */}
          <nav className="p-4 space-y-2 flex-1">
            <p
              className="text-xs font-semibold tracking-widest uppercase px-2 mb-3"
              style={{ color: "rgba(124,58,237,0.6)" }}
            >
              Paneller
            </p>
            {navItems.map(({ id, label, sublabel, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="w-full text-left p-3 rounded-xl transition-all duration-200 group"
                style={{
                  background:
                    activeTab === id
                      ? "rgba(124,58,237,0.2)"
                      : "transparent",
                  border:
                    activeTab === id
                      ? "1px solid rgba(167,139,250,0.35)"
                      : "1px solid transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg transition-all"
                    style={{
                      background:
                        activeTab === id
                          ? "rgba(124,58,237,0.3)"
                          : "rgba(255,255,255,0.04)",
                    }}
                  >
                    <Icon
                      size={15}
                      style={{
                        color: activeTab === id ? "#c4b5fd" : "#6b7280",
                      }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{
                        color: activeTab === id ? "#e9d5ff" : "#9ca3af",
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: activeTab === id ? "#7c3aed" : "#4b5563" }}
                    >
                      {sublabel}
                    </p>
                  </div>
                  {activeTab === id && (
                    <ChevronRight
                      size={14}
                      className="ml-auto"
                      style={{ color: "#a78bfa" }}
                    />
                  )}
                </div>
              </button>
            ))}
          </nav>

          {/* Sidebar Footer Stats */}
          <div
            className="p-4 border-t space-y-3"
            style={{ borderColor: "rgba(139,92,246,0.15)" }}
          >
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(124,58,237,0.6)" }}
            >
              Sistem Özeti
            </p>
            {[
              { label: "Kayıtlı Parça", value: dataset.length, icon: Cpu, color: "#a78bfa" },
              { label: "Aktif Alarm", value: alarmCount, icon: AlertTriangle, color: "#ef4444" },
              { label: "Doğrulanmış", value: dataset.filter((d) => d.monad_tx).length, icon: CheckCircle, color: "#22c55e" },
              { label: "Ağ TPS", value: "10k+", icon: BarChart3, color: "#a78bfa" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={12} style={{ color }} />
                  <span className="text-xs" style={{ color: "#6b7280" }}>{label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {activeTab === "engineer"
                ? "Mühendis Doğrulama UI"
                : "Üretici Giriş Paneli"}
            </h2>
            <p className="text-xs" style={{ color: "#7c3aed" }}>
              {activeTab === "engineer"
                ? "Monad blockchain üzerinde komponent doğrulama ve sahte ürün tespiti"
                : "Yeni yarı iletken komponentleri IDPP'ye kayıt et — AB DPP uyumlu"}
            </p>
          </div>

          {/* Tab Content */}
          {activeTab === "engineer" ? (
            <EngineerTab />
          ) : (
            <ManufacturerTab walletAddress={walletAddress} />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;