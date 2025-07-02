import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, FileText, Video, BarChart2, Compass, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

const AiCoachHome = () => {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  const features = [
    {
      id: 'chat',
      title: 'AI Career Assistant',
      description: 'Chat with our AI career coach for personalized career advice and guidance.',
      icon: <MessageSquare className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/chat'
    },
    {
      id: 'resume',
      title: 'Resume Builder',
      description: 'Create professional resumes and cover letters tailored to your target jobs.',
      icon: <FileText className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/resume'
    },
    {
      id: 'interview',
      title: 'Mock Interviews',
      description: 'Practice interviews with AI feedback to improve your performance.',
      icon: <Video className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/interview'
    },
    {
      id: 'skills',
      title: 'Skill Gap Analysis',
      description: 'Identify skills you need to develop for your dream job.',
      icon: <BarChart2 className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/skill-gap'
    },
    {
      id: 'career',
      title: 'Career Path Planning',
      description: 'Map out your career journey with personalized milestones and goals.',
      icon: <Compass className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/career-path'
    },
    {
      id: 'job-matching',
      title: 'Smart Job Matching',
      description: 'Get AI-powered job recommendations based on your skills and preferences.',
      icon: <Briefcase className="h-8 w-8 text-[#6A38C2]" />,
      path: '/ai-coach/job-matching'
    }
  ]

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <span className="mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium inline-block mb-4">AI-Powered Career Development</span>
          <h1 className="text-5xl font-bold mb-6">Your Personal <span className="text-[#6A38C2]">AI Career Coach</span></h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Unlock your career potential with our AI-powered tools. Get personalized advice, build standout resumes, practice interviews, and plan your career path - all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className="bg-white rounded-xl shadow-lg p-8 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-[#6A38C2]/30"
              whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              onClick={() => navigate(feature.path)}
              onMouseEnter={() => setHoveredCard(feature.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-[#6A38C2]/10 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <Button 
                  className={`w-full ${hoveredCard === feature.id ? 'bg-[#6A38C2]' : 'bg-[#6A38C2]/80'}`}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-[#6A38C2]/5 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Smart Job Matching</h2>
              <p className="text-gray-600 mb-6">
                Our AI analyzes your skills, experience, and preferences to find the perfect job matches. Get personalized job recommendations that align with your career goals.
              </p>
              <Button 
                className="bg-[#6A38C2]"
                onClick={() => navigate('/ai-coach/job-matching')}
              >
                Find Matching Jobs
              </Button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Match Score</h3>
                <span className="text-sm text-gray-500">Based on your profile</span>
              </div>
              <div className="space-y-4">
                {[85, 78, 72, 65, 60].map((score, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Frontend Developer at {['TechCorp', 'WebSolutions', 'DigitalInnovate', 'CodeMasters', 'AppGenius'][index]}</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#6A38C2] h-2 rounded-full" 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-6 border-[#6A38C2] text-[#6A38C2] hover:bg-[#6A38C2]/10"
                onClick={() => navigate('/ai-coach/job-matching')}
              >
                View All Matches
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AiCoachHome