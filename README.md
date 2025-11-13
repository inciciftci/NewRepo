# Country Notes - Offline Note-Taking Application

A cross-platform desktop application built with Electron, React, and TypeScript for taking notes about world countries. All data is stored locally using SQLite, making it fully functional offline.

## Features

- **Offline-First**: All data stored locally with SQLite - no internet required
- **Secure Login**: Password-protected access with bcrypt hashing
- **Country-Based Organization**: Browse and filter notes by 195+ world countries
- **Rich Text Editing**: Full-featured editor with formatting options:
  - Bold, italic, underline
  - Bullet and numbered lists
  - Font family and size customization
- **Date Filtering**: Filter notes by country and date
- **Image Attachments**: Attach images to notes (stored locally)
- **News Links**: Add clickable news links to your notes
- **Cross-Platform**: Works on Windows and Linux

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/inciciftci/NewRepo.git
cd NewRepo
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode

To run the application in development mode with hot-reload:

```bash
npm run dev
```

This will:
1. Start the Vite development server for React (port 5173)
2. Launch Electron with the development build

### Default Login Credentials

- **Password**: `admin123`

The password is hashed and stored securely in the local SQLite database.

## Building for Production

### Build for Current Platform

```bash
npm run build
```

### Build for Windows

```bash
npm run build:win
```

This creates an NSIS installer in the `release` directory.

### Build for Linux

```bash
npm run build:linux
```

This creates AppImage and .deb packages in the `release` directory.

## Project Structure

```
NewRepo/
├── electron/              # Electron main process
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # Preload script for IPC
├── src/                  # React application
│   ├── components/       # React components
│   │   ├── Login.tsx     # Login screen
│   │   ├── MainLayout.tsx # Main app layout
│   │   ├── Sidebar.tsx   # Country list sidebar
│   │   ├── NotesList.tsx # Notes list view
│   │   └── NoteEditor.tsx # Rich text note editor
│   ├── database/         # SQLite database
│   │   ├── init.ts       # Database initialization
│   │   └── queries.ts    # Database queries
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Type interfaces
│   ├── styles/           # CSS styles
│   │   └── index.css     # Global styles with Tailwind
│   ├── App.tsx           # Root React component
│   ├── main.tsx          # React entry point
│   └── window.d.ts       # Window type definitions
├── data/                 # SQLite database files
├── uploads/              # Local image storage
├── public/               # Static assets
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript config for React
├── tsconfig.node.json    # TypeScript config for Electron
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## Database Schema

The application uses SQLite with the following tables:

- **auth**: Stores hashed admin password
- **countries**: List of 195+ world countries with codes
- **notes**: Note data (title, date, content, country reference)
- **images**: Image attachments with file paths
- **links**: News links associated with notes

## Development

### Available Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm run build:win` - Build Windows installer
- `npm run build:linux` - Build Linux packages
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Technology Stack

- **Electron**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TipTap**: Rich text editor
- **better-sqlite3**: Synchronous SQLite database
- **bcryptjs**: Password hashing
- **Tailwind CSS**: Utility-first CSS framework

## Usage Guide

### Creating a Note

1. Log in with the admin password
2. Select a country from the left sidebar
3. Click the "+ New" button in the notes list
4. Enter a title and date
5. Write your content using the rich text editor
6. Use the formatting toolbar to style your text
7. Click "Save" to store the note

### Adding Images

Images can be added after creating a note. The image upload feature stores files locally in the `uploads` directory.

### Adding News Links

1. Open an existing note
2. Scroll to the "News Links" section
3. Enter a link title and URL
4. Click "Add Link"
5. Links will be clickable in the note view

### Filtering Notes

- **By Country**: Click a country in the left sidebar
- **By Date**: Use the date picker in the notes list to filter by specific date
- Click "Clear filter" to show all notes for the selected country

## Data Storage

All data is stored locally:
- **Database**: `data/notes.db` (SQLite database)
- **Images**: `uploads/` directory
- **User Data**: In development, stored in project directory; in production, stored in the system's user data directory

## Troubleshooting

### Application won't start

- Ensure all dependencies are installed: `npm install`
- Check that Node.js version is 16 or higher: `node --version`
- Try deleting `node_modules` and reinstalling: `rm -rf node_modules && npm install`

### Database errors

- The database is created automatically on first run
- If corrupted, delete `data/notes.db` and restart the application

### Build errors

- Ensure TypeScript files compile: `npm run build:electron`
- Check that React builds successfully: `npm run build:react`

## License

ISC

## Contributing

This is a private project. For questions or issues, please contact the repository owner.
