import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  defaultValue?: string
  buttonLabel?: string
  autoFocus?: boolean
}

export default function SearchBar({ placeholder = 'Buscar…', onSearch, defaultValue = '', buttonLabel = 'Buscar', autoFocus = false }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-primary placeholder:text-subtle focus:outline-none focus:ring-1 focus:ring-white/20 transition"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition"
      >
        {buttonLabel}
      </button>
    </form>
  )
}
