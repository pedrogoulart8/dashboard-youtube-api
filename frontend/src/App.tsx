import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ChannelAnalysis from './pages/ChannelAnalysis'
import VideoSearch from './pages/VideoSearch'
import Trending from './pages/Trending'
import ChannelCompare from './pages/ChannelCompare'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
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
    </BrowserRouter>
  )
}
