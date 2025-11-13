import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import type { Country, Note, Link } from '../types'

interface NoteEditorProps {
  note: Note | null
  country: Country | null
  isCreating: boolean
  onSave: () => void
  onDelete: () => void
  onCancel: () => void
}

export default function NoteEditor({ note, country, isCreating, onSave, onDelete, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [links, setLinks] = useState<Link[]>([])
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [fontSize, setFontSize] = useState('16')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [saving, setSaving] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      Underline,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setDate(note.date)
      editor?.commands.setContent(note.content)
      loadLinks()
    } else if (isCreating) {
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      editor?.commands.setContent('')
      setLinks([])
    }
  }, [note, isCreating])

  const loadLinks = async () => {
    if (note) {
      const data = await window.electronAPI.getLinksByNoteId(note.id)
      setLinks(data)
    }
  }

  const handleSave = async () => {
    if (!country || !title || !date || !editor) return

    setSaving(true)
    try {
      const content = editor.getHTML()

      if (note) {
        await window.electronAPI.updateNote(note.id, title, date, content)
      } else {
        await window.electronAPI.createNote(country.id, title, date, content)
      }

      onSave()
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!note) return

    if (confirm('Are you sure you want to delete this note?')) {
      await window.electronAPI.deleteNote(note.id)
      onDelete()
    }
  }

  const handleAddLink = async () => {
    if (!note || !newLinkUrl || !newLinkTitle) return

    await window.electronAPI.addLink(note.id, newLinkUrl, newLinkTitle)
    setNewLinkUrl('')
    setNewLinkTitle('')
    loadLinks()
  }

  const handleDeleteLink = async (linkId: number) => {
    await window.electronAPI.deleteLink(linkId)
    loadLinks()
  }

  const applyFontSize = () => {
    if (editor) {
      editor.chain().focus().setMark('textStyle', { fontSize: `${fontSize}px` }).run()
    }
  }

  const applyFontFamily = () => {
    if (editor) {
      editor.chain().focus().setFontFamily(fontFamily).run()
    }
  }

  if (!country && !isCreating) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500">Select a note or create a new one</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {isCreating ? 'New Note' : 'Edit Note'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            {note && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !title || !date}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter note title"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-300 bg-gray-50">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded ${editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 hover:bg-blue-100`}
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded ${editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 hover:bg-blue-100`}
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 rounded ${editor?.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 hover:bg-blue-100`}
          >
            <u>U</u>
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 hover:bg-blue-100`}
          >
            • List
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 hover:bg-blue-100`}
          >
            1. List
          </button>

          <div className="flex items-center gap-2 ml-4">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
            </select>
            <button
              onClick={applyFontFamily}
              className="px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              Apply Font
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="12">12px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
              <option value="24">24px</option>
              <option value="28">28px</option>
              <option value="32">32px</option>
            </select>
            <button
              onClick={applyFontSize}
              className="px-2 py-1 bg-white text-gray-700 border border-gray-300 rounded text-sm hover:bg-gray-100"
            >
              Apply Size
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <div className="border border-gray-300 rounded-lg min-h-[300px]">
            <EditorContent editor={editor} />
          </div>
        </div>

        {note && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">News Links</h3>
            
            <div className="space-y-2 mb-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex-1"
                  >
                    {link.title}
                  </a>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    className="ml-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <input
                type="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddLink}
                disabled={!newLinkUrl || !newLinkTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Add Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
