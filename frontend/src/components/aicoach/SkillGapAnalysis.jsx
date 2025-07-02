import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Loader2, BookOpen, CheckCircle2, XCircle, ArrowRight, BarChart3, BookMarked, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'

const SkillGapAnalysis = () => {
  const { user } = useSelector(store => store.auth)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [userSkills, setUserSkills] = useState('')
  const [userExperience, setUserExperience] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [pastAnalyses, setPastAnalyses] = useState([])
  const [activeTab, setActiveTab] = useState('new') // 'new' or 'past'
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch past analyses on component mount
  useEffect(() => {
    fetchPastAnalyses()
  }, [])

  const fetchPastAnalyses = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/skill-gap`, {
        withCredentials: true
      })
      if (res.data.success) {
        setPastAnalyses(res.data.analyses)
      }
    } catch (error) {
      console.error('Error fetching past analyses:', error)
      toast.error('Failed to fetch your past skill gap analyses')
    } finally {
      setLoading(false)
    }
  }

  const startAnalysis = async () => {
    if (!jobTitle) {
      toast.error('Please enter a job title')
      return
    }

    if (!userSkills) {
      toast.error('Please enter your skills')
      return
    }

    try {
      setAnalyzing(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/skill-gap/analyze`, {
        jobTitle,
        jobDescription,
        userSkills,
        userExperience
      }, {
        withCredentials: true
      })

      if (res.data.success) {
        setAnalysisResult(res.data.analysis)
        fetchRecommendedCourses(res.data.analysis.missingSkills)
        // Refresh past analyses list
        fetchPastAnalyses()
      }
    } catch (error) {
      console.error('Error analyzing skill gap:', error)
      toast.error('Failed to analyze skill gap')
    } finally {
      setAnalyzing(false)
    }
  }

  const fetchRecommendedCourses = async (missingSkills) => {
    if (!missingSkills || missingSkills.length === 0) return

    try {
      setLoadingCourses(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/skill-gap/courses`, {
        skills: missingSkills
      }, {
        withCredentials: true
      })

      if (res.data.success) {
        setRecommendedCourses(res.data.courses)
      }
    } catch (error) {
      console.error('Error fetching recommended courses:', error)
      toast.error('Failed to fetch course recommendations')
    } finally {
      setLoadingCourses(false)
    }
  }

  const viewPastAnalysis = async (analysisId) => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/skill-gap/${analysisId}`, {
        withCredentials: true
      })

      if (res.data.success) {
        setAnalysisResult(res.data.analysis)
        setJobTitle(res.data.analysis.jobTitle)
        setRecommendedCourses(res.data.analysis.recommendedCourses || [])
        setActiveTab('new') // Switch to show the analysis
      }
    } catch (error) {
      console.error('Error fetching analysis details:', error)
      toast.error('Failed to fetch analysis details')
    } finally {
      setLoading(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setRecommendedCourses([])
    setJobTitle('')
    setJobDescription('')
    setUserSkills('')
    setUserExperience('')
  }

  // Render analysis form
  const renderAnalysisForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-6">Analyze Your Skills for a Job</h2>

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
          <Label htmlFor="jobDescription">Job Description</Label>
          <Textarea
            id="jobDescription"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here for more accurate analysis..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="userSkills">Your Skills</Label>
          <Textarea
            id="userSkills"
            value={userSkills}
            onChange={(e) => setUserSkills(e.target.value)}
            placeholder="List your skills, separated by commas (e.g. JavaScript, React, Project Management, etc.)"
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="userExperience">Your Experience (Optional)</Label>
          <Textarea
            id="userExperience"
            value={userExperience}
            onChange={(e) => setUserExperience(e.target.value)}
            placeholder="Briefly describe your relevant work experience..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          className="w-full bg-[#6A38C2]"
          onClick={startAnalysis}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Skills...
            </>
          ) : (
            <>Analyze Skill Gap</>
          )}
        </Button>
      </div>
    </div>
  )

  // Render analysis results
  const renderAnalysisResults = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">{analysisResult.jobTitle} - Skill Gap Analysis</h2>
            <p className="text-sm text-gray-500">
              Completed on {new Date(analysisResult.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={resetAnalysis}
          >
            New Analysis
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Match Score</h3>
          <div className="flex items-center gap-4">
            <Progress value={analysisResult.matchScore} className="h-3" />
            <span className="font-bold text-lg">{analysisResult.matchScore}%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{analysisResult.matchSummary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Matching Skills</h3>
            <div className="p-4 bg-gray-50 rounded-lg min-h-[150px]">
              {analysisResult.matchingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matchingSkills.map((skill, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 hover:bg-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-4">No matching skills found</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Missing Skills</h3>
            <div className="p-4 bg-gray-50 rounded-lg min-h-[150px]">
              {analysisResult.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingSkills.map((skill, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800 hover:bg-red-200">
                      <XCircle className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-4">No missing skills found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Detailed Analysis</h3>
        <div className="whitespace-pre-line">
          {analysisResult.detailedAnalysis}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-6">Recommended Learning Resources</h3>

        {loadingCourses ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
          </div>
        ) : recommendedCourses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No course recommendations available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* In a real implementation, these would be actual course recommendations from the API */}
            {[
              { id: '1', title: 'React.js Complete Guide', provider: 'Udemy', skill: 'React', url: '#', level: 'Intermediate' },
              { id: '2', title: 'Advanced TypeScript Masterclass', provider: 'Coursera', skill: 'TypeScript', url: '#', level: 'Advanced' },
              { id: '3', title: 'GraphQL Fundamentals', provider: 'Pluralsight', skill: 'GraphQL', url: '#', level: 'Beginner' },
              { id: '4', title: 'Docker & Kubernetes: The Complete Guide', provider: 'Udemy', skill: 'Docker', url: '#', level: 'Intermediate' }
            ].map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <CardDescription>{course.provider} • {course.level}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <Badge className="bg-[#6A38C2]/10 text-[#6A38C2] hover:bg-[#6A38C2]/20">
                    {course.skill}
                  </Badge>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => window.open(course.url, '_blank')}>
                    View Course
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Action Plan</h3>
        <div className="space-y-4">
          {analysisResult.actionPlan.map((action, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6A38C2] text-white flex items-center justify-center text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render past analyses
  const renderPastAnalyses = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Your Past Skill Gap Analyses</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
        </div>
      ) : pastAnalyses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">You haven't performed any skill gap analyses yet</p>
          <Button
            className="bg-[#6A38C2]"
            onClick={() => setActiveTab('new')}
          >
            Analyze Your Skills
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* In a real implementation, these would be the user's actual past analyses */}
          {[
            { id: '1', jobTitle: 'Frontend Developer', date: '2023-10-15T12:00:00Z', matchScore: 75, missingSkillsCount: 3 },
            { id: '2', jobTitle: 'UX Designer', date: '2023-11-02T14:30:00Z', matchScore: 82, missingSkillsCount: 2 },
            { id: '3', jobTitle: 'Product Manager', date: '2023-11-20T09:15:00Z', matchScore: 68, missingSkillsCount: 5 }
          ].map((analysis) => (
            <Card key={analysis.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{analysis.jobTitle}</CardTitle>
                <CardDescription>
                  {new Date(analysis.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Match Score</span>
                      <span className="text-sm font-medium">{analysis.matchScore}%</span>
                    </div>
                    <Progress value={analysis.matchScore} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Missing Skills</span>
                    <Badge variant="outline">{analysis.missingSkillsCount}</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => viewPastAnalysis(analysis.id)}
                >
                  View Analysis
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
          <h1 className="text-3xl font-bold mb-2">Skill Gap Analysis</h1>
          <p className="text-gray-600">
            Compare your skills to job requirements and get personalized recommendations to improve your qualifications.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">New Analysis</TabsTrigger>
            <TabsTrigger value="past">Past Analyses</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-6">
            {!analysisResult ? renderAnalysisForm() : renderAnalysisResults()}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {renderPastAnalyses()}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}

export default SkillGapAnalysis