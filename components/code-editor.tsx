"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, language = "javascript", readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<number[]>([])

  useEffect(() => {
    const lines = value.split("\n").length
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = editorRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const newValue = value.substring(0, start) + "\t" + value.substring(end)
        onChange(newValue)

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        }, 0)
      }
    }
  }

  return (
    <div className="flex h-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Line Numbers */}
      <div className="bg-slate-950 border-r border-slate-700 p-4 text-right text-slate-500 font-mono text-sm select-none overflow-hidden">
        {lineNumbers.map((num) => (
          <div key={num} className="h-6">
            {num}
          </div>
        ))}
      </div>

      {/* Editor */}
      <textarea
        ref={editorRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-slate-900 text-slate-100 placeholder:text-slate-600"
        placeholder="Start typing..."
        spellCheck="false"
      />
    </div>
  )
}
