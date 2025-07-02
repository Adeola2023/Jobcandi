import React from 'react'
import { Button } from './ui/button'
import { Brain, FileText, MessageSquare, Presentation, Route, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AiCoachFeatures = () => {
  const navigate = useNavigate()

  const features = [
    {
      title: 'AI Career Assistant',
      description: 'Get personalized career advice and job search tips',
      icon: <MessageSquare className="h-8 w-8 text-white" />,
      path: '/ai-coach/chat',
      bgColor: 'bg-purple-500'
    },
    {
      title: 'Resume Builder',
      description: 'Create professional resumes tailored to your target jobs',
      icon: <FileText className="h-8 w-8 text-white" />,
      path: '/ai-coach/resume',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Mock Interviews',
      description: 'Practice with AI-powered interviews and get feedback',
      icon: <Presentation className="h-8 w-8 text-white" />,
      path: '/ai-coach/interview',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Skill Gap Analysis',
      description: 'Identify skills you need to develop for your dream job',
      icon: <Sparkles className="h-8 w-8 text-white" />,
      path: '/ai-coach/skill-gap',
      bgColor: 'bg-orange-500'
    },
    {
      title: 'Career Path Planning',
      description: 'Map out your career progression with personalized roadmaps',
      icon: <Route className="h-8 w-8 text-white" />,
      path: '/ai-coach/career-path',
      bgColor: 'bg-red-500'
    },
    {
      title: 'Smart Job Matching',
      description: 'Get AI-powered job recommendations based on your profile',
      icon: <Brain className="h-8 w-8 text-white" />,
      path: '/ai-coach/job-matching',
      bgColor: 'bg-indigo-500'
    }
  ]

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Boost Your Career with AI Coach</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered career coach helps you navigate your professional journey with personalized guidance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className={`${feature.bgColor} p-4 flex items-center justify-center`}>
                <div className="rounded-full bg-white/20 p-3">
                  {feature.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Button 
                  onClick={() => navigate(feature.path)} 
                  className="w-full bg-[#6A38C2] hover:bg-[#5a2eb0]"
                >
                  Explore
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/ai-coach')} 
            className="bg-[#6A38C2] hover:bg-[#5a2eb0] text-lg px-8 py-6"
          >
            Explore All AI Coach Features
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AiCoachFeatures