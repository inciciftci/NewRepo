import React, { useState } from "react";

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const isValid = await window.electronAPI.verifyPassword(password);
      if (isValid) {
        onLogin();
      } else {
        setError("Şifre hatalı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F7FF]">
      <div className="w-full max-w-lg mx-4 rounded-3xl bg-white border border-[#D5E4FF] shadow-[0_20px_50px_rgba(15,26,64,0.08)] px-10 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#545659]/60">
            Güvenli giriş
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#0F1A40]">
            Country Notes
          </h1>
          <p className="mt-2 text-sm text-[#0F1A40]/75">
            Giriş için admin şifrenizi kullanın.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm text-[#0F1A40]">
              <span className="uppercase tracking-[0.25em] text-[11px] text-[#0F1A40]/60 block mb-1">
                Admin Parolası
              </span>
            </label>

            <div className="relative mt-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                disabled={loading}
                className="
                  w-full rounded-xl
                  bg-white
                  border border-[#C8D8FF]
                  px-4 py-3
                  text-sm
                  text-[#0F1A40]
                  placeholder:text-[#0F1A40]/45
                  shadow-sm
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#AFC6FF]
                  focus:border-[#AFC6FF]
                  disabled:opacity-50
                "
              />
            </div>

            <p className="text-[11px] text-[#0F1A40]/65 mt-1">
              Uygulama tamamen offline çalışır; şifre yalnızca bu cihazda
              doğrulanır.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!password || loading}
            className="
              w-full py-3
              rounded-xl
              bg-[#3A6BBF]
              text-white
              text-sm font-medium
              shadow-[0_10px_25px_rgba(58,107,191,0.35)]
              hover:brightness-110
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            {loading ? "Doğrulanıyor..." : "Panele giriş yap"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[11px] text-[#0F1A40]/60">
          <span>v1.0.0 • offline secure</span>
          <span>encrypted locally</span>
        </div>
      </div>
    </div>
  );
}
