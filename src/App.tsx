import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import Interdisciplinary from './pages/Interdisciplinary';
import TopicSelection from './pages/TopicSelection';
import SearchResources from './pages/SearchResources';
import TextOutput from './pages/TextOutput';
import InfoOutput from './pages/InfoOutput';
import Poetry from './pages/Poetry';
import News from './pages/News';

function App() {
  return (
    <TooltipProvider>
      <Toaster position="bottom-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/poetry" element={<Poetry />} />
          <Route path="/interdisciplinary" element={<Interdisciplinary />} />
          <Route path="/interdisciplinary/topic" element={<TopicSelection />} />
          <Route path="/interdisciplinary/search" element={<SearchResources />} />
          <Route path="/interdisciplinary/text" element={<TextOutput />} />
          <Route path="/interdisciplinary/info" element={<InfoOutput />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
