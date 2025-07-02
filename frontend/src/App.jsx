import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/shared/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Home from './components/Home'
import Jobs from './components/Jobs'
import Browse from './components/Browse'
import Profile from './components/Profile'
import JobDescription from './components/JobDescription'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from './components/admin/PostJob'
import Applicants from './components/admin/Applicants'
import ProtectedRoute from './components/admin/ProtectedRoute'

// AI Coach Components
import AiCoachHome from './components/aicoach/AiCoachHome'
import AiChat from './components/aicoach/AiChat'
import ResumeBuilder from './components/aicoach/ResumeBuilder'
import MockInterview from './components/aicoach/MockInterview'
import SkillGapAnalysis from './components/aicoach/SkillGapAnalysis'
import CareerPathPlanning from './components/aicoach/CareerPathPlanning'
import JobMatching from './components/aicoach/JobMatching'


const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: "/jobs",
    element: <Jobs />
  },
  {
    path: "/description/:id",
    element: <JobDescription />
  },
  {
    path: "/browse",
    element: <Browse />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  // admin ke liye yha se start hoga
  {
    path:"/admin/companies",
    element: <ProtectedRoute><Companies/></ProtectedRoute>
  },
  {
    path:"/admin/companies/create",
    element: <ProtectedRoute><CompanyCreate/></ProtectedRoute> 
  },
  {
    path:"/admin/companies/:id",
    element:<ProtectedRoute><CompanySetup/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs",
    element:<ProtectedRoute><AdminJobs/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/create",
    element:<ProtectedRoute><PostJob/></ProtectedRoute> 
  },
  {
    path:"/admin/jobs/:id/applicants",
    element:<ProtectedRoute><Applicants/></ProtectedRoute> 
  },
  // AI Coach Routes
  {
    path: "/ai-coach",
    element: <ProtectedRoute><AiCoachHome/></ProtectedRoute>
  },
  {
    path: "/ai-coach/chat",
    element: <ProtectedRoute><AiChat/></ProtectedRoute>
  },
  {
    path: "/ai-coach/resume",
    element: <ProtectedRoute><ResumeBuilder/></ProtectedRoute>
  },
  {
    path: "/ai-coach/interview",
    element: <ProtectedRoute><MockInterview/></ProtectedRoute>
  },
  {
    path: "/ai-coach/skill-gap",
    element: <ProtectedRoute><SkillGapAnalysis/></ProtectedRoute>
  },
  {
    path: "/ai-coach/career-path",
    element: <ProtectedRoute><CareerPathPlanning/></ProtectedRoute>
  },
  {
    path: "/ai-coach/job-matching",
    element: <ProtectedRoute><JobMatching/></ProtectedRoute>
  }
])
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
