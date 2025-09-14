
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
import { Layout } from "@/components/layout/Layout";
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
                  <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/stories" element={<Layout><Stories /></Layout>} />
                  <Route path="/discover" element={<Layout><Discover /></Layout>} />
                  <Route path="/library" element={<Layout><Library /></Layout>} />
                  <Route path="/settings" element={<Layout><Settings /></Layout>} />
                  <Route path="/chat" element={<Layout><Chat /></Layout>} />
                  <Route path="/upload" element={<Layout><Upload /></Layout>} />
                  <Route path="/write" element={<Layout><Write /></Layout>} />
                  <Route path="/read/:bookId" element={<BookReader />} />
                  <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                  <Route path="/admin" element={<Layout><Admin /></Layout>} />
                  <Route path="/author/:authorId" element={<Layout><AuthorProfile /></Layout>} />
                  <Route path="/support" element={<Layout><Support /></Layout>} />
                  <Route path="/support/contact" element={<Layout><SupportForm /></Layout>} />
                  <Route path="/release-notes" element={<Layout><ReleaseNotes /></Layout>} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                  <Route path="/purchase-success" element={<Layout><PurchaseSuccess /></Layout>} />
                  <Route path="/tip-success" element={<Layout><TipSuccess /></Layout>} />
                  <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
                  <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
                  <Route path="/crypto-publishing" element={<Layout><CryptoPublishing /></Layout>} />
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
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
