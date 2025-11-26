import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Accenture from "./pages/Accenture";
import GameInstructions from "./pages/accenture/GameInstructions";
import GamePlay from "./pages/accenture/GamePlay";
import GameResult from "./pages/accenture/GameResult";
import CommunicationInstructions from "./pages/accenture/CommunicationInstructions";
import CommunicationPlay from "./pages/accenture/CommunicationPlay";
import CommunicationResult from "./pages/accenture/CommunicationResult";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accenture" element={<Accenture />} />
          <Route path="/accenture/game/instructions" element={<GameInstructions />} />
          <Route path="/accenture/game/play" element={<GamePlay />} />
          <Route path="/accenture/game/result" element={<GameResult />} />
          <Route path="/accenture/communication/instructions" element={<CommunicationInstructions />} />
          <Route path="/accenture/communication/play" element={<CommunicationPlay />} />
          <Route path="/accenture/communication/result" element={<CommunicationResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
