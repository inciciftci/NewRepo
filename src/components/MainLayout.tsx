import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import NotesList from './NotesList'
import NoteEditor from './NoteEditor'
import type { Country, Note } from '../types'

export default function MainLayout() {
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isCreatingNote, setIsCreatingNote] = useState(false)

  useEffect(() => {
    loadCountries()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      loadNotes()
    }
  }, [selectedCountry, selectedDate])

  const loadCountries = async () => {
    const data = await window.electronAPI.getAllCountries()
    setCountries(data)
  }

  const loadNotes = async () => {
    if (!selectedCountry) return

    let data: Note[]
    if (selectedDate) {
      data = await window.electronAPI.getNotesByCountryAndDate(selectedCountry.id, selectedDate)
    } else {
      data = await window.electronAPI.getNotesByCountry(selectedCountry.id)
    }
    setNotes(data)
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setSelectedNote(null)
    setIsCreatingNote(false)
    setSelectedDate('')
  }

  const handleDateFilter = (date: string) => {
    setSelectedDate(date)
  }

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note)
    setIsCreatingNote(false)
  }

  const handleCreateNote = () => {
    setSelectedNote(null)
    setIsCreatingNote(true)
  }

  const handleNoteSaved = () => {
    loadNotes()
    setIsCreatingNote(false)
  }

  const handleNoteDeleted = () => {
    setSelectedNote(null)
    setIsCreatingNote(false)
    loadNotes()
  }

  return (
    <div className="h-full w-full flex">
      <Sidebar
        countries={countries}
        selectedCountry={selectedCountry}
        onCountrySelect={handleCountrySelect}
      />
      
      <NotesList
        notes={notes}
        selectedNote={selectedNote}
        selectedCountry={selectedCountry}
        selectedDate={selectedDate}
        onNoteSelect={handleNoteSelect}
        onCreateNote={handleCreateNote}
        onDateFilter={handleDateFilter}
      />

      <NoteEditor
        note={selectedNote}
        country={selectedCountry}
        isCreating={isCreatingNote}
        onSave={handleNoteSaved}
        onDelete={handleNoteDeleted}
        onCancel={() => {
          setSelectedNote(null)
          setIsCreatingNote(false)
        }}
      />
    </div>
  )
}
