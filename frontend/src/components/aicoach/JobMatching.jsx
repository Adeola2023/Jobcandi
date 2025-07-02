import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Loader2, Brain, CheckCircle2, Star, Briefcase, MapPin, DollarSign, Clock, ArrowRight, Search } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT, JOB_API_END_POINT, APPLICATION_API_END_POINT } from '@/utils/constant'
import useGetJobRecommendations from '@/hooks/useGetJobRecommendations'
import { useNavigate } from 'react-router-dom'

const JobMatching = () => {
  const { user } = useSelector(store => store.auth)
  const { jobRecommendations, loading } = useSelector(store => store.aiCoach)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('recommendations')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Use the custom hook to fetch job recommendations
  useGetJobRecommendations()

  // Handle job search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchQuery}`, {
        withCredentials: true
      })
      setSearchResults(res.data.jobs || [])
    } catch (error) {
      console.error('Error searching jobs:', error)
      toast.error('Failed to search jobs')
    } finally {
      setIsSearching(false)
    }
  }

  // Apply for a job
  const applyForJob = async (jobId) => {
    try {
      const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
        withCredentials: true
      })
      if (res.data.success) {
        toast.success('Application submitted successfully')
      }
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error(error.response?.data?.message || 'Failed to apply for job')
    }
  }

  // View job details
  const viewJobDetails = (jobId) => {
    navigate(`/description/${jobId}`)
  }

  // Render job card
  const renderJobCard = (job, matchScore = null) => (
    <Card key={job._id} className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="text-sm">
              {job.company?.name || 'Company Name'}
            </CardDescription>
          </div>
          {matchScore !== null && (
            <div className="flex items-center gap-1">
              <Badge className={`${matchScore >= 80 ? 'bg-green-500' : matchScore >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                {matchScore}% Match
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{job.jobType}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm">${job.salary}/year</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{job.experienceLevel}+ years</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
        {matchScore !== null && (
          <div className="mb-3">
            <p className="text-sm font-medium mb-1">Skills Match:</p>
            <div className="flex flex-wrap gap-1">
              {job.requirements.map((skill, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" onClick={() => viewJobDetails(job._id)}>
          View Details
        </Button>
        <Button onClick={() => applyForJob(job._id)}>
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold">Smart Job Matching</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Find Your Perfect Job</CardTitle>
                <CardDescription>
                  Our AI analyzes your profile and matches you with the most suitable jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Search Jobs</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="search"
                        placeholder="Job title, skills, or keywords"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Your Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {user?.profile?.skills?.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      )) || (
                        <p className="text-sm text-gray-500">No skills added to your profile</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Job Preferences</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Job Types:</span>
                        <span className="text-gray-500">
                          {user?.profile?.preferredJobTypes?.join(', ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Locations:</span>
                        <span className="text-gray-500">
                          {user?.profile?.preferredLocations?.join(', ') || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Salary Range:</span>
                        <span className="text-gray-500">
                          {user?.profile?.preferredSalary ? 
                            `$${user.profile.preferredSalary.min} - $${user.profile.preferredSalary.max}` : 
                            'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/profile')}
                  >
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
                <TabsTrigger value="search">Search Results</TabsTrigger>
              </TabsList>
              
              <TabsContent value="recommendations" className="mt-4">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-2">Finding your perfect matches...</span>
                  </div>
                ) : jobRecommendations && jobRecommendations.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">Your Top Matches</h3>
                      <p className="text-sm text-gray-600">
                        Based on your skills, experience, and preferences
                      </p>
                    </div>
                    {jobRecommendations.map(item => renderJobCard(item.job, item.matchScore))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No recommendations yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your profile with more skills and preferences to get personalized job recommendations
                    </p>
                    <Button onClick={() => navigate('/profile')}>
                      Update Profile
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="search" className="mt-4">
                {isSearching ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <span className="ml-2">Searching jobs...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium">Search Results</h3>
                      <p className="text-sm text-gray-600">
                        Found {searchResults.length} jobs matching your search
                      </p>
                    </div>
                    {searchResults.map(job => renderJobCard(job))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No search results</h3>
                    <p className="text-sm text-gray-600">
                      Try searching for job titles, skills, or keywords
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default JobMatching