import { supabase } from './services/supabaseClient.ts'

async function testSupabase() {
  console.log('Testing Supabase connection...')

  // Test inserting a tweet
  const { data: insertData, error: insertError } = await supabase
    .from('saved_tweets')
    .insert([{ content: 'Test tweet from CLI' }])
    .select()

  if (insertError) {
    console.error('Error inserting:', insertError)
    return
  }
  console.log('Successfully inserted test tweet:', insertData)

  // Test retrieving tweets
  const { data: tweets, error: selectError } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (selectError) {
    console.error('Error selecting:', selectError)
    return
  }
  console.log('Latest 5 tweets:', tweets)
}

testSupabase() 