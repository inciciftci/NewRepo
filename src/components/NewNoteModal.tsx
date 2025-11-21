import React, { useState } from "react";

type NewNoteModalProps = {
  isOpen: boolean;
  countryName: string;
  countryId: number;
  onClose: () => void;
  onCreate: (note: {
    title: string;
    date: string;
    content: string;
  }) => void;
};

const NewNoteModal: React.FC<NewNoteModalProps> = ({
  isOpen,
  countryName,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [summary, setSummary] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, date, content: summary });
    setTitle("");
    setDate(new Date().toISOString().slice(0, 10));
    setSummary("");
  };

  return (
    <div
      className="
        fixed inset-0 z-40
        flex items-center justify-center
        bg-[rgba(15,26,64,0.08)]
        backdrop-blur-[6px]
      "
    >
      <div
        className="
          w-full max-w-xl
          rounded-3xl
          bg-white
          border border-[#D5E4FF]
          shadow-[0_24px_70px_rgba(15,26,64,0.18)]
          px-6 py-5
        "
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0F1A40]/60">
              Yeni not
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1A40]">
              {countryName} için hızlı not oluştur
            </h2>
            <p className="mt-1 text-xs text-[#0F1A40]/75">
              Başlık, tarih ve kısa özet gir. Daha sonra detaylı editörde içeriği
              genişletebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-[#0F1A40]/60 hover:text-[#0F1A40]"
          >
            ✕
          </button>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-[#F3F7FF] border border-[#C7D6FF] px-3 py-1 mb-3">
          <span className="h-2 w-2 rounded-full bg-[#3A6BBF]" />
          <span className="text-[11px] font-medium text-[#0F1A40]">
            Ülke: {countryName}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[210px]">
              <label className="block text-xs font-medium text-[#0F1A40]/85 mb-1">
                Başlık
              </label>
              <input
                className="w-full rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2.5 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
                placeholder="Örn: Seçim sonrası piyasa tepkisi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="w-36">
              <label className="block text-xs font-medium text-[#0F1A40]/85 mb-1">
                Tarih
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2.5 text-sm text-[#0F1A40] focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0F1A40]/85 mb-1">
              Kısa özet
            </label>
            <textarea
              className="w-full min-h-[90px] rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2.5 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
              placeholder="Haberin/olayın özünü birkaç cümleyle özetle..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[#0F1A40]/80 hover:text-[#0F1A40] px-2 py-1.5 rounded-lg hover:bg-[#F1F5FF] transition"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A6BBF] text-white text-sm font-medium shadow-[0_10px_24px_rgba(58,107,191,0.35)] hover:brightness-110 transition"
            >
              Hızlı not kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewNoteModal;
