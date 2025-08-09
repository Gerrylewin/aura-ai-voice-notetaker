
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleDocument {
  id: string;
  name: string;
  modifiedTime: string;
}

export function useGoogleDocsAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<GoogleDocument[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGoogleAuth = async () => {
    // Get the client ID from the edge function which has access to secrets
    const { data: configData } = await supabase.functions.invoke('google-docs-import', {
      body: { action: 'get_config' }
    });

    if (!configData?.clientId) {
      toast({
        title: "Configuration Error",
        description: "Google Client ID not configured",
        variant: "destructive"
      });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${configData.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_type=code&` +
      `access_type=offline`;

    console.log('Auth URL:', authUrl);
    console.log('Redirect URI:', redirectUri);

    // Open popup for OAuth
    const popup = window.open(authUrl, 'google-auth', 'width=500,height=600');
    
    // Listen for the callback
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup?.close();
        await exchangeCodeForToken(event.data.code, redirectUri);
      }
    };

    window.addEventListener('message', handleMessage);
    
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const exchangeCodeForToken = async (code: string, redirectUri: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-docs-import', {
        body: { action: 'exchange_code', code, redirectUri }
      });

      if (error) throw error;

      if (data.access_token) {
        setAccessToken(data.access_token);
        await loadDocuments(data.access_token);
      } else {
        throw new Error('Failed to get access token');
      }
    } catch (error) {
      console.error('Error exchanging code:', error);
      toast({
        title: "Authentication Failed",
        description: "Failed to authenticate with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-docs-import', {
        body: { action: 'list_documents', accessToken: token }
      });

      if (error) throw error;

      setDocuments(data.files || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load Google Docs",
        variant: "destructive"
      });
    }
  };

  const resetAuth = () => {
    setAccessToken(null);
    setDocuments([]);
  };

  return {
    isLoading,
    documents,
    accessToken,
    handleGoogleAuth,
    resetAuth,
    setIsLoading
  };
}
