import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
})

interface RemixResult {
  content: string;
  error?: string;
}

export async function remixContent(text: string, prompt: string): Promise<RemixResult> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\n${text}`
        }
      ]
    })

    const remixedContent = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Unexpected response format'
    
    console.log('API Response:', remixedContent)
    return { content: remixedContent }
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.status,
      type: error.type,
      fullError: error
    })
    return { 
      content: '',
      error: error.message || 'Unknown error'
    }
  }
}

// Predefined remix functions with specific prompts
export function remixBlogToTweets(text: string) {
  return remixContent(text, 'You are a social media expert and ghostwriter. You work for a popular blogger and your job is to take their blog post and come up with a variety of tweets to share ideas from the blog post. Since you are a ghostwriter, make sure to follow the style, tone and voice of the blog post as closely as possible. Remember tweets cannot be longer than 280 characters. Please return the tweets in a list format, with each tweet on a new line, and be sure to include at least 5 tweets. Do not use hashtags or emojis. Here is the blog post:')
}

export function remixFormal(text: string) {
  return remixContent(text, 'Please rewrite the following text in a more formal and professional tone while maintaining its core message:')
}

export function remixCasual(text: string) {
  return remixContent(text, 'Please rewrite the following text in a more casual and conversational tone while maintaining its core message:')
} 