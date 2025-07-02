import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BookOpen, Calendar, FileText, MessageSquare, Briefcase, LineChart, Award, Sparkles, Code, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useFeatureIntegration } from '@/hooks/useFeatureIntegration';
import { useSkillSync } from '@/hooks/useSkillSync';
import { SkillManager } from '@/components/aicoach/shared/SkillManager';
import { addUserSkill } from '@/redux/slices/aiCoachSlice';

/**
 * AI Coach Dashboard Component
 * 
 * A unified dashboard for all AI Coach features with:
 * - Feature cards with quick access
 * - Progress tracking
 * - Personalized recommendations
 * - Recent activity
 * - Skill overview
 */
const AiCoachDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    resumes,
    interviews,
    skillGapAnalyses,
    careerPaths,
    jobRecommendations,
    sessions,
    loading
  } = useSelector(state => state.aiCoach);
  
  const { userSkills } = useSkillSync();
  const {
    getRecommendedNextSteps,
    getLatestResumeData,
    getLatestCareerPathData,
    getLatestSkillGapData,
    getRelevantJobRecommendations
  } = useFeatureIntegration();
  
  // Calculate overall progress
  const calculateProgress = () => {
    let completed = 0;
    const total = 5; // Total number of main features
    
    if (resumes.length > 0) completed++;
    if (interviews.length > 0) completed++;
    if (skillGapAnalyses.length > 0) completed++;
    if (careerPaths.length > 0) completed++;
    if (sessions.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };
  
  const progress = calculateProgress();
  const recommendations = getRecommendedNextSteps();
  const latestResume = getLatestResumeData();
  const latestCareerPath = getLatestCareerPathData();
  const latestSkillGap = getLatestSkillGapData();
  const relevantJobs = getRelevantJobRecommendations().slice(0, 3);
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header with progress */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Coach Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.fullname}. Here's your career development overview.
          </p>
        </div>
        
        <Card className="w-full md:w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Career Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">{progress}% of features utilized</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main dashboard content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Resume Builder */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Resume Builder</CardTitle>
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Create and manage professional resumes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {resumes.length > 0 
                    ? `${resumes.length} resume${resumes.length > 1 ? 's' : ''} created` 
                    : 'No resumes created yet'}
                </p>
                {latestResume && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Latest: {latestResume.templateName}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/resume-builder')}
                >
                  <span>{resumes.length > 0 ? 'Manage Resumes' : 'Create Resume'}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Mock Interview */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Mock Interview</CardTitle>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Practice interview skills with AI feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {interviews.length > 0 
                    ? `${interviews.length} interview${interviews.length > 1 ? 's' : ''} completed` 
                    : 'No interviews completed yet'}
                </p>
                {interviews.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Avg Score: {Math.round(interviews.reduce((acc, int) => acc + (int.overallScore || 0), 0) / interviews.length)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/mock-interview')}
                >
                  <span>Practice Interview</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Skill Gap Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Skill Gap Analysis</CardTitle>
                  <LineChart className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Identify and bridge your skill gaps</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {skillGapAnalyses.length > 0 
                    ? `${skillGapAnalyses.length} analysis completed` 
                    : 'No skill gap analysis yet'}
                </p>
                {latestSkillGap && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Target: {latestSkillGap.targetJobTitle}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/skill-gap-analysis')}
                >
                  <span>Analyze Skills</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Career Path Planning */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Career Path Planning</CardTitle>
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Plan your career progression journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {careerPaths.length > 0 
                    ? `${careerPaths.length} career path${careerPaths.length > 1 ? 's' : ''} created` 
                    : 'No career paths created yet'}
                </p>
                {latestCareerPath && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Goal: {latestCareerPath.targetPosition}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/career-path-planning')}
                >
                  <span>Plan Career</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* Job Matching */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Smart Job Matching</CardTitle>
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Find jobs that match your skills and goals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {jobRecommendations.length > 0 
                    ? `${jobRecommendations.length} job matches found` 
                    : 'No job matches yet'}
                </p>
                {jobRecommendations.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Top Match: {jobRecommendations[0].matchScore}%
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/job-matching')}
                >
                  <span>Find Jobs</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            {/* AI Career Assistant */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">AI Career Assistant</CardTitle>
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardDescription>Get personalized career advice and guidance</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {sessions.length > 0 
                    ? `${sessions.length} chat session${sessions.length > 1 ? 's' : ''}` 
                    : 'No chat sessions yet'}
                </p>
                {sessions.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Last chat: {formatDate(sessions[0].updatedAt)}
                    </Badge>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between" 
                  onClick={() => navigate('/ai-coach/chat')}
                >
                  <span>Get Advice</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Your Skills</CardTitle>
                <CardDescription>Add, remove, and organize your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillManager showSuggestions={true} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Skill Development</CardTitle>
                <CardDescription>Track your progress and find resources</CardDescription>
              </CardHeader>
              <CardContent>
                {userSkills.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Add skills to see development recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userSkills.slice(0, 5).map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{skill}</p>
                          <Badge variant="outline">In Progress</Badge>
                        </div>
                        <Progress value={Math.random() * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Learning</span>
                          <span>Proficient</span>
                          <span>Expert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/ai-coach/skill-gap-analysis')}>
                  Analyze Skill Gaps
                </Button>
              </CardFooter>
            </Card>
            
            {latestSkillGap && (
              <Card>
                <CardHeader>
                  <CardTitle>Missing Skills</CardTitle>
                  <CardDescription>For {latestSkillGap.targetJobTitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestSkillGap.missingSkills.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.skill}</p>
                          <p className="text-xs text-muted-foreground">Importance: {item.importance}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dispatch(addUserSkill(item.skill))}
                        >
                          Add Skill
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {latestCareerPath && (
              <Card>
                <CardHeader>
                  <CardTitle>Career Path Skills</CardTitle>
                  <CardDescription>For {latestCareerPath.targetPosition}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestCareerPath.milestones.flatMap(m => m.skillsToAcquire).slice(0, 8).map((skill, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <p className="font-medium">{skill}</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => dispatch(addUserSkill(skill))}
                        >
                          Add Skill
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {recommendations.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>All Caught Up!</CardTitle>
                  <CardDescription>You've explored all the AI Coach features</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Continue refining your career development by revisiting features and keeping your information up to date.</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    Update Profile
                  </Button>
                  <Button onClick={() => navigate('/ai-coach/chat')}>
                    Get Career Advice
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommended Next Steps</h3>
                {recommendations.map((rec, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    {/* Colored accent bar based on feature type */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      rec.feature === 'resume' ? 'bg-blue-500' : 
                      rec.feature === 'interview' ? 'bg-green-500' : 
                      rec.feature === 'skillGap' ? 'bg-yellow-500' : 
                      rec.feature === 'careerPath' ? 'bg-purple-500' : 'bg-primary'
                    }`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {rec.feature === 'resume' && <FileText className="h-5 w-5 text-blue-500" />}
                        {rec.feature === 'interview' && <MessageSquare className="h-5 w-5 text-green-500" />}
                        {rec.feature === 'skillGap' && <Code className="h-5 w-5 text-yellow-500" />}
                        {rec.feature === 'careerPath' && <LineChart className="h-5 w-5 text-purple-500" />}
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{rec.description}</p>
                      
                      {/* Feature-specific content */}
                      {rec.feature === 'resume' && resumes.length > 0 && (
                        <div className="mt-4 p-3 bg-muted rounded-md">
                          <p className="text-xs font-medium">Your latest resume: {getLatestResumeData()?.templateName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Created on {formatDate(getLatestResumeData()?.createdAt)}</p>
                        </div>
                      )}
                      
                      {rec.feature === 'skillGap' && userSkills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium mb-2">Your current skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {userSkills.slice(0, 5).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                            ))}
                            {userSkills.length > 5 && <Badge variant="secondary" className="text-xs">+{userSkills.length - 5} more</Badge>}
                          </div>
                        </div>
                      )}
                      
                      {rec.feature === 'careerPath' && (
                        <div className="mt-4 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <p className="text-xs">Plan your path to your dream role</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          switch(rec.feature) {
                            case 'resume': navigate('/ai-coach/resume-builder'); break;
                            case 'interview': navigate('/ai-coach/mock-interview'); break;
                            case 'skillGap': navigate('/ai-coach/skill-gap-analysis'); break;
                            case 'careerPath': navigate('/ai-coach/career-path-planning'); break;
                            default: navigate('/ai-coach');
                          }
                        }}
                      >
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Job matches section */}
            {relevantJobs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Job Matches Based on Your Profile
                  </CardTitle>
                  <CardDescription>
                    Jobs that match your skills and career goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relevantJobs.map((job, index) => (
                    <div key={index} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company?.name || 'Company'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{job.jobType}</Badge>
                          <Badge variant="outline" className="text-xs bg-green-50">{job.matchScore}% Match</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/job/${job._id}`)}>
                        View Job
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/ai-coach/job-matching')}>
                    View All Job Matches
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* Career development tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Career Development Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 border-b pb-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Keep your resume updated</h4>
                    <p className="text-xs text-muted-foreground">Regularly update your resume with new skills and experiences</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 border-b pb-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Practice interviewing regularly</h4>
                    <p className="text-xs text-muted-foreground">Regular practice improves confidence and performance</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <LineChart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Set clear career milestones</h4>
                    <p className="text-xs text-muted-foreground">Break down your long-term goals into achievable steps</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => navigate('/ai-coach/chat')}>
                  Get Personalized Advice
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest interactions with AI Coach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Combine and sort all activities by date */}
              {[...sessions, ...resumes, ...interviews, ...skillGapAnalyses, ...careerPaths]
                .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                .slice(0, 5)
                .map((item, index) => {
                  // Determine item type and details
                  let icon = <MessageSquare className="h-4 w-4" />;
                  let title = 'Chat Session';
                  let description = 'AI Career Assistant';
                  
                  if ('templateName' in item) {
                    icon = <FileText className="h-4 w-4" />;
                    title = `Resume: ${item.templateName}`;
                    description = 'Resume Builder';
                  } else if ('questions' in item) {
                    icon = <MessageSquare className="h-4 w-4" />;
                    title = `Interview: ${item.jobTitle}`;
                    description = 'Mock Interview';
                  } else if ('targetJobTitle' in item) {
                    icon = <LineChart className="h-4 w-4" />;
                    title = `Skill Gap: ${item.targetJobTitle}`;
                    description = 'Skill Gap Analysis';
                  } else if ('targetPosition' in item) {
                    icon = <Calendar className="h-4 w-4" />;
                    title = `Career Path: ${item.currentPosition} → ${item.targetPosition}`;
                    description = 'Career Path Planning';
                  }
                  
                  return (
                    <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                      <div className="bg-muted p-2 rounded-full">
                        {icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{title}</h4>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(item.updatedAt || item.createdAt)}
                      </div>
                    </div>
                  );
                })}
                
              {[...sessions, ...resumes, ...interviews, ...skillGapAnalyses, ...careerPaths].length === 0 && (
                <p className="text-sm text-muted-foreground">No activity yet. Start using AI Coach features!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Job Matches Tab */}
        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Matches</CardTitle>
              <CardDescription>Jobs that match your skills and career goals</CardDescription>
            </CardHeader>
            <CardContent>
              {relevantJobs.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No job matches found</p>
                  <p className="text-sm text-muted-foreground mt-2">Complete your profile to get job recommendations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {relevantJobs.map((job, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm">{job.company?.name || 'Company'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{job.jobType}</Badge>
                          <Badge variant="outline" className="bg-green-50">
                            {job.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.requirements && job.requirements.slice(0, 3).map((req, i) => (
                            <Badge key={i} variant="outline">{req}</Badge>
                          ))}
                          {job.requirements && job.requirements.length > 3 && (
                            <Badge variant="outline">+{job.requirements.length - 3} more</Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => navigate(`/job/${job._id}`)}
                      >
                        View Job
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => navigate('/ai-coach/job-matching')}
              >
                View All Job Matches
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiCoachDashboard;