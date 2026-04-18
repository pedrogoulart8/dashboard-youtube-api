import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Menu, Youtube } from 'lucide-react'
import Sidebar from './components/Sidebar'
import ChannelAnalysis from './pages/ChannelAnalysis'
import VideoSearch from './pages/VideoSearch'
import Trending from './pages/Trending'
import ChannelCompare from './pages/ChannelCompare'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-subtle hover:text-primary transition"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <Youtube size={18} className="text-accent" />
            <span className="font-semibold text-sm tracking-tight">YouTube Insights</span>
          </header>

          <main className="flex-1 overflow-y-auto bg-bg">
            <Routes>
              <Route path="/" element={<Navigate to="/channel" replace />} />
              <Route path="/channel" element={<ChannelAnalysis />} />
              <Route path="/search" element={<VideoSearch />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/compare" element={<ChannelCompare />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
