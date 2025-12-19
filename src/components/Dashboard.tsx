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
        "group rounded-2xl border px-4 sm:px-5 py-3 sm:py-4 mb-3 cursor-pointer mx-auto max-w-[720px] min-w-0",
        "transition-all duration-200 ease-out",
        isActive
          ? "border-cyan-400/40 bg-white shadow-md ring-2 ring-cyan-400/20"
          : "border-slate-200/60 bg-white/80 hover:bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-[1px]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
            {note.title}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2 break-all overflow-hidden">
            {preview}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
              {note.country_id}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">{note.date}</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors duration-200">
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
      {/* Background with gradient */}
      <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 flex items-center justify-center p-2 sm:p-4 lg:p-6">
        {/* Main app container with glass effect */}
        <div className="w-full h-full max-w-7xl max-h-[98vh] sm:max-h-[96vh] lg:max-h-[94vh] rounded-2xl sm:rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_25px_80px_rgba(15,23,42,0.15)] flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar - hidden on mobile, shown on lg+ */}
          <div style={{ width: sidebarWidth, minWidth: 240, maxWidth: 500 }} className="hidden lg:block shrink-0 relative">
            <CountrySidebar
              countries={countries}
              selected={selectedCountryId}
              setSelected={setSelectedCountryId}
            />
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/30 transition-colors duration-200 select-none bg-transparent z-20 translate-x-1/2"
            />
          </div>

          {/* Mobile sidebar - shown only on mobile/tablet */}
          <div className="lg:hidden shrink-0 border-b border-slate-200/60 max-h-[35vh] overflow-y-auto bg-white/50 backdrop-blur-sm">
            <CountrySidebar
              countries={countries}
              selected={selectedCountryId}
              setSelected={setSelectedCountryId}
            />
          </div>

          <main className="flex-1 bg-gradient-to-br from-slate-50/80 to-blue-50/50 px-3 sm:px-5 lg:px-8 py-4 sm:py-5 lg:py-7 flex flex-col min-w-0 overflow-hidden">
            <header className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">
                  SEÇİLİ ÜLKE
                </p>
                <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight truncate">
                  {selectedCountryName}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-xl hidden sm:block leading-relaxed">
                  Bu panelde seçili ülkeye ait notlarınızı, tarih filtrelerini ve
                  eklediğiniz içerikleri görebilirsiniz.
                </p>
              </div>

              <button
                onClick={() => setIsQuickModalOpen(true)}
                disabled={!selectedCountryId}
                className="
                  inline-flex items-center gap-1.5 sm:gap-2
                  rounded-xl sm:rounded-2xl 
                  bg-gradient-to-r from-blue-600 to-cyan-500 
                  text-white text-xs sm:text-sm font-semibold
                  px-4 sm:px-5 py-2.5 sm:py-3
                  shadow-[0_10px_30px_rgba(37,99,235,0.3)]
                  hover:shadow-[0_14px_40px_rgba(6,182,212,0.35)]
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  shrink-0
                "
              >
                <span className="text-base sm:text-lg leading-none">+</span>
                <span className="hidden sm:inline">Yeni Not Oluştur</span>
                <span className="sm:hidden">Yeni Not</span>
              </button>
            </header>

            {/* Filters row - Glass morphism style */}
            <section className="mb-4 sm:mb-5">
              <div
                className="
                  flex flex-wrap items-center gap-2 sm:gap-4
                  rounded-2xl bg-white/60 backdrop-blur-md
                  border border-white/40
                  shadow-[0_4px_20px_rgba(15,23,42,0.06)]
                  px-3 sm:px-4 py-2.5 sm:py-3
                "
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] text-slate-600 uppercase">
                    Tarih
                  </span>
                </div>

                {/* Segmented control style filter buttons */}
                <div className="inline-flex rounded-full bg-slate-900/5 p-1">
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
                          "px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200",
                          isActive
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900",
                        ].join(" ")}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
                  
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-medium text-slate-400">veya</span>
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
                      "w-32 px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all duration-200",
                      specificDate
                        ? "bg-white text-slate-900 border-cyan-400/40 shadow-sm ring-2 ring-cyan-400/20"
                        : "bg-white/80 text-slate-600 border-slate-200/60 hover:bg-white hover:border-slate-300",
                    ].join(" ")}
                  />
                  {specificDate && (
                    <button
                      onClick={() => setSpecificDate("")}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors duration-200 shrink-0"
                      title="Tarih seçimini temizle"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Search input with icon style */}
                <div className="ml-auto shrink-0 w-36 sm:w-52 relative">
                  <input
                    placeholder="Notlarda ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      w-full pl-3 pr-3 py-2
                      rounded-xl bg-white/80
                      border border-slate-200/60
                      text-xs text-slate-900
                      placeholder:text-slate-400
                      shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40
                      focus:bg-white
                      transition-all duration-200
                    "
                  />
                </div>
              </div>
            </section>

            {/* Notes + Detail columns */}
            <section className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
              {/* Notes list - Modern card style */}
              <div 
                className="md:shrink-0 rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 h-[40%] md:h-full md:w-[280px] lg:w-[320px] xl:w-[380px] overflow-y-auto overflow-x-hidden relative shadow-sm"
              >
                {filteredNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-sm text-slate-500">Henüz not bulunmuyor.</p>
                    <p className="text-xs text-slate-400 mt-1">Yeni bir not oluşturun</p>
                  </div>
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
                    className="absolute top-0 right-0 w-[6px] h-full cursor-col-resize hover:bg-blue-500/30 transition-colors duration-200 select-none bg-transparent z-20 translate-x-1/2"
                  />
                )}
              </div>

              {/* Detail panel - Modern glass style */}
              {isDetailVisible && selectedNote && (
                <aside className="flex-1 min-w-0 rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 sm:py-5 flex flex-col h-[60%] md:h-full shadow-sm">
                  <div className="mb-3 sm:mb-4 flex items-start justify-between gap-3 sm:gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                        Not Detayı
                      </p>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                        {selectedNote.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 px-3 py-1 text-[11px] font-medium text-blue-700">
                          {selectedCountryName}
                        </span>
                      </div>
                    </div>

                    {/* icons on top, date under them */}
                    <div className="flex flex-col items-end gap-2 shrink-0 min-w-[80px] sm:min-w-[96px] pt-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDetailVisible(false)}
                          title="Paneli gizle"
                          className="
                            inline-flex items-center justify-center
                            w-8 h-8 sm:w-9 sm:h-9 rounded-xl
                            bg-slate-100 text-slate-600
                            border border-slate-200/60
                            hover:bg-white hover:shadow-sm hover:border-slate-300
                            transition-all duration-200
                          "
                        >
                          <X size={16} />
                        </button>

                        <button
                          onClick={() => setIsFullOpen(true)}
                          title="Tam ekranda aç"
                          className="
                            inline-flex items-center justify-center
                            w-8 h-8 sm:w-9 sm:h-9 rounded-xl
                            bg-gradient-to-r from-blue-600 to-cyan-500 text-white
                            shadow-[0_6px_20px_rgba(37,99,235,0.3)]
                            hover:shadow-[0_8px_25px_rgba(6,182,212,0.35)]
                            hover:scale-105 active:scale-95
                            transition-all duration-200
                          "
                        >
                          <Maximize2 size={16} />
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">
                        {selectedNote.date}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex-1 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-3 overflow-y-auto">
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line break-words">
                      {selectedNote.content}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="
                          flex-1 inline-flex items-center justify-center gap-2
                          px-4 py-2.5 rounded-xl
                          bg-slate-100 text-slate-700
                          border border-slate-200/60
                          hover:bg-white hover:shadow-sm hover:border-slate-300
                          transition-all duration-200
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
                          px-4 py-2.5 rounded-xl
                          bg-red-50 text-red-600
                          border border-red-200/60
                          hover:bg-red-100 hover:border-red-300
                          transition-all duration-200
                          text-sm font-medium
                        "
                      >
                        <Trash2 size={14} />
                        Sil
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                          Linkler
                        </p>
                        <button
                          onClick={handleAddLink}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                          + Link Ekle
                        </button>
                      </div>

                      {links.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          Henüz link eklenmemiş
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {links.map((link) => (
                            <div
                              key={link.id}
                              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 min-w-0 hover:bg-white hover:shadow-sm transition-all duration-200"
                            >
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-xs text-blue-600 hover:text-blue-700 font-medium break-words min-w-0"
                              >
                                {link.title}
                              </a>
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                className="text-red-400 hover:text-red-600 shrink-0 transition-colors duration-200"
                                title="Linki sil"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 uppercase">
                          Eklentiler
                        </p>
                        <button
                          onClick={handleAddAttachments}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                          + Dosya Ekle
                        </button>
                      </div>

                      {attachments.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          Henüz eklenti bulunmuyor
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {attachments.map((attachment) => {
                            const isPdf = attachment.mime_type === 'application/pdf';
                            return (
                              <div
                                key={attachment.id}
                                className="relative group rounded-xl border border-slate-200/60 bg-slate-50 p-2 hover:bg-white hover:shadow-sm hover:border-slate-300 transition-all duration-200"
                              >
                                {isPdf ? (
                                  <div className="flex flex-col items-center justify-center h-20 sm:h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                    <FileText size={28} className="text-blue-500" />
                                    <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1.5 truncate w-full text-center px-1 font-medium">
                                      {attachment.original_name || attachment.filename}
                                    </p>
                                  </div>
                                ) : (
                                  <div className="h-20 sm:h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg overflow-hidden flex items-center justify-center">
                                    <p className="text-xs text-slate-500 font-medium">
                                      Görsel
                                    </p>
                                  </div>
                                )}
                                <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={() => handleOpenAttachment(attachment.filepath)}
                                    className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                                    title="Aç"
                                  >
                                    <ExternalLink size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAttachment(attachment.id)}
                                    className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
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
          attachments={attachments}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateNote}
          onAddLink={handleAddLink}
          onDeleteLink={handleDeleteLink}
          onAddAttachments={async (filePaths: string[]) => {
            await window.electronAPI.addAttachments(selectedNote.id, filePaths);
            await loadAttachments(selectedNote.id);
          }}
          onDeleteAttachment={async (attachmentId: number) => {
            if (!window.confirm("Bu eklentiyi silmek istediğinizden emin misiniz?")) return;
            await window.electronAPI.deleteAttachment(attachmentId);
            await loadAttachments(selectedNote.id);
          }}
          onOpenAttachment={handleOpenAttachment}
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
