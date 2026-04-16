import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorMessage from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('renders the error message', () => {
    render(<ErrorMessage message="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders with role alert', () => {
    render(<ErrorMessage message="API quota exceeded" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
