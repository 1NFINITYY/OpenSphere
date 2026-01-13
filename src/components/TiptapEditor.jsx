'use client'

import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { PaginationExtension, paginationPluginKey } from './PaginationExtension'

const MenuBar = ({ editor, zoom, setZoom }) => {
  if (!editor) {
    return null
  }

  const buttons = [
    {
      label: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
    },
    {
      label: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
    },
    {
      label: 'Left',
      action: () => editor.chain().focus().setTextAlign('left').run(),
      isActive: editor.isActive({ textAlign: 'left' }),
    },
    {
      label: 'Center',
      action: () => editor.chain().focus().setTextAlign('center').run(),
      isActive: editor.isActive({ textAlign: 'center' }),
    },
    {
      label: 'Right',
      action: () => editor.chain().focus().setTextAlign('right').run(),
      isActive: editor.isActive({ textAlign: 'right' }),
    },
    {
      label: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive('heading', { level: 1 }),
    },
    {
      label: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Paragraph',
      action: () => editor.chain().focus().setParagraph().run(),
      isActive: editor.isActive('paragraph'),
    },
    {
      label: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
    },
    {
      label: 'Table',
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      isActive: editor.can().insertTable(),
    },
  ]

  // State for Table Input
  const [showTableForm, setShowTableForm] = useState(false)
  const [tableDims, setTableDims] = useState({ rows: 3, cols: 3 })

  const insertCustomTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: Math.max(1, tableDims.rows), cols: Math.max(1, tableDims.cols), withHeaderRow: true })
      .run()
    setShowTableForm(false)
  }

  return (
    <div className="flex justify-between items-center p-2 mb-4 bg-white rounded-lg shadow-sm border border-gray-200 sticky top-0 z-50 no-print relative">
      <div className="flex gap-2 flex-wrap items-center">
        {buttons.map((btn, idx) => {
          if (btn.label === 'Table') {
            return (
              <div key={idx} className="relative">
                <button
                  onClick={() => setShowTableForm(!showTableForm)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${showTableForm ? 'bg-gray-200' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {btn.label}
                </button>
                {/* Popover anchored to this button */}
                {showTableForm && (
                  <div className="absolute top-full left-0 mt-2 bg-white p-3 rounded-lg shadow-xl border border-gray-200 z-50 flex gap-2 items-end animate-in fade-in slide-in-from-top-2 w-max">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={tableDims.rows}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setTableDims({ ...tableDims, rows: Math.min(15, val) })
                        }}
                        className="w-16 border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cols</label>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        value={tableDims.cols}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setTableDims({ ...tableDims, cols: Math.min(15, val) })
                        }}
                        className="w-16 border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={insertCustomTable}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Insert
                    </button>
                  </div>
                )}
              </div>
            )
          }

          return (
            <button
              key={idx}
              onClick={btn.action}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${btn.isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {btn.label}
            </button>
          )
        })}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2 border-l pl-4 ml-2">
        <button
          onClick={() => setZoom(prev => Math.max(0.25, prev - 0.1))}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
          title="Zoom Out"
        >
          -
        </button>

        <span className="text-sm font-mono w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={() => setZoom(prev => Math.min(2.0, prev + 0.1))}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
          title="Zoom In"
        >
          +
        </button>
      </div>

      {/* Print Button */}
      <div className="flex items-center gap-2 border-l pl-4 ml-2">
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          title="Print Document"
        >
          Print
        </button>
      </div>
    </div>
  )
}

const TiptapEditor = () => {
  const [totalPages, setTotalPages] = useState(1)
  const [zoom, setZoom] = useState(1.0)

  const [updateTrigger, setUpdateTrigger] = useState(0)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Start typing your document...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      PaginationExtension,
    ],
    editorProps: {
      attributes: {
        class: 'focus:outline-none tiptap',
      },
    },
    content: `
      <h1>Legal Document Draft</h1>
      <p>This is a sample document to demonstrate pagination.</p>
      <p>Start typing or pasting content to see the visual page breaks appear automatically.</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <p>Try copying and pasting this block multiple times to demonstrate the full-page layout.</p>
    `,
    onTransaction: ({ editor }) => {
      // Force re-render for menu state updates
      setUpdateTrigger(prev => prev + 1)

      const pluginState = paginationPluginKey.getState(editor.state)
      if (pluginState && pluginState.pageCount) {
        setTotalPages(pluginState.pageCount)
      }
    },
  })

  // Calculate total height based on pages (US Letter)
  const totalHeight = totalPages * (1056 + 48)

  return (
    <div className="flex flex-col items-center bg-gray-100 min-h-screen py-8 print:bg-white print:py-0">
      <div className="w-full max-w-[1400px] px-4">
        <MenuBar editor={editor} zoom={zoom} setZoom={setZoom} />

        {/* Scrollable Viewport for zoomed content */}
        <div className="w-full overflow-auto flex justify-center bg-gray-100">
          {/* Editor Container - The "Print View" */}
          <div
            className="print-container transition-transform duration-200 ease-out origin-top"
            style={{
              width: '816px', // US Letter Width
              height: `${totalHeight}px`,
              marginTop: '2rem',
              marginBottom: '2rem',
              paddingTop: '96px',
              paddingLeft: '96px',
              paddingRight: '96px',
              paddingBottom: '0',
              transform: `scale(${zoom})`,
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm no-print fixed bottom-4 right-4 bg-white/80 p-2 rounded shadow backdrop-blur">
          <p>
            Pages: {totalPages} • Zoom: {Math.round(zoom * 100)}%
          </p>
        </div>
      </div>
    </div>
  )
}

export default TiptapEditor
