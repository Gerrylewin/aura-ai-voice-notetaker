
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { usePostHog } from "@/hooks/usePostHog";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { ThirdwebProvider } from "@/providers/ThirdwebProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Stories from "./pages/Stories";
import Discover from "./pages/Discover";
import Library from "./pages/Library";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Upload from "./pages/Upload";
import Write from "./pages/Write";
import BookReader from "./pages/BookReader";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import AuthorProfile from "./pages/AuthorProfile";
import Support from "./pages/Support";
import SupportForm from "./pages/SupportForm";
import ReleaseNotes from "./pages/ReleaseNotes";
import Onboarding from "./pages/Onboarding";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import PurchaseSuccess from "./pages/PurchaseSuccess";
import TipSuccess from "./pages/TipSuccess";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CryptoPublishing from "./pages/CryptoPublishing";
import NotFound from "./pages/NotFound";

function App() {
  usePostHog();

  return (
    <BrowserRouter>
      <ReactQueryProvider>
        <ThirdwebProvider>
          <ThemeProvider>
            <TooltipProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/write" element={<Write />} />
                  <Route path="/read/:bookId" element={<BookReader />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/author/:authorId" element={<AuthorProfile />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/support/contact" element={<SupportForm />} />
                  <Route path="/release-notes" element={<ReleaseNotes />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                  <Route path="/purchase-success" element={<PurchaseSuccess />} />
                  <Route path="/tip-success" element={<TipSuccess />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/crypto-publishing" element={<CryptoPublishing />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </ThemeProvider>
        </ThirdwebProvider>
      </ReactQueryProvider>
    </BrowserRouter>
  );
}

export default App;
