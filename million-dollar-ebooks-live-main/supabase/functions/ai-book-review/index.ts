
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch book details
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      throw new Error('Book not found');
    }

    // Prepare content for AI analysis
    const analysisPrompt = `
Please provide a comprehensive review of this book submission for publication approval. Analyze the following aspects:

BOOK DETAILS:
Title: ${book.title}
Author: ${book.author_name}
Genre: ${book.genre}
Description: ${book.description}
Content: ${book.content?.substring(0, 3000)}... [truncated for analysis]

REVIEW CRITERIA:
1. CONTENT QUALITY (1-10): Writing quality, grammar, coherence, structure
2. APPROPRIATENESS (1-10): Content suitable for platform, no harmful material
3. ORIGINALITY (1-10): Uniqueness, creativity, not plagiarized
4. MARKETABILITY (1-10): Potential reader interest, commercial viability
5. TECHNICAL QUALITY (1-10): Formatting, readability, professional presentation

Please provide:
- Overall Score (1-10)
- Detailed analysis for each criterion
- Specific strengths and weaknesses
- Recommendation (APPROVE/REJECT/NEEDS_REVISION)
- Specific feedback for author if revision needed
- Any red flags or concerns

Format your response as JSON with the following structure:
{
  "overallScore": number,
  "recommendation": "APPROVE" | "REJECT" | "NEEDS_REVISION",
  "contentQuality": { "score": number, "analysis": "string" },
  "appropriateness": { "score": number, "analysis": "string" },
  "originality": { "score": number, "analysis": "string" },
  "marketability": { "score": number, "analysis": "string" },
  "technicalQuality": { "score": number, "analysis": "string" },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "concerns": ["string"],
  "authorFeedback": "string",
  "adminNotes": "string"
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert book editor and publishing consultant. Provide thorough, professional analysis of book submissions.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    const aiData = await response.json();
    const aiReview = JSON.parse(aiData.choices[0].message.content);

    // Store the AI review in the database
    const { error: reviewError } = await supabase
      .from('book_reviews')
      .upsert({
        book_id: bookId,
        ai_analysis: aiReview,
        status: 'pending_admin_review',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (reviewError) {
      console.error('Error storing review:', reviewError);
    }

    return new Response(
      JSON.stringify({ success: true, review: aiReview }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI book review:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
