import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Loader2, MapPin, Calendar, ArrowRight, Briefcase, GraduationCap, Award, Clock } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'

const CareerPathPlanning = () => {
  const { user } = useSelector(store => store.auth)
  const [currentRole, setCurrentRole] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [timeframe, setTimeframe] = useState('3') // years
  const [experience, setExperience] = useState('')
  const [education, setEducation] = useState('')
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [careerPath, setCareerPath] = useState(null)
  const [pastPaths, setPastPaths] = useState([])
  const [activeTab, setActiveTab] = useState('new') // 'new' or 'past'

  // Fetch past career paths on component mount
  useEffect(() => {
    fetchPastPaths()
  }, [])

  const fetchPastPaths = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/career-path`, {
        withCredentials: true
      })
      if (res.data.success) {
        setPastPaths(res.data.careerPaths)
      }
    } catch (error) {
      console.error('Error fetching past career paths:', error)
      toast.error('Failed to fetch your past career paths')
    } finally {
      setLoading(false)
    }
  }

  const generateCareerPath = async () => {
    if (!currentRole) {
      toast.error('Please enter your current role')
      return
    }

    if (!targetRole) {
      toast.error('Please enter your target role')
      return
    }

    try {
      setGenerating(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/career-path/generate`, {
        currentRole,
        targetRole,
        timeframe: parseInt(timeframe),
        experience,
        education,
        skills,
        interests
      }, {
        withCredentials: true
      })

      if (res.data.success) {
        setCareerPath(res.data.careerPath)
        // Refresh past paths list
        fetchPastPaths()
      }
    } catch (error) {
      console.error('Error generating career path:', error)
      toast.error('Failed to generate career path')
    } finally {
      setGenerating(false)
    }
  }

  const viewPastPath = async (pathId) => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/career-path/${pathId}`, {
        withCredentials: true
      })

      if (res.data.success) {
        setCareerPath(res.data.careerPath)
        setCurrentRole(res.data.careerPath.currentRole)
        setTargetRole(res.data.careerPath.targetRole)
        setTimeframe(res.data.careerPath.timeframe.toString())
        setActiveTab('new') // Switch to show the career path
      }
    } catch (error) {
      console.error('Error fetching career path details:', error)
      toast.error('Failed to fetch career path details')
    } finally {
      setLoading(false)
    }
  }

  const resetCareerPath = () => {
    setCareerPath(null)
    setCurrentRole('')
    setTargetRole('')
    setTimeframe('3')
    setExperience('')
    setEducation('')
    setSkills('')
    setInterests('')
  }

  // Render career path form
  const renderCareerPathForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-6">Plan Your Career Path</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currentRole">Current Role</Label>
            <Input
              id="currentRole"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Junior Developer, Marketing Associate"
            />
          </div>
          <div>
            <Label htmlFor="targetRole">Target Role</Label>
            <Input
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Developer, Marketing Director"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="timeframe">Timeframe (Years)</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="2">2 Years</SelectItem>
              <SelectItem value="3">3 Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
              <SelectItem value="10">10 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Work Experience</Label>
          <Textarea
            id="experience"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Briefly describe your relevant work experience..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="education">Education</Label>
          <Textarea
            id="education"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="List your educational background, degrees, certifications..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="skills">Skills</Label>
          <Textarea
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="List your skills, separated by commas..."
            className="min-h-[100px]"
          />
        </div>

        <div>
          <Label htmlFor="interests">Career Interests & Goals</Label>
          <Textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Describe your career interests, goals, and preferences..."
            className="min-h-[100px]"
          />
        </div>

        <Button
          className="w-full bg-[#6A38C2]"
          onClick={generateCareerPath}
          disabled={generating}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Career Path...
            </>
          ) : (
            <>Generate Career Path</>
          )}
        </Button>
      </div>
    </div>
  )

  // Render career path results
  const renderCareerPathResults = () => (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold">Career Path: {currentRole} → {targetRole}</h2>
            <p className="text-sm text-gray-500">
              {careerPath.timeframe} Year Plan • Created on {new Date(careerPath.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={resetCareerPath}
          >
            New Career Path
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Overview</h3>
          <p className="whitespace-pre-line">{careerPath.overview}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-6">Career Progression Timeline</h3>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>

          <div className="space-y-8">
            {/* In a real implementation, these would be the actual milestones from the API */}
            {[
              { 
                title: 'Junior Developer', 
                timeframe: 'Current', 
                description: 'Focus on building core skills in JavaScript, React, and responsive design. Contribute to team projects and learn from senior developers.', 
                skills: ['JavaScript', 'React', 'HTML/CSS'],
                type: 'role'
              },
              { 
                title: 'Complete Advanced React Course', 
                timeframe: 'Month 3', 
                description: 'Master advanced React concepts including hooks, context API, and Redux state management.',
                type: 'education'
              },
              { 
                title: 'Mid-level Developer', 
                timeframe: 'Year 1', 
                description: 'Take on more responsibility in projects. Begin mentoring junior developers. Develop expertise in specific areas of the tech stack.',
                skills: ['React Advanced', 'State Management', 'Testing'],
                type: 'role'
              },
              { 
                title: 'Lead Developer on Small Projects', 
                timeframe: 'Year 2', 
                description: 'Start leading small to medium-sized projects. Improve architectural decision-making skills and team coordination.',
                type: 'milestone'
              },
              { 
                title: 'Senior Developer', 
                timeframe: 'Year 3', 
                description: 'Take on technical leadership responsibilities. Influence technical decisions and mentor other developers. Develop deep expertise in system design.',
                skills: ['System Architecture', 'Team Leadership', 'Performance Optimization'],
                type: 'role'
              }
            ].map((milestone, index) => (
              <div key={index} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${milestone.type === 'role' ? 'bg-[#6A38C2]' : milestone.type === 'education' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                    {milestone.type === 'role' ? (
                      <Briefcase className="h-4 w-4" />
                    ) : milestone.type === 'education' ? (
                      <GraduationCap className="h-4 w-4" />
                    ) : (
                      <Award className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{milestone.title}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {milestone.timeframe}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{milestone.description}</p>

                {milestone.skills && (
                  <div className="flex flex-wrap gap-2">
                    {milestone.skills.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Key Skills to Develop</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {careerPath.skillsToDevelop.map((skill, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{skill.name}</CardTitle>
                <CardDescription>Priority: {skill.priority}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{skill.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
        <div className="space-y-4">
          {careerPath.recommendedActions.map((action, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#6A38C2] text-white flex items-center justify-center text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
                {action.timeline && (
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {action.timeline}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-bold mb-4">Potential Challenges & Solutions</h3>
        <div className="space-y-6">
          {careerPath.challenges.map((challenge, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-medium mb-2">{challenge.challenge}</h4>
              <div className="pl-4 border-l-2 border-[#6A38C2]">
                <p className="text-sm">{challenge.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render past career paths
  const renderPastPaths = () => (
    <div>
      <h2 className="text-xl font-bold mb-6">Your Career Path Plans</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
        </div>
      ) : pastPaths.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">You haven't created any career path plans yet</p>
          <Button
            className="bg-[#6A38C2]"
            onClick={() => setActiveTab('new')}
          >
            Create Your First Career Path
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* In a real implementation, these would be the user's actual past career paths */}
          {[
            { id: '1', currentRole: 'Junior Developer', targetRole: 'Senior Developer', timeframe: 3, date: '2023-10-15T12:00:00Z' },
            { id: '2', currentRole: 'UX Designer', targetRole: 'Design Director', timeframe: 5, date: '2023-11-02T14:30:00Z' },
            { id: '3', currentRole: 'Marketing Associate', targetRole: 'Marketing Manager', timeframe: 2, date: '2023-11-20T09:15:00Z' }
          ].map((path) => (
            <Card key={path.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">{path.targetRole}</CardTitle>
                <CardDescription>
                  From {path.currentRole}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {path.timeframe} Year Plan
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(path.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                    {path.currentRole}
                  </div>
                  <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                  <div className="px-3 py-1 rounded-full bg-[#6A38C2]/10 text-[#6A38C2] text-sm">
                    {path.targetRole}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => viewPastPath(path.id)}
                >
                  View Career Path
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
          <h1 className="text-3xl font-bold mb-2">Career Path Planning</h1>
          <p className="text-gray-600">
            Plan your career progression with AI-powered guidance tailored to your goals and experience.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">New Career Path</TabsTrigger>
            <TabsTrigger value="past">Your Career Paths</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="mt-6">
            {!careerPath ? renderCareerPathForm() : renderCareerPathResults()}
          </TabsContent>
          <TabsContent value="past" className="mt-6">
            {renderPastPaths()}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  )
}

export default CareerPathPlanning