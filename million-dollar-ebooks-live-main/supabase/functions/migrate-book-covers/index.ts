
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Starting automatic book cover migration process...')

    // This function now handles automatic migration for individual books
    const body = await req.json().catch(() => ({}))
    const { bookId, coverImageUrl } = body

    if (bookId && coverImageUrl && coverImageUrl.includes('/avatars/')) {
      console.log(`🔄 Migrating cover for book ${bookId} from avatars to book-covers bucket`)
      
      try {
        // Extract filename from current URL
        const urlParts = coverImageUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Extract the file path from avatars bucket
        const avatarPath = coverImageUrl.split('/avatars/')[1]
        
        if (!avatarPath) {
          throw new Error(`Could not extract path from URL: ${coverImageUrl}`)
        }

        // Download the file from avatars bucket
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from('avatars')
          .download(avatarPath)

        if (downloadError) {
          throw new Error(`Download failed: ${downloadError.message}`)
        }

        // Generate new filename for book-covers bucket
        const newFilename = `cover-${bookId}-${Date.now()}.${filename.split('.').pop()}`

        // Upload to book-covers bucket
        const { error: uploadError } = await supabaseClient.storage
          .from('book-covers')
          .upload(newFilename, fileData, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get the new public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('book-covers')
          .getPublicUrl(newFilename)

        // Update the book record with new URL
        const { error: updateError } = await supabaseClient
          .from('books')
          .update({ cover_image_url: publicUrl })
          .eq('id', bookId)

        if (updateError) {
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        console.log(`✅ Successfully migrated cover for book ${bookId}`)

        return new Response(
          JSON.stringify({
            success: true,
            message: `Cover migrated successfully for book ${bookId}`,
            oldUrl: coverImageUrl,
            newUrl: publicUrl
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )

      } catch (error) {
        console.error(`❌ Error migrating cover for book ${bookId}:`, error)
        return new Response(
          JSON.stringify({
            success: false,
            error: error.message
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }
    }

    // Fallback: Bulk migration for existing books (manual trigger)
    console.log('📚 Running bulk migration for existing books...')

    // Get all books with cover images from avatars bucket
    const { data: books, error: booksError } = await supabaseClient
      .from('books')
      .select('id, cover_image_url, title, author_name')
      .not('cover_image_url', 'is', null)
      .like('cover_image_url', '%/avatars/%')

    if (booksError) {
      console.error('❌ Error fetching books:', booksError)
      throw booksError
    }

    console.log(`📚 Found ${books?.length || 0} books with cover images to migrate`)

    if (!books || books.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No books found with cover images to migrate',
          migrated: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const migrationResults = []

    for (const book of books) {
      try {
        console.log(`🔄 Processing book: ${book.title} (${book.id})`)
        
        // Extract filename from current URL
        const urlParts = book.cover_image_url.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Extract the file path from avatars bucket
        const avatarPath = book.cover_image_url.split('/avatars/')[1]
        
        if (!avatarPath) {
          console.warn(`⚠️ Could not extract path from URL: ${book.cover_image_url}`)
          continue
        }

        // Download the file from avatars bucket
        const { data: fileData, error: downloadError } = await supabaseClient.storage
          .from('avatars')
          .download(avatarPath)

        if (downloadError) {
          console.error(`❌ Error downloading ${avatarPath}:`, downloadError)
          migrationResults.push({
            bookId: book.id,
            title: book.title,
            success: false,
            error: `Download failed: ${downloadError.message}`
          })
          continue
        }

        // Generate new filename for book-covers bucket
        const newFilename = `cover-${book.id}-${Date.now()}.${filename.split('.').pop()}`

        // Upload to book-covers bucket
        const { error: uploadError } = await supabaseClient.storage
          .from('book-covers')
          .upload(newFilename, fileData, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error(`❌ Error uploading ${newFilename}:`, uploadError)
          migrationResults.push({
            bookId: book.id,
            title: book.title,
            success: false,
            error: `Upload failed: ${uploadError.message}`
          })
          continue
        }

        // Get the new public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('book-covers')
          .getPublicUrl(newFilename)

        // Update the book record with new URL
        const { error: updateError } = await supabaseClient
          .from('books')
          .update({ cover_image_url: publicUrl })
          .eq('id', book.id)

        if (updateError) {
          console.error(`❌ Error updating book ${book.id}:`, updateError)
          migrationResults.push({
            bookId: book.id,
            title: book.title,
            success: false,
            error: `Database update failed: ${updateError.message}`
          })
          continue
        }

        console.log(`✅ Successfully migrated cover for: ${book.title}`)
        migrationResults.push({
          bookId: book.id,
          title: book.title,
          success: true,
          oldUrl: book.cover_image_url,
          newUrl: publicUrl
        })

      } catch (error) {
        console.error(`❌ Error processing book ${book.id}:`, error)
        migrationResults.push({
          bookId: book.id,
          title: book.title,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = migrationResults.filter(r => r.success).length
    const failureCount = migrationResults.filter(r => !r.success).length

    console.log(`🎉 Migration completed: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration completed: ${successCount} successful, ${failureCount} failed`,
        migrated: successCount,
        failed: failureCount,
        results: migrationResults
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Migration function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
