import { useState, useEffect, useRef } from 'react'
import { remixContent } from './services/remixService'
import { saveTweet, getSavedTweets, deleteSavedTweet } from './services/savedTweetsService'
import type { SavedTweet } from './services/supabaseClient'

function App() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [tweets, setTweets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRemix, setSelectedRemix] = useState('tweets')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [savedTweets, setSavedTweets] = useState<SavedTweet[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const outputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.style.height = 'auto';
      outputRef.current.style.height = outputRef.current.scrollHeight + 'px';
    }
  }, [outputText]);

  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedIndex])

  useEffect(() => {
    loadSavedTweets()
  }, [])

  const loadSavedTweets = async () => {
    const tweets = await getSavedTweets()
    setSavedTweets(tweets)
  }

  const handleSaveTweet = async (tweet: string) => {
    const savedTweet = await saveTweet(tweet)
    if (savedTweet) {
      setSavedTweets(prev => [savedTweet, ...prev])
    }
  }

  const handleDeleteSavedTweet = async (id: number) => {
    const success = await deleteSavedTweet(id)
    if (success) {
      setSavedTweets(prev => prev.filter(tweet => tweet.id !== id))
    }
  }

  const handleCopyTweet = async (tweet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(tweet)
      setCopiedIndex(index)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleTweetClick = (tweet: string) => {
    const tweetText = encodeURIComponent(tweet)
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank')
  }

  const getPromptForType = (type: string) => {
    switch(type) {
      case 'tweets':
        return 'You are a social media expert and ghostwriter. You work for a popular blogger and your job is to take their blog post and come up with a variety of tweets to share ideas from the blog post. Since you are a ghostwriter, make sure to follow the style, tone and voice of the blog post as closely as possible. Remember tweets cannot be longer than 280 characters. Return exactly 5 tweets, with each tweet separated by |||. Do not use hashtags or emojis. Do not number the tweets or add any additional formatting. Here is the blog post:'
      case 'formal':
        return 'Please rewrite the following text in a more formal and professional tone while maintaining its core message:'
      case 'casual':
        return 'Please rewrite the following text in a more casual and conversational tone while maintaining its core message:'
      default:
        return 'Please remix the following text:'
    }
  }

  const handleRemix = async () => {
    if (!inputText.trim()) return
    
    setIsLoading(true)
    try {
      const prompt = getPromptForType(selectedRemix)
      const result = await remixContent(inputText, prompt)
      
      if (result.error) {
        setOutputText(`Error occurred while remixing content: ${result.error}`)
        setTweets([])
      } else {
        if (selectedRemix === 'tweets') {
          console.log('Raw content:', result.content) // Debug log
          const separatedTweets = result.content.split('|||').map(tweet => tweet.trim()).filter(tweet => tweet.length > 0)
          console.log('Separated tweets:', separatedTweets) // Debug log
          if (separatedTweets.length === 0) {
            setOutputText('No valid tweets were generated. Please try again.')
          } else {
            setTweets(separatedTweets)
            setOutputText('')
          }
        } else {
          setOutputText(result.content)
          setTweets([])
        }
      }
    } catch (error) {
      console.error('Error in handleRemix:', error)
      setOutputText('An unexpected error occurred. Please try again.')
      setTweets([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 antialiased">
      <div className="flex">
        <div className="flex-1 max-w-3xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Content Remixer
            </h1>
            <p className="text-lg text-gray-600">Transform your text into something creative and unique</p>
          </div>
          
          <div className="space-y-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="space-y-3">
              <label htmlFor="input" className="block text-base font-semibold text-gray-700">
                Input Text
              </label>
              <textarea
                id="input"
                className="w-full h-40 p-4 text-gray-700 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out shadow-sm resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here to remix..."
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="remixType" className="block text-base font-semibold text-gray-700">
                Remix Type
              </label>
              <select
                id="remixType"
                value={selectedRemix}
                onChange={(e) => setSelectedRemix(e.target.value)}
                className="w-full p-4 text-gray-700 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out shadow-sm appearance-none bg-[length:24px] bg-[center_right_1rem] bg-no-repeat hover:border-indigo-400"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                }}
              >
                <option value="tweets">Blog to Tweets</option>
                <option value="formal">Formal Tone</option>
                <option value="casual">Casual Tone</option>
              </select>
            </div>

            <button
              onClick={handleRemix}
              disabled={isLoading || !inputText.trim()}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-indigo-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Remixing...
                </span>
              ) : 'Remix Content'}
            </button>

            <div className="space-y-3">
              <label htmlFor="output" className="block text-base font-semibold text-gray-700">
                {selectedRemix === 'tweets' ? 'Generated Tweets' : 'Remixed Output'}
              </label>
              {selectedRemix === 'tweets' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tweets.map((tweet, index) => (
                    <div 
                      key={index}
                      className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
                    >
                      <div className="flex-grow mb-3">
                        {tweet}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">
                          {280 - tweet.length} characters remaining
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveTweet(tweet)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                            </svg>
                            Save
                          </button>
                          <button
                            onClick={() => handleTweetClick(tweet)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#1DA1F2] bg-[#1DA1F2]/10 rounded-lg hover:bg-[#1DA1F2]/20 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            Tweet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <textarea
                  id="output"
                  className="w-full h-40 p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out shadow-sm resize-none"
                  value={outputText}
                  readOnly
                  placeholder="Remixed content will appear here..."
                  ref={outputRef}
                />
              )}
            </div>
          </div>
        </div>

        <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Saved Tweets</h2>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"} />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {savedTweets.map((tweet) => (
                <div key={tweet.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <p className="text-gray-800 mb-3">{tweet.content}</p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleTweetClick(tweet.content)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#1DA1F2] bg-[#1DA1F2]/10 rounded-lg hover:bg-[#1DA1F2]/20 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Tweet
                    </button>
                    <button
                      onClick={() => handleDeleteSavedTweet(tweet.id)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
