import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Mic, MicOff, Video, VideoOff, Send, Play, Pause, Clock, CheckCircle2, XCircle, Loader2, MessageSquare } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'

const MockInterview = () => {
  const { user } = useSelector(store => store.auth)
  const [interviewType, setInterviewType] = useState('text') // 'text' or 'video'
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [interviewLevel, setInterviewLevel] = useState('entry') // 'entry', 'mid', 'senior'
  const [interviewFocus, setInterviewFocus] = useState('technical') // 'technical', 'behavioral', 'mixed'
  const [isInterviewStarted, setIsInterviewStarted] = useState(false)
  const [isInterviewCompleted, setIsInterviewCompleted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [userAnswer, setUserAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [videoStream, setVideoStream] = useState(null)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [pastInterviews, setPastInterviews] = useState([])
  const [activeTab, setActiveTab] = useState('new') // 'new' or 'past'
  
  const videoRef = useRef(null)
  const timerRef = useRef(null)
  
  // Fetch past interviews on component mount
  useEffect(() => {
    fetchPastInterviews()
  }, [])
  
  const fetchPastInterviews = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/mock-interview`, {
        withCredentials: true
      })
      if (res.data.success) {
        setPastInterviews(res.data.interviews)
      }
    } catch (error) {
      console.error('Error fetching past interviews:', error)
      toast.error('Failed to fetch your past interviews')
    } finally {
      setLoading(false)
    }
  }
  
  const startInterview = async () => {
    if (!jobTitle) {
      toast.error('Please enter a job title')
      return
    }
    
    try {
      setLoading(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/mock-interview/start`, {
        jobTitle,
        jobDescription,
        interviewType,
        interviewLevel,
        interviewFocus
      }, {
        withCredentials: true
      })
      
      if (res.data.success) {
        setQuestions(res.data.questions)
        setCurrentQuestion(res.data.questions[0])
        setIsInterviewStarted(true)
        
        if (interviewType === 'video' && videoRef.current) {
          startVideoStream()
        }
      }
    } catch (error) {
      console.error('Error starting interview:', error)
      toast.error('Failed to start the interview')
    } finally {
      setLoading(false)
    }
  }
  
  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setVideoStream(stream)
      setIsVideoEnabled(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      toast.error('Failed to access camera and microphone')
      setInterviewType('text')
    }
  }
  
  const toggleVideo = () => {
    if (videoStream) {
      const videoTracks = videoStream.getVideoTracks()
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled
      })
      setIsVideoEnabled(!isVideoEnabled)
    }
  }
  
  const startRecording = () => {
    if (!videoStream) return
    
    const recorder = new MediaRecorder(videoStream)
    const chunks = []
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setAudioBlob(blob)
      submitVideoAnswer(blob)
    }
    
    recorder.start()
    setMediaRecorder(recorder)
    setIsRecording(true)
    
    // Start timer
    let seconds = 0
    timerRef.current = setInterval(() => {
      seconds++
      setRecordingTime(seconds)
    }, 1000)
  }
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      
      // Stop timer
      clearInterval(timerRef.current)
      setRecordingTime(0)
    }
  }
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const submitTextAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please enter your answer')
      return
    }
    
    try {
      setLoading(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/mock-interview/answer`, {
        questionId: currentQuestion._id,
        answer: userAnswer,
        answerType: 'text'
      }, {
        withCredentials: true
      })
      
      if (res.data.success) {
        // Add answer to answers array
        setAnswers([...answers, {
          questionId: currentQuestion._id,
          question: currentQuestion.question,
          answer: userAnswer,
          feedback: res.data.feedback
        }])
        
        // Move to next question or complete interview
        moveToNextQuestion(res.data.feedback)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit your answer')
    } finally {
      setLoading(false)
      setUserAnswer('')
    }
  }
  
  const submitVideoAnswer = async (blob) => {
    try {
      setLoading(true)
      
      // Create form data to send video file
      const formData = new FormData()
      formData.append('questionId', currentQuestion._id)
      formData.append('answerType', 'video')
      formData.append('videoFile', blob, 'answer.webm')
      
      const res = await axios.post(`${AI_COACH_API_END_POINT}/mock-interview/answer`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (res.data.success) {
        // Add answer to answers array
        setAnswers([...answers, {
          questionId: currentQuestion._id,
          question: currentQuestion.question,
          answerUrl: res.data.answerUrl,
          feedback: res.data.feedback
        }])
        
        // Move to next question or complete interview
        moveToNextQuestion(res.data.feedback)
      }
    } catch (error) {
      console.error('Error submitting video answer:', error)
      toast.error('Failed to submit your video answer')
    } finally {
      setLoading(false)
    }
  }
  
  const moveToNextQuestion = (currentFeedback) => {
    const nextIndex = currentQuestionIndex + 1
    
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex)
      setCurrentQuestion(questions[nextIndex])
    } else {
      // Interview completed
      completeInterview(currentFeedback)
    }
  }
  
  const completeInterview = async (lastFeedback) => {
    try {
      setLoading(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/mock-interview/complete`, {
        answers: [...answers, {
          questionId: currentQuestion._id,
          question: currentQuestion.question,
          answer: userAnswer || 'Video answer submitted',
          feedback: lastFeedback
        }]
      }, {
        withCredentials: true
      })
      
      if (res.data.success) {
        setFeedback(res.data.feedback)
        setIsInterviewCompleted(true)
        
        // Stop video stream if active
        if (videoStream) {
          videoStream.getTracks().forEach(track => track.stop())
          setVideoStream(null)
        }
        
        // Refresh past interviews list
        fetchPastInterviews()
      }
    } catch (error) {
      console.error('Error completing interview:', error)
      toast.error('Failed to complete the interview')
    } finally {
      setLoading(false)
    }
  }
  
  const resetInterview = () => {
    setIsInterviewStarted(false)
    setIsInterviewCompleted(false)
    setCurrentQuestion(null)
    setCurrentQuestionIndex(0)
    setQuestions([])
    setUserAnswer('')
    setAnswers([])
    setFeedback(null)
    setIsRecording(false)
    setRecordingTime(0)
    setAudioBlob(null)
    
    // Stop video stream if active
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      setIsVideoEnabled(false)
    }
    
    // Clear timer if active
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }
  
  const viewPastInterview = async (interviewId) => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/mock-interview/${interviewId}`, {
        withCredentials: true
      })
      
      if (res.data.success) {
        // Set up the interview data for viewing
        setQuestions(res.data.interview.questions)
        setAnswers(res.data.interview.answers)
        setFeedback(res.data.interview.feedback)
        setJobTitle(res.data.interview.jobTitle)
        setInterviewType(res.data.interview.interviewType)
        setInterviewLevel(res.data.interview.interviewLevel)
        setInterviewFocus(res.data.interview.interviewFocus)
        setIsInterviewCompleted(true)
        setIsInterviewStarted(true)
      }
    } catch (error) {
      console.error('Error fetching interview details:', error)
      toast.error('Failed to fetch interview details')
    } finally {
      setLoading(false)
    }
  }
  
  // Render setup form
  const renderSetupForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-6">Set Up Your Mock Interview</h2>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input 
            id="jobTitle" 
            value={jobTitle} 
            onChange={(e) => setJobTitle(e.target.value)} 
            placeholder="e.g. Frontend Developer, Product Manager, Data Scientist" 
          />
        </div>
        
        <div>
          <Label htmlFor="jobDescription">Job Description (Optional)</Label>
          <Textarea 
            id="jobDescription" 
            value={jobDescription} 
            onChange={(e) => setJobDescription(e.target.value)} 
            placeholder="Paste the job description here for more tailored questions..." 
            className="min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="interviewType">Interview Type</Label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text-based</SelectItem>
                <SelectItem value="video">Video Interview</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="interviewLevel">Experience Level</Label>
            <Select value={interviewLevel} onValueChange={setInterviewLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="interviewFocus">Interview Focus</Label>
            <Select value={interviewFocus} onValueChange={setInterviewFocus}>
              <SelectTrigger>
                <SelectValue placeholder="Select focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Skills</SelectItem>
                <SelectItem value="behavioral">Behavioral Questions</SelectItem>
                <SelectItem value="mixed">Mixed (Both)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          className="w-full bg-[#6A38C2]"
          onClick={startInterview}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting Up Interview...
            </>
          ) : (
            <>Start Mock Interview</>
          )}
        </Button>
      </div>
    </div>
  )
  
  // Render text-based interview
  const renderTextInterview = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{jobTitle} Interview</h2>
        <p className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium">{currentQuestion?.question}</p>
      </div>
      
      <div className="mb-6">
        <Label htmlFor="answer">Your Answer</Label>
        <Textarea 
          id="answer" 
          value={userAnswer} 
          onChange={(e) => setUserAnswer(e.target.value)} 
          placeholder="Type your answer here..." 
          className="min-h-[150px]"
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={resetInterview}
          disabled={loading}
        >
          Cancel Interview
        </Button>
        <Button 
          className="bg-[#6A38C2]"
          onClick={submitTextAnswer}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>Submit Answer</>
          )}
        </Button>
      </div>
    </div>
  )
  
  // Render video-based interview
  const renderVideoInterview = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{jobTitle} Interview</h2>
        <p className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium">{currentQuestion?.question}</p>
      </div>
      
      <div className="mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
          <video 
            ref={videoRef} 
            autoPlay 
            muted={!isRecording} 
            className="w-full h-full object-cover"
          />
          
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(recordingTime)}
            </div>
          )}
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white/80 hover:bg-white"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={resetInterview}
          disabled={loading || isRecording}
        >
          Cancel Interview
        </Button>
        
        <div className="flex gap-2">
          {!isRecording ? (
            <Button 
              className="bg-[#6A38C2]"
              onClick={startRecording}
              disabled={loading}
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopRecording}
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>
      </div>
    </div>
  )
  
  // Render interview feedback
  const renderInterviewFeedback = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="mb-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Interview Completed</h2>
        <p className="text-gray-500">Here's your feedback and performance analysis</p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Overall Feedback</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-line">{feedback?.overallFeedback}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Technical Knowledge</p>
            <p className="text-2xl font-bold text-[#6A38C2]">{feedback?.scores?.technical || 'N/A'}/10</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Communication</p>
            <p className="text-2xl font-bold text-[#6A38C2]">{feedback?.scores?.communication || 'N/A'}/10</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Overall Score</p>
            <p className="text-2xl font-bold text-[#6A38C2]">{feedback?.scores?.overall || 'N/A'}/10</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Question-by-Question Review</h3>
        <div className="space-y-4">
          {answers.map((answer, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50">
                <p className="font-medium">Q{index + 1}: {answer.question}</p>
              </div>
              <div className="p-4 border-t">
                <p className="text-sm font-medium text-gray-500 mb-2">Your Answer:</p>
                {answer.answerUrl ? (
                  <div className="mb-4">
                    <video 
                      src={answer.answerUrl} 
                      controls 
                      className="w-full rounded"
                    />
                  </div>
                ) : (
                  <p className="mb-4 whitespace-pre-line">{answer.answer}</p>
                )}
                <p className="text-sm font-medium text-gray-500 mb-2">Feedback:</p>
                <p className="text-sm whitespace-pre-line">{answer.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4">Improvement Suggestions</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <ul className="list-disc pl-5 space-y-2">
            {feedback?.improvementSuggestions?.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-[#6A38C2]"
          onClick={resetInterview}
        >
          Start New Interview
        </Button>
      </div>
    </div>
  )
  
  // Render past interviews
  const renderPastInterviews = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Your Past Interviews</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
        </div>
      ) : pastInterviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">You haven't completed any interviews yet</p>
          <Button 
            className="bg-[#6A38C2]"
            onClick={() => setActiveTab('new')}
          >
            Start Your First Interview
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* In a real implementation, these would be the user's actual past interviews */}
          {[
            { id: '1', jobTitle: 'Frontend Developer', date: '2023-10-15T12:00:00Z', score: 8.5, type: 'text' },
            { id: '2', jobTitle: 'UX Designer', date: '2023-11-02T14:30:00Z', score: 7.8, type: 'video' },
            { id: '3', jobTitle: 'Product Manager', date: '2023-11-20T09:15:00Z', score: 9.2, type: 'text' }
          ].map((interview) => (
            <Card key={interview.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{interview.jobTitle}</CardTitle>
                <CardDescription>
                  {new Date(interview.date).toLocaleDateString()} • {interview.type === 'video' ? 'Video' : 'Text'} Interview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm">Overall Score</span>
                  <span className="text-lg font-bold text-[#6A38C2]">{interview.score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#6A38C2] h-2.5 rounded-full" 
                    style={{ width: `${(interview.score / 10) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => viewPastInterview(interview.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Mock Interview</h1>
          <p className="text-gray-600">
            Practice job interviews with our AI interviewer and get instant feedback to improve your skills.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">New Interview</TabsTrigger>
            <TabsTrigger value="past">Past Interviews</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-6">
            {!isInterviewStarted && renderSetupForm()}
            {isInterviewStarted && !isInterviewCompleted && interviewType === 'text' && renderTextInterview()}
            {isInterviewStarted && !isInterviewCompleted && interviewType === 'video' && renderVideoInterview()}
            {isInterviewStarted && isInterviewCompleted && renderInterviewFeedback()}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {renderPastInterviews()}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}

export default MockInterview