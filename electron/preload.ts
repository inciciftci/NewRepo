import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  verifyPassword: (password: string) => ipcRenderer.invoke('verify-password', password),
  getAllCountries: () => ipcRenderer.invoke('get-all-countries'),
  getCountryById: (id: number) => ipcRenderer.invoke('get-country-by-id', id),
  getNotesByCountry: (countryId: number) => ipcRenderer.invoke('get-notes-by-country', countryId),
  getNotesByCountryAndDate: (countryId: number, date: string) => ipcRenderer.invoke('get-notes-by-country-and-date', countryId, date),
  getNoteById: (id: number) => ipcRenderer.invoke('get-note-by-id', id),
  createNote: (countryId: number, title: string, date: string, content: string) => ipcRenderer.invoke('create-note', countryId, title, date, content),
  updateNote: (id: number, title: string, date: string, content: string) => ipcRenderer.invoke('update-note', id, title, date, content),
  deleteNote: (id: number) => ipcRenderer.invoke('delete-note', id),
  getImagesByNoteId: (noteId: number) => ipcRenderer.invoke('get-images-by-note-id', noteId),
  addImage: (noteId: number, filename: string, fileData: string) => ipcRenderer.invoke('add-image', noteId, filename, fileData),
  deleteImage: (id: number) => ipcRenderer.invoke('delete-image', id),
  getLinksByNoteId: (noteId: number) => ipcRenderer.invoke('get-links-by-note-id', noteId),
  addLink: (noteId: number, url: string, title: string) => ipcRenderer.invoke('add-link', noteId, url, title),
  deleteLink: (id: number) => ipcRenderer.invoke('delete-link', id),
  searchNotes: (query: string) => ipcRenderer.invoke('search-notes', query),
});
