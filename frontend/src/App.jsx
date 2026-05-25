import { useState, useEffect } from "react";
import { 
  Link2, Copy, Check, ExternalLink, BarChart3, 
  RefreshCw, Trash2, Sparkles, AlertCircle 
} from "lucide-react";

const API_BASE = import.meta.env.DEV 
  ? "http://localhost:5002/api" 
  : "/api";

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const saved = localStorage.getItem("url_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setResult(data);
      setUrl("");

      const updatedHistory = [data, ...history.filter(item => item.shortCode !== data.shortCode)];
      setHistory(updatedHistory);
      localStorage.setItem("url_history", JSON.stringify(updatedHistory));
      triggerToast("URL shortened successfully!");
    } catch (err) {
      setError(err.message);
      triggerToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      triggerToast("Copied to clipboard!");
      setTimeout(() => setCopiedId(""), 2000);
    } catch (err) {
      triggerToast("Failed to copy link", "error");
    }
  };

  const refreshAnalytics = async (shortCode) => {
    try {
      const response = await fetch(`${API_BASE}/analytics/${shortCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch analytics");
      }

      const updatedHistory = history.map(item => 
        item.shortCode === shortCode 
          ? { ...item, clicks: data.clicks } 
          : item
      );
      setHistory(updatedHistory);
      localStorage.setItem("url_history", JSON.stringify(updatedHistory));

      if (result && result.shortCode === shortCode) {
        setResult(prev => ({ ...prev, clicks: data.clicks }));
      }

      triggerToast("Analytics updated!");
    } catch (err) {
      triggerToast("Error updating analytics", "error");
    }
  };

  const deleteHistoryItem = (shortCode) => {
    const updated = history.filter(item => item.shortCode !== shortCode);
    setHistory(updated);
    localStorage.setItem("url_history", JSON.stringify(updated));
    triggerToast("Item removed from history");
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("url_history");
    triggerToast("History cleared");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-4 py-8 relative">
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-xl transition-all duration-300 animate-slide-up ${
          toast.type === "success" 
            ? "bg-brand-500/10 border-brand-500/30 text-indigo-300" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {toast.type === "success" ? <Sparkles className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <header className="w-full max-w-4xl flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Link2 className="w-6 h-6 text-white transform -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text">
            Short<span className="text-brand-500">ly</span>
          </span>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col justify-center py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
            Shorten Your <span className="bg-gradient-to-r from-brand-500 to-indigo-400 bg-clip-text text-transparent">Loong Links</span>
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-md mx-auto">
            Create clean, memorable, and trackable links in just one click. Perfect for social sharing.
          </p>
        </div>

        <div className="bg-dark-800/60 backdrop-blur-xl border border-dark-700 p-6 md:p-8 rounded-2xl shadow-2xl relative">
          <form onSubmit={handleShorten} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Paste a link to shorten..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3.5 bg-dark-700/80 border border-dark-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 flex items-center justify-center gap-2 min-w-[140px] text-sm disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Shorten</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/5 border border-red-500/10 px-4 py-2.5 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="mt-6 p-5 bg-brand-500/5 border border-brand-500/20 rounded-xl animate-fade-in">
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-500">Original Link</span>
                  <p className="text-gray-400 text-xs truncate mt-0.5">{result.originalUrl}</p>
                </div>
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-dark-700/50">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-500">Short Link</span>
                    <p className="text-white text-sm font-semibold truncate mt-0.5">{result.shortUrl}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(result.shortUrl, "result")}
                      className="p-2.5 bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-brand-500/30 text-gray-300 hover:text-white rounded-lg transition-all"
                      title="Copy Link"
                    >
                      {copiedId === "result" ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all shadow-md shadow-brand-600/10"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-8 bg-dark-800/30 border border-dark-700/60 p-5 rounded-2xl shadow-xl animate-slide-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-700/60">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                <span>Recent Links & Click Logs</span>
              </h2>
              <button
                onClick={clearHistory}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.shortCode}
                  className="flex items-center justify-between gap-4 p-3 bg-dark-700/40 hover:bg-dark-700/70 border border-dark-700/50 hover:border-dark-600 rounded-xl transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 truncate">{item.originalUrl}</p>
                    <p className="text-sm font-medium text-white truncate mt-0.5">{item.shortUrl}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-dark-700 border border-dark-600 rounded-lg">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Clicks</span>
                      <span className="text-xs font-bold text-indigo-300">{item.clicks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => refreshAnalytics(item.shortCode)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-600 rounded-md transition-all border border-transparent hover:border-dark-600"
                        title="Refresh Analytics"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.shortUrl, item.shortCode)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-dark-600 rounded-md transition-all border border-transparent hover:border-dark-600"
                        title="Copy Link"
                      >
                        {copiedId === item.shortCode ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item.shortCode)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-md transition-all border border-transparent hover:border-dark-600"
                        title="Delete from History"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-4xl text-center py-6 border-t border-dark-700/30">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Shortly. Created with React & Tailwind CSS. Fast & Secure URL Shortener.
        </p>
      </footer>
    </div>
  );
}
