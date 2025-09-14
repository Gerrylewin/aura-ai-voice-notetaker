
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, documentId, accessToken, redirectUri } = await req.json();

    switch (action) {
      case 'get_config':
        return getConfig();
      case 'exchange_code':
        return await exchangeCodeForToken(code, redirectUri);
      case 'list_documents':
        return await listDocuments(accessToken);
      case 'import_document':
        return await importDocument(documentId, accessToken);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in google-docs-import function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getConfig() {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  
  return new Response(JSON.stringify({ clientId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  console.log('Exchange code for token with redirect URI:', redirectUri);
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Token exchange error:', data);
  }
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listDocuments(accessToken: string) {
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.document"&fields=files(id,name,modifiedTime)',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function importDocument(documentId: string, accessToken: string) {
  // Get document content
  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );

  const document = await response.json();
  
  // Extract text content from Google Docs structure
  let content = '';
  if (document.body && document.body.content) {
    content = extractTextFromDocumentContent(document.body.content);
  }

  return new Response(JSON.stringify({
    title: document.title || 'Untitled Document',
    content,
    originalDocument: document
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractTextFromDocumentContent(content: any[]): string {
  let text = '';
  
  for (const element of content) {
    if (element.paragraph) {
      for (const textElement of element.paragraph.elements || []) {
        if (textElement.textRun) {
          text += textElement.textRun.content;
        }
      }
    } else if (element.table) {
      // Handle table content
      for (const row of element.table.tableRows || []) {
        for (const cell of row.tableCells || []) {
          text += extractTextFromDocumentContent(cell.content || []);
        }
      }
    }
  }
  
  return text;
}
