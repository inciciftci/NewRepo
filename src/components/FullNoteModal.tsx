import React from "react";

export type FullNote = {
  title: string;
  date: string;
  tag?: string;
  country?: string;
  link?: string;
  content?: string;
};

type FullNoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  note: FullNote | null;
};

const FullNoteModal: React.FC<FullNoteModalProps> = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#0F1A40]/25 backdrop-blur-sm">
      <div
        className="
          h-full w-full
          flex items-center justify-center
        "
      >
        <div
          className="
            h-[86vh] w-[92vw]
            rounded-3xl
            bg-white
            border border-[#D5E4FF]
            shadow-[0_30px_80px_rgba(15,26,64,0.30)]
            px-10 py-8
            flex flex-col
          "
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#0F1A40]/55 uppercase">
                Not Detayı • Tam Ekran
              </p>
              <h2 className="text-2xl font-semibold text-[#0F1A40]">
                {note.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {note.tag && (
                  <span className="inline-flex items-center rounded-full bg-[#EAF0FF] border border-[#B7C9FF] px-3 py-1 text-[11px] text-[#0F1A40]">
                    {note.tag}
                  </span>
                )}
                {note.country && (
                  <span className="inline-flex items-center rounded-full bg-[#F2F6FF] border border-[#C8D8FF] px-3 py-1 text-[11px] text-[#0F1A40]">
                    {note.country}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className="text-[11px] text-[#0F1A40]/60">{note.date}</span>
              <button
                onClick={onClose}
                className="
                  inline-flex items-center justify-center
                  rounded-xl px-4 py-1.5
                  text-xs font-medium
                  bg-[#EEF4FF]
                  text-[#0F1A40]
                  border border-[#D0DFFF]
                  hover:bg-white
                  transition
                "
              >
                Kapat
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 overflow-hidden">
            <div className="flex-1 rounded-2xl border border-[#E0E7FF] bg-[#F8FAFF] px-5 py-4 overflow-y-auto">
              <p className="text-sm leading-relaxed text-[#0F1A40]/80 whitespace-pre-line">
                {note.content ??
                  "Bu alan, haber metninin veya kendi analizinizin daha uzun hâlini yazmanız için tasarlandı. Önemli tarihleri, aktörleri ve olayların etkilerini paragraflar hâlinde detaylandırabilirsiniz."}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#0F1A40]/65 uppercase">
                Haber / Referans Linki
              </p>
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                <input
                  readOnly
                  value={note.link ?? "Henüz link eklenmemiş"}
                  className="
                    flex-1 px-4 py-2.5
                    rounded-xl
                    bg-[#F8FAFF]
                    border border-[#D5E4FF]
                    text-xs
                    text-[#0F1A40]
                    placeholder:text-[#0F1A40]/45
                    focus:outline-none
                  "
                />
                <button
                  onClick={() => {
                    if (note.link) {
                      const url = note.link.startsWith('http') 
                        ? note.link 
                        : `https://${note.link}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  disabled={!note.link}
                  className="
                    shrink-0
                    px-4 py-2.5
                    rounded-xl
                    bg-[#3A6BBF]
                    text-white
                    text-xs font-medium
                    shadow-[0_8px_20px_rgba(58,107,191,0.35)]
                    hover:brightness-110
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Linki aç
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullNoteModal;
