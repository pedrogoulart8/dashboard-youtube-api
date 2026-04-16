import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  it('renders input and button', () => {
    render(<SearchBar onSearch={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('uses custom placeholder', () => {
    render(<SearchBar placeholder="Find a channel…" onSearch={vi.fn()} />)
    expect(screen.getByPlaceholderText('Find a channel…')).toBeInTheDocument()
  })

  it('calls onSearch with trimmed value on submit', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    await userEvent.type(screen.getByRole('textbox'), '  fireship  ')
    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).toHaveBeenCalledOnce()
    expect(onSearch).toHaveBeenCalledWith('fireship')
  })

  it('does not call onSearch when input is blank', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    await userEvent.click(screen.getByRole('button', { name: /search/i }))

    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch on Enter key', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    await userEvent.type(screen.getByRole('textbox'), 'mkbhd{Enter}')

    expect(onSearch).toHaveBeenCalledWith('mkbhd')
  })

  it('renders with defaultValue', () => {
    render(<SearchBar defaultValue="react" onSearch={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('react')
  })
})
