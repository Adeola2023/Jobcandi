import React, { useState, useEffect } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { FileText, Download, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { AI_COACH_API_END_POINT } from '@/utils/constant'

const ResumeBuilder = () => {
  const { user } = useSelector(store => store.auth)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [userResumes, setUserResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [generatingResume, setGeneratingResume] = useState(false)
  const [activeTab, setActiveTab] = useState('templates') // 'templates', 'editor', 'myResumes'
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: user?.fullname || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      location: '',
      linkedIn: '',
      website: ''
    },
    summary: '',
    experience: [
      { company: '', position: '', startDate: '', endDate: '', description: '', skills: [] }
    ],
    education: [
      { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }
    ],
    skills: [],
    certifications: [
      { name: '', issuer: '', date: '', description: '' }
    ],
    languages: [],
    projects: [
      { title: '', description: '', technologies: [], link: '' }
    ]
  })

  // Fetch templates and user resumes on component mount
  useEffect(() => {
    fetchTemplates()
    fetchUserResumes()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/resume/templates`, {
        withCredentials: true
      })
      if (res.data.success) {
        setTemplates(res.data.templates)
      }
    } catch (error) {
      console.error('Error fetching resume templates:', error)
      toast.error('Failed to fetch resume templates')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserResumes = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${AI_COACH_API_END_POINT}/resume`, {
        withCredentials: true
      })
      if (res.data.success) {
        setUserResumes(res.data.resumes)
      }
    } catch (error) {
      console.error('Error fetching user resumes:', error)
      toast.error('Failed to fetch your resumes')
    } finally {
      setLoading(false)
    }
  }

  const selectTemplate = (template) => {
    setSelectedTemplate(template)
    setActiveTab('editor')
  }

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      // For array fields like experience, education, etc.
      setResumeData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }))
    } else if (section === 'personalInfo') {
      // For nested personal info fields
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      }))
    } else {
      // For direct fields like summary
      setResumeData(prev => ({
        ...prev,
        [section]: value
      }))
    }
  }

  const addListItem = (section) => {
    let newItem
    switch (section) {
      case 'experience':
        newItem = { company: '', position: '', startDate: '', endDate: '', description: '', skills: [] }
        break
      case 'education':
        newItem = { institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }
        break
      case 'certifications':
        newItem = { name: '', issuer: '', date: '', description: '' }
        break
      case 'projects':
        newItem = { title: '', description: '', technologies: [], link: '' }
        break
      default:
        newItem = {}
    }

    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }

  const removeListItem = (section, index) => {
    setResumeData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean)
    setResumeData(prev => ({
      ...prev,
      skills: skillsArray
    }))
  }

  const handleLanguagesChange = (value) => {
    const languagesArray = value.split(',').map(language => language.trim()).filter(Boolean)
    setResumeData(prev => ({
      ...prev,
      languages: languagesArray
    }))
  }

  const generateResume = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first')
      return
    }

    try {
      setGeneratingResume(true)
      const res = await axios.post(`${AI_COACH_API_END_POINT}/resume/generate`, {
        templateId: selectedTemplate._id,
        userData: resumeData
      }, {
        withCredentials: true
      })
      if (res.data.success) {
        toast.success('Resume generated successfully')
        fetchUserResumes() // Refresh the list of user resumes
        setActiveTab('myResumes') // Switch to My Resumes tab
      }
    } catch (error) {
      console.error('Error generating resume:', error)
      toast.error('Failed to generate resume')
    } finally {
      setGeneratingResume(false)
    }
  }

  // Mock function for downloading resume (in a real app, this would download the actual file)
  const downloadResume = (resume) => {
    toast.success('Resume download started')
    // In a real implementation, this would trigger a file download
    window.open(resume.generatedResume, '_blank')
  }

  // Render template selection view
  const renderTemplateSelection = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Choose a Resume Template</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No templates available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* In a real implementation, these would be actual templates from the API */}
          {[
            { id: '1', name: 'Professional', category: 'professional', description: 'Clean and professional template suitable for corporate roles' },
            { id: '2', name: 'Creative', category: 'creative', description: 'Modern design for creative industries and startups' },
            { id: '3', name: 'Academic', category: 'academic', description: 'Detailed template for academic and research positions' },
            { id: '4', name: 'Minimal', category: 'professional', description: 'Simple and elegant design focusing on content' },
            { id: '5', name: 'Executive', category: 'executive', description: 'Sophisticated template for senior positions' },
            { id: '6', name: 'Entry Level', category: 'entry_level', description: 'Perfect for students and recent graduates' }
          ].map((template) => (
            <div 
              key={template.id}
              className="border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md"
              onClick={() => selectTemplate(template)}
            >
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{template.description}</p>
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
                  {template.category.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render resume editor view
  const renderResumeEditor = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Resume Editor</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('templates')}
          >
            Change Template
          </Button>
          <Button 
            className="bg-[#6A38C2]"
            onClick={generateResume}
            disabled={generatingResume}
          >
            {generatingResume ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Resume</>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                value={resumeData.personalInfo.fullName} 
                onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={resumeData.personalInfo.email} 
                onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                value={resumeData.personalInfo.phone} 
                onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} 
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={resumeData.personalInfo.location} 
                onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)} 
                placeholder="City, Country" 
              />
            </div>
            <div>
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input 
                id="linkedIn" 
                value={resumeData.personalInfo.linkedIn} 
                onChange={(e) => handleInputChange('personalInfo', 'linkedIn', e.target.value)} 
                placeholder="linkedin.com/in/username" 
              />
            </div>
            <div>
              <Label htmlFor="website">Website/Portfolio</Label>
              <Input 
                id="website" 
                value={resumeData.personalInfo.website} 
                onChange={(e) => handleInputChange('personalInfo', 'website', e.target.value)} 
                placeholder="yourwebsite.com" 
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Professional Summary</h3>
          <Textarea 
            value={resumeData.summary} 
            onChange={(e) => handleInputChange('summary', null, e.target.value)} 
            placeholder="Write a compelling summary of your professional background and key strengths..."
            className="min-h-[120px]"
          />
        </div>

        {/* Work Experience */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Work Experience</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addListItem('experience')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Experience
            </Button>
          </div>
          
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Experience {index + 1}</h4>
                {resumeData.experience.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeListItem('experience', index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Company</Label>
                  <Input 
                    value={exp.company} 
                    onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input 
                    value={exp.position} 
                    onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="month" 
                    value={exp.startDate} 
                    onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="month" 
                    value={exp.endDate} 
                    onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)} 
                    placeholder="Present (if current)" 
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <Label>Description</Label>
                <Textarea 
                  value={exp.description} 
                  onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)} 
                  placeholder="Describe your responsibilities and achievements..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div>
                <Label>Skills Used (comma separated)</Label>
                <Input 
                  value={exp.skills.join(', ')} 
                  onChange={(e) => handleInputChange('experience', 'skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean), index)} 
                  placeholder="JavaScript, React, Project Management, etc." 
                />
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Education</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addListItem('education')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Education
            </Button>
          </div>
          
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">Education {index + 1}</h4>
                {resumeData.education.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeListItem('education', index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Institution</Label>
                  <Input 
                    value={edu.institution} 
                    onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input 
                    value={edu.degree} 
                    onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>Field of Study</Label>
                  <Input 
                    value={edu.fieldOfStudy} 
                    onChange={(e) => handleInputChange('education', 'fieldOfStudy', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input 
                    type="month" 
                    value={edu.startDate} 
                    onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)} 
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input 
                    type="month" 
                    value={edu.endDate} 
                    onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)} 
                    placeholder="Present (if current)" 
                  />
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={edu.description} 
                  onChange={(e) => handleInputChange('education', 'description', e.target.value, index)} 
                  placeholder="Describe your academic achievements, relevant coursework, etc."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Skills</h3>
          <Textarea 
            value={resumeData.skills.join(', ')} 
            onChange={(e) => handleSkillsChange(e.target.value)} 
            placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Project Management, etc.)"
          />
          
          {resumeData.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-[#6A38C2]/10 text-[#6A38C2] rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold mb-4">Languages</h3>
          <Textarea 
            value={resumeData.languages.join(', ')} 
            onChange={(e) => handleLanguagesChange(e.target.value)} 
            placeholder="Enter languages you know separated by commas (e.g., English (Native), Spanish (Intermediate), etc.)"
          />
          
          {resumeData.languages.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {resumeData.languages.map((language, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {language}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generate Resume Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-[#6A38C2]"
            size="lg"
            onClick={generateResume}
            disabled={generatingResume}
          >
            {generatingResume ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Resume...
              </>
            ) : (
              <>Generate Resume</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )

  // Render my resumes view
  const renderMyResumes = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Resumes</h2>
        <Button 
          className="bg-[#6A38C2]"
          onClick={() => setActiveTab('templates')}
        >
          Create New Resume
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#6A38C2]" />
        </div>
      ) : userResumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-4">You haven't created any resumes yet</p>
          <Button 
            className="bg-[#6A38C2]"
            onClick={() => setActiveTab('templates')}
          >
            Create Your First Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* In a real implementation, these would be the user's actual resumes */}
          {[
            { id: '1', name: 'Software Developer Resume', template: { name: 'Professional' }, createdAt: '2023-08-15T12:00:00Z', generatedResume: '#' },
            { id: '2', name: 'UX Designer Resume', template: { name: 'Creative' }, createdAt: '2023-09-20T14:30:00Z', generatedResume: '#' },
            { id: '3', name: 'Project Manager Resume', template: { name: 'Executive' }, createdAt: '2023-10-05T09:15:00Z', generatedResume: '#' }
          ].map((resume) => (
            <div key={resume.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-bold">{resume.name}</h3>
                <div className="flex justify-between items-center mt-2 mb-4">
                  <span className="text-sm text-gray-500">
                    Template: {resume.template.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  className="w-full bg-[#6A38C2]"
                  onClick={() => downloadResume(resume)}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              </div>
            </div>
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
          <h1 className="text-3xl font-bold mb-2">AI Resume Builder</h1>
          <p className="text-gray-600">
            Create professional resumes tailored to your target jobs with our AI-powered resume builder.
          </p>
        </div>

        <div className="flex border-b mb-8">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'text-[#6A38C2] border-b-2 border-[#6A38C2]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('templates')}
          >
            Choose Template
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'editor' ? 'text-[#6A38C2] border-b-2 border-[#6A38C2]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('editor')}
            disabled={!selectedTemplate}
          >
            Resume Editor
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'myResumes' ? 'text-[#6A38C2] border-b-2 border-[#6A38C2]' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('myResumes')}
          >
            My Resumes
          </button>
        </div>

        {activeTab === 'templates' && renderTemplateSelection()}
        {activeTab === 'editor' && renderResumeEditor()}
        {activeTab === 'myResumes' && renderMyResumes()}
      </div>
      <Footer />
    </div>
  )
}

export default ResumeBuilder