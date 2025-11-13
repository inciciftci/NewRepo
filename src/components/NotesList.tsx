import type { Country, Note } from '../types'

interface NotesListProps {
  notes: Note[]
  selectedNote: Note | null
  selectedCountry: Country | null
  selectedDate: string
  onNoteSelect: (note: Note) => void
  onCreateNote: () => void
  onDateFilter: (date: string) => void
}

export default function NotesList({
  notes,
  selectedNote,
  selectedCountry,
  selectedDate,
  onNoteSelect,
  onCreateNote,
  onDateFilter,
}: NotesListProps) {
  const getPreview = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '')
    return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-80 bg-white border-r border-gray-300 flex flex-col h-full">
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            {selectedCountry ? selectedCountry.name : 'Notes'}
          </h2>
          {selectedCountry && (
            <button
              onClick={onCreateNote}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              + New
            </button>
          )}
        </div>

        {selectedCountry && (
          <div>
            <label htmlFor="date-filter" className="block text-xs font-medium text-gray-700 mb-1">
              Filter by date
            </label>
            <input
              type="date"
              id="date-filter"
              value={selectedDate}
              onChange={(e) => onDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            {selectedDate && (
              <button
                onClick={() => onDateFilter('')}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedCountry ? (
          <div className="p-4 text-center text-gray-500">
            <p>Select a country to view notes</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No notes found</p>
            <button
              onClick={onCreateNote}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Create your first note
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onNoteSelect(note)}
              className={`w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                selectedNote?.id === note.id ? 'bg-blue-50 hover:bg-blue-100' : ''
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-1">{note.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{formatDate(note.date)}</p>
              <p className="text-sm text-gray-600">{getPreview(note.content)}</p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
