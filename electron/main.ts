import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
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

function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const sanitized = base.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  return `${Date.now()}-${sanitized}${ext.toLowerCase()}`;
}

function getAttachmentsDir(noteId: number): string {
  const baseDir = isDev 
    ? path.join(process.cwd(), 'data', 'attachments')
    : path.join(app.getPath('userData'), 'attachments');
  return path.join(baseDir, noteId.toString());
}

ipcMain.handle('attachments:pick', async () => {
  if (!mainWindow) return [];
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images and PDFs', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  return result.canceled ? [] : result.filePaths;
});

ipcMain.handle('attachments:add', async (_event, noteId: number, filePaths: string[]) => {
  const attachmentsDir = getAttachmentsDir(noteId);
  
  if (!fs.existsSync(attachmentsDir)) {
    fs.mkdirSync(attachmentsDir, { recursive: true });
  }
  
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.pdf'];
  const maxFileSize = 10 * 1024 * 1024;
  const addedAttachments = [];
  
  for (const sourcePath of filePaths) {
    try {
      const ext = path.extname(sourcePath).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        console.warn(`Skipping file with unsupported extension: ${sourcePath}`);
        continue;
      }
      
      const stats = fs.statSync(sourcePath);
      if (stats.size > maxFileSize) {
        console.warn(`Skipping file larger than 10MB: ${sourcePath}`);
        continue;
      }
      
      const originalName = path.basename(sourcePath);
      const sanitizedFilename = sanitizeFilename(originalName);
      const destPath = path.join(attachmentsDir, sanitizedFilename);
      const relativePath = path.join('attachments', noteId.toString(), sanitizedFilename);
      
      fs.copyFileSync(sourcePath, destPath);
      
      const mimeType = ext === '.pdf' ? 'application/pdf' : `image/${ext.substring(1)}`;
      
      const existingAttachments = queries.getAttachmentsByNoteId(noteId);
      const maxOrder = existingAttachments.length > 0 
        ? Math.max(...existingAttachments.map((a: any) => a.order_index || 0))
        : -1;
      
      const attachment = queries.addAttachment(
        noteId,
        sanitizedFilename,
        relativePath,
        originalName,
        mimeType,
        stats.size,
        maxOrder + 1
      );
      
      addedAttachments.push(attachment);
    } catch (error) {
      console.error(`Failed to add attachment ${sourcePath}:`, error);
    }
  }
  
  return addedAttachments;
});

ipcMain.handle('attachments:get', async (_event, noteId: number) => {
  return queries.getAttachmentsByNoteId(noteId);
});

ipcMain.handle('attachments:delete', async (_event, id: number) => {
  const attachment = queries.getAttachmentById(id);
  if (attachment) {
    const baseDir = isDev 
      ? path.join(process.cwd(), 'data')
      : app.getPath('userData');
    const fullPath = path.join(baseDir, attachment.filepath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
  
  queries.deleteAttachment(id);
  return true;
});

ipcMain.handle('attachments:reorder', async (_event, noteId: number, orderedIds: number[]) => {
  queries.reorderAttachments(noteId, orderedIds);
  return true;
});

ipcMain.handle('attachments:open', async (_event, filepath: string) => {
  const baseDir = isDev 
    ? path.join(process.cwd(), 'data')
    : app.getPath('userData');
  const fullPath = path.join(baseDir, filepath);
  
  if (fs.existsSync(fullPath)) {
    await shell.openPath(fullPath);
    return true;
  }
  
  return false;
});

ipcMain.handle('delete-note', async (_event, id: number) => {
  const attachmentsDir = getAttachmentsDir(id);
  if (fs.existsSync(attachmentsDir)) {
    fs.rmSync(attachmentsDir, { recursive: true, force: true });
  }
  
  queries.deleteNote(id);
  return true;
});
