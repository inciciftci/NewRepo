import React, { useState, useEffect, useRef } from "react";
import CountrySidebar from "./CountrySidebar";
import NewNoteModal from "./NewNoteModal";
import EditNoteModal from "./EditNoteModal";
import FullNoteModal, { FullNote } from "./FullNoteModal";
import { X, Maximize2, Edit2, Trash2, Paperclip, FileText, ExternalLink } from "lucide-react";
import type { Country, Note, Link, Attachment } from "../types";
import { displayCountryName } from "../utils/country-tr";

type CountryWithCount = Country & { count: number };

type NoteCardProps = {
  note: Note;
  isActive: boolean;
  onClick: () => void;
};

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick }) => {
  const preview =
    note.content.substring(0, 150) + (note.content.length > 150 ? "..." : "");

  return (
    <article
      onClick={onClick}
      className={[
        "group rounded-2xl border px-5 py-4 mb-3 cursor-pointer transition mx-auto max-w-[720px] min-w-0",
        isActive
          ? "border-[#C4D3FF] bg-white shadow-[0_10px_24px_rgba(15,26,64,0.10)]"
          : "border-[#DFE6FF] bg-[#F9FBFF] hover:bg-white hover:border-[#C4D3FF] hover:shadow-[0_10px_24px_rgba(15,26,64,0.08)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-[#0F1A40] group-hover:text-[#20448A]">
            {note.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[#0F1A40]/75 line-clamp-2 break-all overflow-hidden">
            {preview}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-[#F2F6FF] border border-[#C8D8FF] px-2.5 py-0.5 text-[11px] text-[#0F1A40]">
              {note.country_id}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] text-[#0F1A40]/60">{note.date}</span>
          <span className="inline-flex items-center rounded-full bg-[#EDF3FF] px-2 py-0.5 text-[11px] text-[#0F1A40]/75">
            Detayları aç
          </span>
        </div>
      </div>
    </article>
  );
};

const Dashboard: React.FC = () => {
  const [countries, setCountries] = useState<CountryWithCount[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | undefined>();
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [specificDate, setSpecificDate] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState(true);
  const [isFullOpen, setIsFullOpen] = useState(false);
  const [links, setLinks] = useState<Link[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? Number(saved) : 320;
  });
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  
  const [notesListWidth, setNotesListWidth] = useState<number>(() => {
    const saved = localStorage.getItem('notesListWidth');
    return saved ? Number(saved) : 420;
  });
  const [isResizingNotesList, setIsResizingNotesList] = useState(false);
  const startXRefNotesList = useRef(0);
  const startWidthRefNotesList = useRef(0);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountryId) loadNotes();
  }, [selectedCountryId]);

  const loadCountries = async () => {
    const allCountries = await window.electronAPI.getAllCountries();
    const countriesWithCounts = await Promise.all(
      allCountries.map(async (country) => {
        const countryNotes = await window.electronAPI.getNotesByCountry(country.id);
        return { ...country, count: countryNotes.length };
      })
    );

    setCountries(countriesWithCounts);

    if (countriesWithCounts.length > 0 && !selectedCountryId) {
      setSelectedCountryId(countriesWithCounts[0].id);
    }
  };

  const loadNotes = async () => {
    if (!selectedCountryId) return;
    const data = await window.electronAPI.getNotesByCountry(selectedCountryId);
    setNotes(data);

    setSelectedNote((prev) => {
      if (prev && data.some((n) => n.id === prev.id)) return prev;
      return data[0] ?? null;
    });
  };

  const loadLinks = async (noteId: number) => {
    const data = await window.electronAPI.getLinksByNoteId(noteId);
    setLinks(data);
  };

  const loadAttachments = async (noteId: number) => {
    const data = await window.electronAPI.getAttachments(noteId);
    setAttachments(data);
  };

  useEffect(() => {
    if (selectedNote) {
      loadLinks(selectedNote.id);
      loadAttachments(selectedNote.id);
    }
  }, [selectedNote]);

  const selectedCountry = countries.find((c) => c.id === selectedCountryId);
  const selectedCountryName = selectedCountry 
    ? displayCountryName(selectedCountry.code, selectedCountry.name)
    : "Bir ülke seçin";

  const getFilteredNotesByDate = (allNotes: Note[]) => {
    if (specificDate) {
      return allNotes.filter((note) => note.date === specificDate);
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    switch (dateFilter) {
      case "today": {
        return allNotes.filter((note) => note.date === todayStr);
      }
      case "week": {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekYyyy = weekAgo.getFullYear();
        const weekMm = String(weekAgo.getMonth() + 1).padStart(2, '0');
        const weekDd = String(weekAgo.getDate()).padStart(2, '0');
        const weekAgoStr = `${weekYyyy}-${weekMm}-${weekDd}`;
        return allNotes.filter((note) => note.date >= weekAgoStr && note.date <= todayStr);
      }
      case "month": {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthYyyy = monthAgo.getFullYear();
        const monthMm = String(monthAgo.getMonth() + 1).padStart(2, '0');
        const monthDd = String(monthAgo.getDate()).padStart(2, '0');
        const monthAgoStr = `${monthYyyy}-${monthMm}-${monthDd}`;
        return allNotes.filter((note) => note.date >= monthAgoStr && note.date <= todayStr);
      }
      default:
        return allNotes;
    }
  };

  const filteredNotes = getFilteredNotesByDate(notes).filter((note) =>
    (note.title + note.content).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (filteredNotes.length === 0) {
      setSelectedNote(null);
      return;
    }
    setSelectedNote((prev) => {
      if (prev && filteredNotes.some((n) => n.id === prev.id)) return prev;
      return filteredNotes[0];
    });
  }, [selectedCountryId, search, dateFilter, notes]);

  const handleCreateNote = async (noteData: { 
    title: string; 
    date: string; 
    content: string;
    linkUrl?: string;
    linkTitle?: string;
    attachmentPaths?: string[];
  }) => {
    if (!selectedCountryId) return;

    const newNoteId = await window.electronAPI.createNote(
      selectedCountryId,
      noteData.title,
      noteData.date,
      noteData.content
    );
    console.log('[CreateNote] newNoteId:', newNoteId, 'type:', typeof newNoteId);
    console.log('[CreateNote] attachmentPaths:', noteData.attachmentPaths);

    if (noteData.linkUrl) {
      const url = noteData.linkUrl.startsWith('http') 
        ? noteData.linkUrl 
        : `https://${noteData.linkUrl}`;
      const title = noteData.linkTitle || noteData.linkUrl;
      await window.electronAPI.addLink(newNoteId, url, title);
    }

    if (noteData.attachmentPaths && noteData.attachmentPaths.length > 0) {
      const addedAttachments = await window.electronAPI.addAttachments(newNoteId, noteData.attachmentPaths);
      console.log('[CreateNote] addAttachments returned:', addedAttachments.length, 'attachments');
      await loadAttachments(newNoteId);
    }

    await loadNotes();
    await loadCountries();
    
    const newNote = await window.electronAPI.getNoteById(newNoteId);
    if (newNote) {
      setSelectedNote(newNote);
    }
    
    setIsQuickModalOpen(false);
  };

  const handleUpdateNote = async (noteData: { id: number; title: string; date: string; content: string }) => {
    await window.electronAPI.updateNote(noteData.id, noteData.title, noteData.date, noteData.content);
    await loadNotes();
    setIsEditModalOpen(false);

    if (selectedNote?.id === noteData.id) {
      const updated = await window.electronAPI.getNoteById(noteData.id);
      if (updated) setSelectedNote(updated);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm(`"${selectedNote.title}" notunu silmek istediğinizden emin misiniz?`)) return;

    await window.electronAPI.deleteNote(selectedNote.id);
    setSelectedNote(null);
    await loadNotes();
    await loadCountries();
  };

  const handleAddLink = async () => {
    if (!selectedNote) return;
    const url = window.prompt("Link URL'sini girin:");
    if (!url) return;
    const title = window.prompt("Link başlığı (opsiyonel):") || url;

    await window.electronAPI.addLink(selectedNote.id, url, title);
    await loadLinks(selectedNote.id);
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!window.confirm("Bu linki silmek istediğinizden emin misiniz?")) return;
    await window.electronAPI.deleteLink(linkId);
    if (selectedNote) await loadLinks(selectedNote.id);
  };

  const handleAddAttachments = async () => {
    if (!selectedNote) return;
    const filePaths = await window.electronAPI.pickAttachments();
    if (filePaths.length === 0) return;
    
    await window.electronAPI.addAttachments(selectedNote.id, filePaths);
    await loadAttachments(selectedNote.id);
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!window.confirm("Bu eklentiyi silmek istediğinizden emin misiniz?")) return;
    await window.electronAPI.deleteAttachment(attachmentId);
    if (selectedNote) await loadAttachments(selectedNote.id);
  };

  const handleOpenAttachment = async (filepath: string) => {
    await window.electronAPI.openAttachment(filepath);
  };

  const fullNote: FullNote | null = selectedNote
    ? {
        title: selectedNote.title,
        date: selectedNote.date,
        country: selectedCountryName,
        content: selectedNote.content,
        link: links.length > 0 ? links[0].url : undefined,
      }
    : null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + delta;
      const minWidth = 240;
      const maxWidth = 500;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    };

    const handleBlur = () => {
      setIsResizing(false);
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isResizing]);

  const handleMouseDownNotesList = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingNotesList(true);
    startXRefNotesList.current = e.clientX;
    startWidthRefNotesList.current = notesListWidth;
  };

  useEffect(() => {
    if (!isResizingNotesList) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRefNotesList.current;
      const newWidth = startWidthRefNotesList.current + delta;
      const minWidth = 280;
      const maxWidth = 600;
      const constrainedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setNotesListWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizingNotesList(false);
      localStorage.setItem('notesListWidth', notesListWidth.toString());
    };

    const handleBlur = () => {
      setIsResizingNotesList(false);
      localStorage.setItem('notesListWidth', notesListWidth.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isResizingNotesList]);

  return (
    <>
      {/* Background + centered app card */}
      <div className="h-screen w-screen bg-[#F3F7FF] flex items-center justify-center p-8">
        <div className="w-full h-full max-w-7xl max-h-[92vh] rounded-3xl bg-white border border-[#D5E4FF] shadow-[0_24px_70px_rgba(15,26,64,0.12)] flex overflow-hidden">
          <div style={{ width: sidebarWidth, minWidth: 240, maxWidth: 500 }} className="shrink-0 relative">
            <CountrySidebar
              countries={countries}
              selected={selectedCountryId}
              setSelected={setSelectedCountryId}
            />
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-[#3A6BBF]/30 transition-colors select-none bg-transparent z-20 translate-x-1/2"
            />
          </div>

          <main className="flex-1 bg-[#F8FAFF] px-8 py-7 flex flex-col min-w-0">
            <header className="flex items-start justify-between gap-6 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#0F1A40]/55">
                  SEÇİLİ ÜLKE
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-[#0F1A40]">
                  {selectedCountryName}
                </h1>
                <p className="mt-1 text-sm text-[#0F1A40]/70 max-w-xl">
                  Bu panelde seçili ülkeye ait notlarınızı, tarih filtrelerini ve
                  eklediğiniz içerikleri görebilirsiniz.
                </p>
              </div>

              <button
                onClick={() => setIsQuickModalOpen(true)}
                disabled={!selectedCountryId}
                className="
                  mt-1 inline-flex items-center gap-2
                  rounded-xl bg-[#3A6BBF] text-white text-sm font-medium
                  px-4 py-2.5
                  shadow-[0_10px_24px_rgba(58,107,191,0.35)]
                  hover:brightness-110 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <span className="text-lg leading-none">＋</span>
                Yeni Not Oluştur
              </button>
            </header>

            {/* Filters row */}
            <section className="mb-4">
              <div
                className="
                  flex flex-wrap items-center gap-3
                  rounded-xl bg-[#EEF4FF]
                  border border-[#D5E4FF]
                  px-3 py-2
                "
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#3A6BBF]" />
                  <span className="text-[10px] font-semibold tracking-[0.16em] text-[#0F1A40]/70 uppercase">
                    Tarih
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {[
                    { id: "all", label: "Tümü" },
                    { id: "today", label: "Bugün" },
                    { id: "week", label: "Bu Hafta" },
                    { id: "month", label: "Bu Ay" },
                  ].map((f) => {
                    const isActive = dateFilter === f.id && !specificDate;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          setDateFilter(f.id);
                          setSpecificDate("");
                        }}
                        className={[
                          "inline-flex items-center gap-1.5",
                          "px-2.5 py-1 rounded-full text-[11px] font-medium border transition",
                          isActive
                            ? "bg-white text-[#0F1A40] border-[#AFC6FF] shadow-[0_4px_14px_rgba(15,26,64,0.10)]"
                            : "bg-[#DFE8FF] text-[#0F1A40]/75 border-transparent hover:bg-white/80 hover:border-[#C3D3FF]",
                        ].join(" ")}
                      >
                        <span
                          className={
                            "h-1.5 w-1.5 rounded-full " +
                            (isActive ? "bg-[#3A6BBF]" : "bg-[#B5C7F5]")
                          }
                        />
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-medium text-[#0F1A40]/60">veya</span>
                    <input
                      type="date"
                      value={specificDate}
                      onChange={(e) => {
                        setSpecificDate(e.target.value);
                        if (e.target.value) {
                          setDateFilter("all");
                        }
                      }}
                      className={[
                        "w-32 px-2 py-1 rounded-full text-[11px] font-medium border transition",
                        specificDate
                          ? "bg-white text-[#0F1A40] border-[#AFC6FF] shadow-[0_4px_14px_rgba(15,26,64,0.10)]"
                          : "bg-[#DFE8FF] text-[#0F1A40]/75 border-transparent hover:bg-white/80 hover:border-[#C3D3FF]",
                      ].join(" ")}
                    />
                    {specificDate && (
                      <button
                        onClick={() => setSpecificDate("")}
                        className="text-[11px] text-[#0F1A40]/60 hover:text-[#0F1A40] transition shrink-0"
                        title="Tarih seçimini temizle"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="ml-auto shrink-0 w-48">
                  <input
                    placeholder="Notlarda ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      w-full px-2.5 py-1
                      rounded-xl bg-white
                      border border-[#D5E4FF]
                      text-[11px] text-[#0F1A40]
                      placeholder:text-[#0F1A40]/45
                      shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-[#AFC6FF]
                      focus:border-[#AFC6FF]
                    "
                  />
                </div>
              </div>
            </section>

            {/* Notes + Detail columns */}
            <section className="flex-1 flex overflow-hidden">
              {/* Notes list */}
              <div 
                style={{ width: notesListWidth, minWidth: 280, maxWidth: 600 }} 
                className="shrink-0 rounded-2xl border border-[#D5E4FF] bg-white px-5 py-4 h-full overflow-y-auto overflow-x-hidden relative"
              >
                {filteredNotes.length === 0 ? (
                  <p className="text-sm text-[#0F1A40]/60">Henüz not bulunmuyor.</p>
                ) : (
                  filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isActive={selectedNote?.id === note.id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsDetailVisible(true);
                      }}
                    />
                  ))
                )}
                {/* Resizer handle for notes list */}
                {isDetailVisible && selectedNote && (
                  <div
                    onMouseDown={handleMouseDownNotesList}
                    className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-[#3A6BBF]/30 transition-colors select-none bg-transparent z-20 translate-x-1/2"
                  />
                )}
              </div>

              {/* Detail panel */}
              {isDetailVisible && selectedNote && (
                <aside className="flex-1 min-w-0 rounded-2xl border border-[#D5E4FF] bg-white px-6 py-5 flex flex-col">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#0F1A40]/60 uppercase">
                        Not Detayı
                      </p>
                      <h2 className="text-lg font-semibold text-[#0F1A40]">
                        {selectedNote.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-full bg-[#F2F6FF] border border-[#C8D8FF] px-3 py-1 text-[11px] text-[#0F1A40]">
                          {selectedCountryName}
                        </span>
                      </div>
                    </div>

                    {/* icons on top, date under them */}
                    <div className="flex flex-col items-end gap-2 shrink-0 min-w-[96px] pt-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDetailVisible(false)}
                          title="Paneli gizle"
                          className="
                            inline-flex items-center justify-center
                            w-9 h-9 rounded-xl
                            bg-[#EEF4FF] text-[#0F1A40]
                            border border-[#D0DFFF]
                            hover:bg-white transition
                          "
                        >
                          <X size={16} />
                        </button>

                        <button
                          onClick={() => setIsFullOpen(true)}
                          title="Tam ekranda aç"
                          className="
                            inline-flex items-center justify-center
                            w-9 h-9 rounded-xl
                            bg-[#3A6BBF] text-white
                            shadow-[0_6px_16px_rgba(58,107,191,0.35)]
                            hover:brightness-110 transition
                          "
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>

                      <span className="text-[11px] text-[#0F1A40]/60 whitespace-nowrap">
                        {selectedNote.date}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex-1 rounded-2xl border border-[#E0E7FF] bg-[#F8FAFF] px-4 py-3 overflow-y-auto">
                    <p className="text-sm leading-relaxed text-[#0F1A40]/80 whitespace-pre-line break-words">
                      {selectedNote.content}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="
                          flex-1 inline-flex items-center justify-center gap-2
                          px-4 py-2 rounded-xl
                          bg-[#EEF4FF] text-[#0F1A40]
                          border border-[#D0DFFF]
                          hover:bg-white transition
                          text-sm font-medium
                        "
                      >
                        <Edit2 size={14} />
                        Düzenle
                      </button>
                      <button
                        onClick={handleDeleteNote}
                        className="
                          flex-1 inline-flex items-center justify-center gap-2
                          px-4 py-2 rounded-xl
                          bg-red-50 text-red-600
                          border border-red-200
                          hover:bg-red-100 transition
                          text-sm font-medium
                        "
                      >
                        <Trash2 size={14} />
                        Sil
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#0F1A40]/65 uppercase">
                          Linkler
                        </p>
                        <button
                          onClick={handleAddLink}
                          className="text-xs text-[#3A6BBF] hover:underline"
                        >
                          + Link Ekle
                        </button>
                      </div>

                      {links.length === 0 ? (
                        <p className="text-xs text-[#0F1A40]/50">
                          Henüz link eklenmemiş
                        </p>
                      ) : (
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
                                className="flex-1 text-xs text-[#3A6BBF] hover:underline break-words min-w-0"
                              >
                                {link.title}
                              </a>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="text-red-500 hover:text-red-700 shrink-0"
                                title="Linki sil"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#0F1A40]/65 uppercase">
                          Eklentiler
                        </p>
                        <button
                          onClick={handleAddAttachments}
                          className="text-xs text-[#3A6BBF] hover:underline"
                        >
                          + Dosya Ekle
                        </button>
                      </div>

                      {attachments.length === 0 ? (
                        <p className="text-xs text-[#0F1A40]/50">
                          Henüz eklenti bulunmuyor
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {attachments.map((attachment) => {
                            const isPdf = attachment.mime_type === 'application/pdf';
                            return (
                              <div
                                key={attachment.id}
                                className="relative group rounded-lg border border-[#E0E7FF] bg-[#F8FAFF] p-2 hover:border-[#3A6BBF]/50 transition"
                              >
                                {isPdf ? (
                                  <div className="flex flex-col items-center justify-center h-24 bg-[#EEF4FF] rounded">
                                    <FileText size={32} className="text-[#3A6BBF]" />
                                    <p className="text-[10px] text-[#0F1A40]/60 mt-1 truncate w-full text-center px-1">
                                      {attachment.original_name || attachment.filename}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="h-24 bg-[#EEF4FF] rounded overflow-hidden flex items-center justify-center">
                                    <p className="text-xs text-[#0F1A40]/60">
                                      Görsel
                                    </p>
                                  </div>
                                )}
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <button
                                    onClick={() => handleOpenAttachment(attachment.filepath)}
                                    className="p-1 rounded bg-[#3A6BBF] text-white hover:brightness-110 transition"
                                    title="Aç"
                                  >
                                    <ExternalLink size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                    className="p-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
                                    title="Sil"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              )}
            </section>
          </main>
        </div>
      </div>

      {selectedCountryId && (
        <NewNoteModal
          isOpen={isQuickModalOpen}
          countryName={selectedCountryName}
          countryId={selectedCountryId}
          onClose={() => setIsQuickModalOpen(false)}
          onCreate={handleCreateNote}
        />
      )}

      {selectedNote && (
        <EditNoteModal
          isOpen={isEditModalOpen}
          note={selectedNote}
          countryName={selectedCountryName}
          links={links}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateNote}
          onAddLink={handleAddLink}
          onDeleteLink={handleDeleteLink}
        />
      )}

      <FullNoteModal
        isOpen={isFullOpen}
        note={fullNote}
        onClose={() => setIsFullOpen(false)}
      />
    </>
  );
};

export default Dashboard;
