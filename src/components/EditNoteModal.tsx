import React, { useState, useEffect } from "react";
import { Trash2, Paperclip, FileText } from "lucide-react";
import type { Link, Attachment } from "../types";

type EditNoteModalProps = {
  isOpen: boolean;
  note: {
    id: number;
    title: string;
    date: string;
    content: string;
  } | null;
  countryName: string;
  links: Link[];
  attachments: Attachment[];
  onClose: () => void;
  onUpdate: (noteData: {
    id: number;
    title: string;
    date: string;
    content: string;
  }) => void;
  onAddLink: (url: string, title: string) => void;
  onDeleteLink: (linkId: number) => void;
  onAddAttachments: (filePaths: string[]) => void;
  onDeleteAttachment: (attachmentId: number) => void;
  onOpenAttachment: (filepath: string) => void;
};

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  note,
  countryName,
  links,
  attachments,
  onClose,
  onUpdate,
  onAddLink,
  onDeleteLink,
  onAddAttachments,
  onDeleteAttachment,
  onOpenAttachment,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");

  useEffect(() => {
    if (isOpen && note) {
      setTitle(note.title);
      setDate(note.date);
      setContent(note.content);
    }
  }, [isOpen, note?.id]);

  if (!isOpen || !note) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ id: note.id, title, date, content });
  };

  const handleAddFiles = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.pickAttachments) {
        console.error('[EditNoteModal] electronAPI.pickAttachments is not available');
        return;
      }
      const filePaths = await window.electronAPI.pickAttachments();
      console.log('[EditNoteModal] selected file paths:', filePaths);
      if (filePaths && filePaths.length > 0) {
        onAddAttachments(filePaths);
      }
    } catch (error) {
      console.error('[EditNoteModal] Error picking attachments:', error);
    }
  };

  const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) {
      return <FileText size={14} className="text-blue-500" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText size={14} className="text-red-500" />;
    }
    return <FileText size={14} className="text-gray-500" />;
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
          w-full max-w-2xl
          rounded-3xl
          bg-white
          border border-[#D5E4FF]
          shadow-[0_24px_70px_rgba(15,26,64,0.18)]
          px-6 py-5
          max-h-[90vh]
          overflow-y-auto
        "
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#0F1A40]/60">
              Notu Düzenle
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#0F1A40]">
              {countryName} - Not Düzenleme
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-[#0F1A40]/60 hover:text-[#0F1A40]"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[210px]">
              <label className="block text-xs font-medium text-[#0F1A40]/85 mb-1">
                Başlık
              </label>
              <input
                className="w-full rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2.5 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
                placeholder="Not başlığı"
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
              İçerik
            </label>
            <textarea
              className="w-full min-h-[200px] rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2.5 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
              placeholder="Not içeriğini buraya yazın..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="space-y-3 pt-3 border-t border-[#E0E7FF]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#0F1A40]/65 uppercase">
                Linkler
              </p>
            </div>

            {links.length > 0 && (
              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFF] border border-[#E0E7FF] min-w-0"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = link.url.startsWith('http') 
                          ? link.url 
                          : `https://${link.url}`;
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="flex-1 text-xs text-[#3A6BBF] hover:underline break-words min-w-0"
                    >
                      {link.title}
                    </a>
                    <button
                      type="button"
                      onClick={() => onDeleteLink(link.id)}
                      className="text-red-500 hover:text-red-700 shrink-0"
                      title="Linki sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-medium text-[#0F1A40]/85">Yeni Link Ekle</p>
              <div className="flex gap-2">
                <input
                  type="url"
                  className="flex-1 rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
                  placeholder="https://ornek.com/..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <input
                  className="flex-1 rounded-xl border border-[#C7D6FF] bg-[#F8FAFF] px-3 py-2 text-sm text-[#0F1A40] placeholder:text-[#0F1A40]/55 focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]"
                  placeholder="Link başlığı"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (linkUrl.trim()) {
                      const url = linkUrl.startsWith('http') 
                        ? linkUrl 
                        : `https://${linkUrl}`;
                      onAddLink(url, linkTitle.trim() || linkUrl.trim());
                      setLinkUrl("");
                      setLinkTitle("");
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#3A6BBF] text-white text-xs font-medium hover:brightness-110 transition"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#E0E7FF]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#0F1A40]/65 uppercase">
                Dosya Eklentileri
              </p>
              <button
                type="button"
                onClick={handleAddFiles}
                className="flex items-center gap-1 text-xs text-[#3A6BBF] hover:underline"
              >
                <Paperclip size={14} />
                Dosya Ekle
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#F8FAFF] border border-[#E0E7FF] min-w-0"
                  >
                    {getFileIcon(attachment.mime_type)}
                    <button
                      type="button"
                      onClick={() => onOpenAttachment(attachment.filepath)}
                      className="flex-1 text-xs text-[#3A6BBF] hover:underline break-words min-w-0 text-left"
                      title="Dosyayı aç"
                    >
                      {attachment.original_name || attachment.filename}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAttachment(attachment.id)}
                      className="text-red-500 hover:text-red-700 shrink-0"
                      title="Eklentiyi sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <p className="text-[10px] text-[#0F1A40]/60">
                  {attachments.length} dosya ekli
                </p>
              </div>
            )}

            {attachments.length === 0 && (
              <p className="text-xs text-[#0F1A40]/50 italic">
                Henüz dosya eklenmemiş
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[#0F1A40]/80 hover:text-[#0F1A40] px-2 py-1.5 rounded-lg hover:bg-[#F1F5FF] transition"
            >
              İptal
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3A6BBF] text-white text-sm font-medium shadow-[0_10px_24px_rgba(58,107,191,0.35)] hover:brightness-110 transition"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditNoteModal;
