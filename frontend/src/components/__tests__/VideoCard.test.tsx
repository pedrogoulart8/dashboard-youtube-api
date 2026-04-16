import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import VideoCard from '../VideoCard'
import type { VideoItem } from '@shared/types'

const mockVideo: VideoItem = {
  id: 'abc123',
  title: 'How to Build a Dashboard',
  description: 'A great tutorial',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  channelId: 'ch1',
  channelTitle: 'Fireship',
  publishedAt: '2024-01-15T10:00:00Z',
  viewCount: 1_250_000,
  likeCount: 45_000,
  commentCount: 3_200,
  duration: 'PT8M30S',
}

describe('VideoCard', () => {
  it('renders video title', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByText('How to Build a Dashboard')).toBeInTheDocument()
  })

  it('renders channel name', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByText('Fireship')).toBeInTheDocument()
  })

  it('renders thumbnail with lazy loading', () => {
    render(<VideoCard video={mockVideo} />)
    const img = screen.getByAltText('How to Build a Dashboard')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('src', 'https://example.com/thumb.jpg')
  })

  it('renders formatted view count', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.getByText('1.3M')).toBeInTheDocument()
  })

  it('renders rank badge when rank prop is provided', () => {
    render(<VideoCard video={mockVideo} rank={3} />)
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('does not render rank badge when rank is not provided', () => {
    render(<VideoCard video={mockVideo} />)
    expect(screen.queryByText(/#\d/)).not.toBeInTheDocument()
  })
})
