import { supabase } from './supabaseClient'
import type { SavedTweet } from './supabaseClient'

export const saveTweet = async (content: string): Promise<SavedTweet | null> => {
  const { data, error } = await supabase
    .from('saved_tweets')
    .insert([{ content }])
    .select()
    .single()

  if (error) {
    console.error('Error saving tweet:', error)
    return null
  }

  return data
}

export const getSavedTweets = async (): Promise<SavedTweet[]> => {
  const { data, error } = await supabase
    .from('saved_tweets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching saved tweets:', error)
    return []
  }

  return data || []
}

export const deleteSavedTweet = async (id: number): Promise<boolean> => {
  const { error } = await supabase
    .from('saved_tweets')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting tweet:', error)
    return false
  }

  return true
} 