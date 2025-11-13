import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { initDatabase, closeDatabase } from '../src/database/init';
import * as queries from '../src/database/queries';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});

ipcMain.handle('verify-password', async (_event, password: string) => {
  return queries.verifyPassword(password);
});

ipcMain.handle('get-all-countries', async () => {
  return queries.getAllCountries();
});

ipcMain.handle('get-country-by-id', async (_event, id: number) => {
  return queries.getCountryById(id);
});

ipcMain.handle('get-notes-by-country', async (_event, countryId: number) => {
  return queries.getNotesByCountry(countryId);
});

ipcMain.handle('get-notes-by-country-and-date', async (_event, countryId: number, date: string) => {
  return queries.getNotesByCountryAndDate(countryId, date);
});

ipcMain.handle('get-note-by-id', async (_event, id: number) => {
  return queries.getNoteById(id);
});

ipcMain.handle('create-note', async (_event, countryId: number, title: string, date: string, content: string) => {
  return queries.createNote(countryId, title, date, content);
});

ipcMain.handle('update-note', async (_event, id: number, title: string, date: string, content: string) => {
  queries.updateNote(id, title, date, content);
  return true;
});

ipcMain.handle('delete-note', async (_event, id: number) => {
  queries.deleteNote(id);
  return true;
});

ipcMain.handle('get-images-by-note-id', async (_event, noteId: number) => {
  return queries.getImagesByNoteId(noteId);
});

ipcMain.handle('add-image', async (_event, noteId: number, filename: string, fileData: string) => {
  const uploadsDir = isDev 
    ? path.join(process.cwd(), 'uploads')
    : path.join(app.getPath('userData'), 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(fileData, 'base64');
  fs.writeFileSync(filepath, buffer);

  return queries.addImage(noteId, filename, filepath);
});

ipcMain.handle('delete-image', async (_event, id: number) => {
  queries.deleteImage(id);
  return true;
});

ipcMain.handle('get-links-by-note-id', async (_event, noteId: number) => {
  return queries.getLinksByNoteId(noteId);
});

ipcMain.handle('add-link', async (_event, noteId: number, url: string, title: string) => {
  return queries.addLink(noteId, url, title);
});

ipcMain.handle('delete-link', async (_event, id: number) => {
  queries.deleteLink(id);
  return true;
});

ipcMain.handle('search-notes', async (_event, query: string) => {
  return queries.searchNotes(query);
});
