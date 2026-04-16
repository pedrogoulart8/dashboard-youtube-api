import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '../StatCard'
import { Users } from 'lucide-react'

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Subscribers" value="1.2M" />)
    expect(screen.getByText('Subscribers')).toBeInTheDocument()
    expect(screen.getByText('1.2M')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(<StatCard label="Subscribers" value="1.2M" icon={Users} />)
    // lucide renders an svg
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies accent styles when accent prop is true', () => {
    const { container } = render(<StatCard label="Engagement" value="3.4%" icon={Users} accent />)
    // accent icon wrapper has a different background class
    const iconWrapper = container.querySelector('[class*="bg-accent"]')
    expect(iconWrapper).toBeInTheDocument()
  })

  it('renders numeric value as string', () => {
    render(<StatCard label="Videos" value={42} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })
})
