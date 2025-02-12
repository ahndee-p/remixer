import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrtwovaaiwbotribqihk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydHdvdmFhaXdib3RyaWJxaWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNTUyMjMsImV4cCI6MjA1NDkzMTIyM30.NCYrexf8eBzgDRDxSfEW8Ryz76Eny4zkqOrrruBjZf4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDB() {
  console.log('Testing database connection...')
  
  // Try to insert a test tweet
  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([{ content: 'Test tweet from CLI' }])
    .select()

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Successfully inserted:', data)
  }

  // Fetch recent tweets
  const { data: tweets, error: fetchError } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (fetchError) {
    console.error('Error fetching tweets:', fetchError)
  } else {
    console.log('Recent tweets:', tweets)
  }
}

testDB() 