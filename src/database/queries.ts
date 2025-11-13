import { db } from './init';
import bcrypt from 'bcryptjs';
import type { Country, Note, Image, Link } from '../types';

export function verifyPassword(password: string): boolean {
  const auth = db.prepare('SELECT password_hash FROM auth WHERE id = 1').get() as { password_hash: string } | undefined;
  if (!auth) return false;
  return bcrypt.compareSync(password, auth.password_hash);
}

export function getAllCountries(): Country[] {
  return db.prepare('SELECT * FROM countries ORDER BY name ASC').all() as Country[];
}

export function getCountryById(id: number): Country | undefined {
  return db.prepare('SELECT * FROM countries WHERE id = ?').get(id) as Country | undefined;
}

export function getNotesByCountry(countryId: number): Note[] {
  return db.prepare('SELECT * FROM notes WHERE country_id = ? ORDER BY date DESC, created_at DESC').all(countryId) as Note[];
}

export function getNotesByCountryAndDate(countryId: number, date: string): Note[] {
  return db.prepare('SELECT * FROM notes WHERE country_id = ? AND date = ? ORDER BY created_at DESC').all(countryId, date) as Note[];
}

export function getNoteById(id: number): Note | undefined {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined;
}

export function createNote(countryId: number, title: string, date: string, content: string): number {
  const result = db.prepare('INSERT INTO notes (country_id, title, date, content) VALUES (?, ?, ?, ?)').run(countryId, title, date, content);
  return result.lastInsertRowid as number;
}

export function updateNote(id: number, title: string, date: string, content: string): void {
  db.prepare('UPDATE notes SET title = ?, date = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, date, content, id);
}

export function deleteNote(id: number): void {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id);
}

export function getImagesByNoteId(noteId: number): Image[] {
  return db.prepare('SELECT * FROM images WHERE note_id = ?').all(noteId) as Image[];
}

export function addImage(noteId: number, filename: string, filepath: string): number {
  const result = db.prepare('INSERT INTO images (note_id, filename, filepath) VALUES (?, ?, ?)').run(noteId, filename, filepath);
  return result.lastInsertRowid as number;
}

export function deleteImage(id: number): void {
  db.prepare('DELETE FROM images WHERE id = ?').run(id);
}

export function getLinksByNoteId(noteId: number): Link[] {
  return db.prepare('SELECT * FROM links WHERE note_id = ?').all(noteId) as Link[];
}

export function addLink(noteId: number, url: string, title: string): number {
  const result = db.prepare('INSERT INTO links (note_id, url, title) VALUES (?, ?, ?)').run(noteId, url, title);
  return result.lastInsertRowid as number;
}

export function deleteLink(id: number): void {
  db.prepare('DELETE FROM links WHERE id = ?').run(id);
}

export function searchNotes(query: string): Note[] {
  const searchQuery = `%${query}%`;
  return db.prepare('SELECT * FROM notes WHERE title LIKE ? OR content LIKE ? ORDER BY updated_at DESC').all(searchQuery, searchQuery) as Note[];
}
