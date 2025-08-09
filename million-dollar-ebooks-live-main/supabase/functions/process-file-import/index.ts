import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileImportRequest {
  fileType: 'pdf' | 'epub' | 'txt' | 'docx';
  fileName: string;
  fileContent: string; // Base64 encoded content
  userId: string;
  bookId?: string;
}

interface FileImportResponse {
  success: boolean;
  content?: string;
  title?: string;
  wordCount?: number;
  chapters?: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  images?: Array<{
    originalPath: string;
    blob: string; // Base64 encoded
    mimeType: string;
    fileName: string;
  }>;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { fileType, fileName, fileContent, bookId }: FileImportRequest = await req.json();

    // Create import job for progress tracking
    const { data: importJob, error: jobError } = await supabase
      .from('import_jobs')
      .insert({
        user_id: user.id,
        book_id: bookId,
        import_type: fileType,
        status: 'processing',
        total_steps: 5,
        current_step: `Processing ${fileType.toUpperCase()} file...`
      })
      .select()
      .single();

    if (jobError) throw jobError;

    let result: FileImportResponse;

    // Process file based on type
    switch (fileType) {
      case 'pdf':
        result = await processPdfFile(fileContent, fileName, importJob.id, supabase);
        break;
      case 'epub':
        result = await processEpubFile(fileContent, fileName, importJob.id, supabase);
        break;
      case 'txt':
        result = await processTxtFile(fileContent, fileName, importJob.id, supabase);
        break;
      case 'docx':
        result = await processDocxFile(fileContent, fileName, importJob.id, supabase);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Update import job as completed
    await supabase.rpc('complete_import_job', {
      job_id: importJob.id,
      success: result.success,
      error_msg: result.error
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-file-import:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processPdfFile(fileContent: string, fileName: string, jobId: string, supabase: any): Promise<FileImportResponse> {
  try {
    // Update progress
    await updateProgress(jobId, 20, 'Extracting PDF content...', supabase);

    // Decode base64 content
    const fileBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    
    // Use pdf-parse library (you'll need to add this dependency)
    // For now, we'll return a placeholder implementation
    const content = `PDF content extracted from ${fileName}\n\nThis is a placeholder for PDF processing. The actual implementation would use a PDF parsing library to extract text content.`;
    
    await updateProgress(jobId, 100, 'PDF processing completed', supabase);

    return {
      success: true,
      content,
      title: fileName.replace(/\.pdf$/i, ''),
      wordCount: content.split(/\s+/).length,
      chapters: [{
        title: 'Chapter 1',
        content,
        order: 1
      }]
    };
  } catch (error) {
    throw new Error(`PDF processing failed: ${error.message}`);
  }
}

async function processEpubFile(fileContent: string, fileName: string, jobId: string, supabase: any): Promise<FileImportResponse> {
  try {
    await updateProgress(jobId, 20, 'Extracting EPUB content...', supabase);

    // Decode base64 content
    const fileBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    
    // EPUB processing would use JSZip to extract and parse the EPUB structure
    // For now, return a placeholder implementation
    const content = `EPUB content extracted from ${fileName}\n\nThis is a placeholder for EPUB processing. The actual implementation would use JSZip to extract the EPUB contents and parse the OPF file.`;
    
    await updateProgress(jobId, 100, 'EPUB processing completed', supabase);

    return {
      success: true,
      content,
      title: fileName.replace(/\.epub$/i, ''),
      wordCount: content.split(/\s+/).length,
      chapters: [{
        title: 'Chapter 1',
        content,
        order: 1
      }]
    };
  } catch (error) {
    throw new Error(`EPUB processing failed: ${error.message}`);
  }
}

async function processTxtFile(fileContent: string, fileName: string, jobId: string, supabase: any): Promise<FileImportResponse> {
  try {
    await updateProgress(jobId, 20, 'Processing text file...', supabase);

    // Decode base64 content
    const content = atob(fileContent);
    
    await updateProgress(jobId, 100, 'Text processing completed', supabase);

    return {
      success: true,
      content,
      title: fileName.replace(/\.txt$/i, ''),
      wordCount: content.split(/\s+/).length,
      chapters: [{
        title: 'Chapter 1',
        content,
        order: 1
      }]
    };
  } catch (error) {
    throw new Error(`Text processing failed: ${error.message}`);
  }
}

async function processDocxFile(fileContent: string, fileName: string, jobId: string, supabase: any): Promise<FileImportResponse> {
  try {
    await updateProgress(jobId, 20, 'Processing Word document...', supabase);

    // Decode base64 content
    const fileBuffer = Uint8Array.from(atob(fileContent), c => c.charCodeAt(0));
    
    // DOCX processing would use mammoth.js or similar library
    // For now, return a placeholder implementation
    const content = `Word document content extracted from ${fileName}\n\nThis is a placeholder for DOCX processing. The actual implementation would use mammoth.js to extract text and images.`;
    
    await updateProgress(jobId, 100, 'Word processing completed', supabase);

    return {
      success: true,
      content,
      title: fileName.replace(/\.(docx|doc)$/i, ''),
      wordCount: content.split(/\s+/).length,
      chapters: [{
        title: 'Chapter 1',
        content,
        order: 1
      }]
    };
  } catch (error) {
    throw new Error(`Word processing failed: ${error.message}`);
  }
}

async function updateProgress(jobId: string, progress: number, step: string, supabase: any) {
  await supabase.rpc('update_import_progress', {
    job_id: jobId,
    new_progress: progress,
    new_step: step,
    increment_completed_steps: true
  });
}
