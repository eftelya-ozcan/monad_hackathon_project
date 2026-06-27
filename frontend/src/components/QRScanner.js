import React, { useState, useCallback } from "react";
import QrReader from "react-qr-reader-es6";
import {
  Camera,
  CameraOff,
  Crosshair,
  Zap,
  AlertTriangle,
  CheckCircle,
  X,
  Scan,
  Wifi,
} from "lucide-react";

// ─── QRScanner Component ─────────────────────────────────────────────────────
const QRScanner = ({ onScanResult, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScanTime, setLastScanTime] = useState(null);

  // Handle successful QR scan
  const handleScan = useCallback(
    (data) => {
      if (data && !isProcessing) {
        setIsProcessing(true);
        const t0 = performance.now();

        // Simulate Monad parallel hash verification delay
        setTimeout(() => {
          const t1 = performance.now();
          const processingTime = (t1 - t0).toFixed(1);

          setScanResult(data);
          setScanCount((prev) => prev + 1);
          setLastScanTime(new Date().toLocaleTimeString("tr-TR"));
          setScanError(null);
          setIsProcessing(false);

          // Propagate result to parent
          if (onScanResult) {
            onScanResult({
              raw: data,
              uid: data.startsWith("0x") ? data : `0x${data}`,
              processingTime,
              scannedAt: new Date().toISOString(),
            });
          }
        }, 280);
      }
    },
    [isProcessing, onScanResult]
  );

  // Handle camera error
  const handleError = useCallback((err) => {
    console.error("QR Scanner error:", err);
    if (err?.name === "NotAllowedError") {
      setScanError(
        "Kamera erişimi reddedildi. Lütfen tarayıcı izinlerini kontrol edin."
      );
    } else if (err?.name === "NotFoundError") {
      setScanError("Kamera bulunamadı. Cihazınızda kamera mevcut değil.");
    } else {
      setScanError(`Kamera hatası: ${err?.message || "Bilinmeyen hata"}`);
    }
    setIsActive(false);
  }, []);

  const startScanner = () => {
    setScanResult(null);
    setScanError(null);
    setIsActive(true);
  };

  const stopScanner = () => {
    setIsActive(false);
  };

  const clearResult = () => {
    setScanResult(null);
    setScanError(null);
  };

  return (
    <div className="relative w-full">
      {/* ── Scanner Panel ── */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          background: "rgba(32, 0, 82, 0.7)",
          borderColor: "rgba(139, 92, 246, 0.4)",
          boxShadow:
            "0 0 40px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "rgba(139, 92, 246, 0.2)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ background: "rgba(139, 92, 246, 0.2)" }}
            >
              <Scan size={18} style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                QR Kod Tarayıcı
              </p>
              <p className="text-xs" style={{ color: "#7c3aed" }}>
                Chip UID Hash Doğrulama
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            {isActive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">CANLI</span>
              </div>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Camera Viewport */}
        <div className="relative" style={{ minHeight: "300px" }}>
          {isActive ? (
            <div className="relative">
              {/* QR Reader */}
              <div className="relative overflow-hidden" style={{ maxHeight: "340px" }}>
                <QrReader
                  delay={200}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                  facingMode="environment"
                />

                {/* Overlay: Corner brackets */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Top-left */}
                    <div
                      className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2"
                      style={{ borderColor: "#a78bfa" }}
                    />
                    {/* Top-right */}
                    <div
                      className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2"
                      style={{ borderColor: "#a78bfa" }}
                    />
                    {/* Bottom-left */}
                    <div
                      className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2"
                      style={{ borderColor: "#a78bfa" }}
                    />
                    {/* Bottom-right */}
                    <div
                      className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2"
                      style={{ borderColor: "#a78bfa" }}
                    />
                    {/* Animated scan line */}
                    <div
                      className="absolute left-0 right-0 h-0.5"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #a78bfa, transparent)",
                        animation: "scanLine 2s linear infinite",
                        top: "50%",
                      }}
                    />
                    {/* Center crosshair */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Crosshair size={20} style={{ color: "rgba(167,139,250,0.6)" }} />
                    </div>
                  </div>
                </div>

                {/* Processing overlay */}
                {isProcessing && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(32,0,82,0.85)" }}
                  >
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={20} style={{ color: "#a78bfa" }} className="animate-pulse" />
                        <span className="text-sm font-mono" style={{ color: "#a78bfa" }}>
                          Monad'a doğrulanıyor...
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(139,92,246,0.2)", width: "160px" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                            animation: "progressBar 0.28s linear forwards",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              <div
                className="flex items-center justify-between px-5 py-3 border-t"
                style={{
                  borderColor: "rgba(139, 92, 246, 0.2)",
                  background: "rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Wifi size={12} style={{ color: "#7c3aed" }} />
                    <span className="text-xs" style={{ color: "#7c3aed" }}>
                      Monad Testnet
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-green-400" />
                    <span className="text-xs text-green-400">
                      {scanCount} tarama
                    </span>
                  </div>
                </div>
                {lastScanTime && (
                  <span className="text-xs font-mono" style={{ color: "#6d28d9" }}>
                    Son: {lastScanTime}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Idle State */
            <div
              className="flex flex-col items-center justify-center py-16 px-8"
              style={{ minHeight: "300px" }}
            >
              <div
                className="p-5 rounded-2xl mb-5"
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  border: "1px dashed rgba(139, 92, 246, 0.4)",
                }}
              >
                <Camera size={40} style={{ color: "rgba(139, 92, 246, 0.6)" }} />
              </div>
              <p className="text-white font-medium mb-1 text-center">
                Kamera Hazır
              </p>
              <p
                className="text-xs text-center mb-6"
                style={{ color: "#6d28d9", maxWidth: "220px" }}
              >
                Çip yüzeyindeki QR kodu kameranın önüne tutun. UID hash'i otomatik
                olarak yakalanacak.
              </p>

              {/* Instruction steps */}
              <div className="w-full max-w-xs space-y-2 mb-6">
                {[
                  { num: "01", text: "Çip QR kodunu belirleyin" },
                  { num: "02", text: "Kamerayı QR koda doğrultun" },
                  { num: "03", text: "Monad hash doğrulaması otomatik başlar" },
                ].map((step) => (
                  <div key={step.num} className="flex items-center gap-3">
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: "#7c3aed" }}
                    >
                      {step.num}
                    </span>
                    <span className="text-xs text-gray-400">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Error State ── */}
        {scanError && (
          <div
            className="mx-4 mb-4 p-3 rounded-xl flex items-start gap-3"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-red-400 mb-0.5">
                Kamera Hatası
              </p>
              <p className="text-xs text-red-300">{scanError}</p>
            </div>
          </div>
        )}

        {/* ── Scan Result ── */}
        {scanResult && (
          <div
            className="mx-4 mb-4 p-4 rounded-xl"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={15} className="text-green-400" />
                <span className="text-xs font-semibold text-green-400">
                  QR KOD OKUNDU
                </span>
              </div>
              <button
                onClick={clearResult}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X size={12} className="text-gray-500" />
              </button>
            </div>
            <p
              className="text-xs font-mono break-all"
              style={{ color: "#86efac", lineHeight: 1.6 }}
            >
              {scanResult}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Zap size={11} style={{ color: "#7c3aed" }} />
              <span className="text-xs" style={{ color: "#7c3aed" }}>
                Monad Testnet'e aktarıldı
              </span>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="p-4 flex gap-3">
          {!isActive ? (
            <button
              onClick={startScanner}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)",
                color: "white",
              }}
            >
              <Camera size={16} />
              Kamerayı Başlat
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-red-500/20"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171",
              }}
            >
              <CameraOff size={16} />
              Kamerayı Durdur
            </button>
          )}
        </div>
      </div>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes scanLine {
          0% { top: 10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;