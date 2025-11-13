import type { Country, Note, Image, Link } from './types';

export interface ElectronAPI {
  verifyPassword: (password: string) => Promise<boolean>;
  getAllCountries: () => Promise<Country[]>;
  getCountryById: (id: number) => Promise<Country | undefined>;
  getNotesByCountry: (countryId: number) => Promise<Note[]>;
  getNotesByCountryAndDate: (countryId: number, date: string) => Promise<Note[]>;
  getNoteById: (id: number) => Promise<Note | undefined>;
  createNote: (countryId: number, title: string, date: string, content: string) => Promise<number>;
  updateNote: (id: number, title: string, date: string, content: string) => Promise<boolean>;
  deleteNote: (id: number) => Promise<boolean>;
  getImagesByNoteId: (noteId: number) => Promise<Image[]>;
  addImage: (noteId: number, filename: string, fileData: string) => Promise<number>;
  deleteImage: (id: number) => Promise<boolean>;
  getLinksByNoteId: (noteId: number) => Promise<Link[]>;
  addLink: (noteId: number, url: string, title: string) => Promise<number>;
  deleteLink: (id: number) => Promise<boolean>;
  searchNotes: (query: string) => Promise<Note[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
