import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Send, Plus, MessageSquare, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'

const AiChat = () => {
  const { user } = useSelector(store => store.auth)
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Fetch user sessions on component mount
  useEffect(() => {
    fetchSessions()
  }, [])

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchSessions = async () => {
    try {
      setSessionLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/sessions`, {
        withCredentials: true
      })
      if (res.data.success) {
        setSessions(res.data.sessions)
        // If there are sessions and no current session is selected, select the most recent one
        if (res.data.sessions.length > 0 && !currentSession) {
          setCurrentSession(res.data.sessions[0])
          setMessages(res.data.sessions[0].messages)
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
      toast.error('Failed to fetch chat sessions')
    } finally {
      setSessionLoading(false)
    }
  }

  const createNewSession = async (sessionType = 'career_advice') => {
    try {
      setSessionLoading(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/sessions`, {
        sessionType
      }, {
        withCredentials: true
      })
      if (res.data.success) {
        // Add the new session to the sessions list
        setSessions([res.data.session, ...sessions])
        // Set the new session as the current session
        setCurrentSession(res.data.session)
        // Set the messages to the new session's messages
        setMessages(res.data.session.messages)
        toast.success('New chat session created')
      }
    } catch (error) {
      console.error('Error creating new session:', error)
      toast.error('Failed to create new chat session')
    } finally {
      setSessionLoading(false)
    }
  }

  const selectSession = (session) => {
    setCurrentSession(session)
    setMessages(session.messages)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || !currentSession) return

    // Optimistically add user message to the UI
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }
    setMessages([...messages, userMessage])
    setInput('')

    try {
      setLoading(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/sessions/${currentSession._id}/messages`, {
        message: input
      }, {
        withCredentials: true
      })
      if (res.data.success) {
        // Add AI response to messages
        const aiMessage = {
          role: 'assistant',
          content: res.data.response,
          timestamp: new Date().toISOString()
        }
        setMessages([...messages, userMessage, aiMessage])
        
        // Update the current session with the new messages
        setCurrentSession({
          ...currentSession,
          messages: [...currentSession.messages, userMessage, aiMessage]
        })
        
        // Update the session in the sessions list
        setSessions(sessions.map(session => 
          session._id === currentSession._id 
            ? { ...session, messages: [...session.messages, userMessage, aiMessage] }
            : session
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSessionTypeLabel = (type) => {
    switch (type) {
      case 'career_advice': return 'Career Advice'
      case 'resume_review': return 'Resume Review'
      case 'interview_prep': return 'Interview Prep'
      case 'skill_gap_analysis': return 'Skill Gap Analysis'
      case 'career_path_planning': return 'Career Path Planning'
      default: return 'Career Advice'
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar with chat history */}
          <div className="md:col-span-1 bg-white rounded-lg shadow p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Chat History</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => createNewSession()}
                disabled={sessionLoading}
              >
                {sessionLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No chat sessions yet</p>
                <Button 
                  className="mt-4 bg-[#6A38C2]"
                  onClick={() => createNewSession()}
                  disabled={sessionLoading}
                >
                  {sessionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    'Start New Chat'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div 
                    key={session._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${currentSession?._id === session._id ? 'bg-[#6A38C2]/10 border-l-4 border-[#6A38C2]' : 'hover:bg-gray-100'}`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="font-medium">{getSessionTypeLabel(session.sessionType)}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {session.messages[session.messages.length - 1]?.content.substring(0, 30)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-3 bg-white rounded-lg shadow flex flex-col h-full">
            {currentSession ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b">
                  <h2 className="font-bold">{getSessionTypeLabel(currentSession.sessionType)}</h2>
                  <p className="text-sm text-gray-500">
                    Started on {new Date(currentSession.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                      <div 
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-[#6A38C2] text-white' : 'bg-gray-100'}`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div 
                            className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                
                {/* Input area */}
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      disabled={loading}
                      className="flex-grow"
                    />
                    <Button 
                      type="submit" 
                      disabled={!input.trim() || loading}
                      className="bg-[#6A38C2]"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">Welcome to AI Career Coach</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Get personalized career advice, resume tips, interview preparation, and more from your AI career assistant.
                </p>
                <Button 
                  className="bg-[#6A38C2]"
                  onClick={() => createNewSession()}
                  disabled={sessionLoading}
                >
                  {sessionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    'Start New Chat'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AiChat