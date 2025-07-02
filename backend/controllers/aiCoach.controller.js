import { AiCoachSession, ResumeTemplate, UserResume, MockInterview, SkillGapAnalysis, CareerPath } from "../models/aiCoach.model.js";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";

// Mock function for OpenAI API integration
// In production, this would be replaced with actual OpenAI API calls
const generateAIResponse = async (prompt, context = [], model = "gpt-4") => {
    // This is a placeholder for the actual OpenAI API call
    // In a real implementation, you would use the OpenAI SDK
    console.log(`AI Request - Model: ${model}, Prompt: ${prompt.substring(0, 50)}...`);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock response based on session type
    if (prompt.includes("resume") || prompt.includes("CV")) {
        return "I've analyzed your resume and have some suggestions to improve it. Consider highlighting your achievements with quantifiable results and tailoring your skills section to match the job descriptions you're targeting.";
    } else if (prompt.includes("interview")) {
        return "For interview preparation, remember to use the STAR method (Situation, Task, Action, Result) when answering behavioral questions. Also, research the company thoroughly and prepare questions to ask the interviewer.";
    } else if (prompt.includes("skill") || prompt.includes("gap")) {
        return "Based on current job market trends, I recommend focusing on developing skills in data analysis, project management, and communication. These are highly sought after in your target industry.";
    } else if (prompt.includes("career path") || prompt.includes("roadmap")) {
        return "To progress in your career, consider these milestones: 1) Gain specialized experience in your current role, 2) Pursue relevant certifications, 3) Take on leadership responsibilities, 4) Network with industry professionals.";
    } else {
        return "I'm your AI Career Coach. I can help with resume building, interview preparation, skill gap analysis, and career path planning. What specific area would you like assistance with today?";
    }
};

// Create a new AI coach session
export const createAiCoachSession = async (req, res) => {
    try {
        const { sessionType } = req.body;
        const userId = req.user.id;

        // Initial system message based on session type
        let systemMessage = "I'm your AI Career Coach. How can I help you today?";
        
        switch(sessionType) {
            case 'resume_review':
                systemMessage = "I'll help you review and improve your resume. Please share your current resume or tell me about your experience and skills.";
                break;
            case 'interview_prep':
                systemMessage = "I'll help you prepare for interviews. What type of position are you interviewing for?";
                break;
            case 'skill_gap_analysis':
                systemMessage = "I'll help analyze your skills compared to job requirements. What position are you targeting?";
                break;
            case 'career_path_planning':
                systemMessage = "I'll help plan your career path. What's your current position and where do you want to be in the future?";
                break;
            default:
                systemMessage = "I'm your AI Career Coach. I can provide career advice, resume help, interview tips, and more. How can I assist you today?";
        }

        const newSession = new AiCoachSession({
            user: userId,
            sessionType,
            messages: [{
                role: 'system',
                content: systemMessage
            }]
        });

        await newSession.save();

        res.status(201).json({
            success: true,
            message: "AI Coach session created successfully",
            session: newSession
        });
    } catch (error) {
        console.error("Error creating AI Coach session:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create AI Coach session",
            error: error.message
        });
    }
};

// Get all sessions for a user
export const getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const sessions = await AiCoachSession.find({ user: userId })
            .sort({ updatedAt: -1 })
            .select('sessionType messages.content messages.timestamp isActive createdAt updatedAt');

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error("Error fetching user sessions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user sessions",
            error: error.message
        });
    }
};

// Get a specific session by ID
export const getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await AiCoachSession.findOne({ _id: sessionId, user: userId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error("Error fetching session:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch session",
            error: error.message
        });
    }
};

// Send a message to the AI coach
export const sendMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        // Find the session
        const session = await AiCoachSession.findOne({ _id: sessionId, user: userId });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        if (!session.isActive) {
            return res.status(400).json({
                success: false,
                message: "This session is no longer active"
            });
        }

        // Add user message to the session
        session.messages.push({
            role: 'user',
            content: message
        });

        // Get previous messages for context (limit to last 10 for simplicity)
        const contextMessages = session.messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Generate AI response
        const aiResponse = await generateAIResponse(message, contextMessages);

        // Add AI response to the session
        session.messages.push({
            role: 'assistant',
            content: aiResponse
        });

        await session.save();

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            response: aiResponse
        });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message
        });
    }
};

// Close a session
export const closeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await AiCoachSession.findOneAndUpdate(
            { _id: sessionId, user: userId },
            { isActive: false },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Session closed successfully",
            session
        });
    } catch (error) {
        console.error("Error closing session:", error);
        res.status(500).json({
            success: false,
            message: "Failed to close session",
            error: error.message
        });
    }
};

// Provide feedback for a session
export const provideFeedback = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const session = await AiCoachSession.findOneAndUpdate(
            { _id: sessionId, user: userId },
            { 
                feedback: {
                    rating,
                    comment
                }
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Feedback provided successfully",
            session
        });
    } catch (error) {
        console.error("Error providing feedback:", error);
        res.status(500).json({
            success: false,
            message: "Failed to provide feedback",
            error: error.message
        });
    }
};

// Resume Builder Controllers

// Get all resume templates
export const getResumeTemplates = async (req, res) => {
    try {
        const templates = await ResumeTemplate.find({ isActive: true })
            .select('name description previewImage category');

        res.status(200).json({
            success: true,
            templates
        });
    } catch (error) {
        console.error("Error fetching resume templates:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch resume templates",
            error: error.message
        });
    }
};

// Generate a resume using AI
export const generateResume = async (req, res) => {
    try {
        const { templateId, userData } = req.body;
        const userId = req.user.id;

        // Find the template
        const template = await ResumeTemplate.findById(templateId);
        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Template not found"
            });
        }

        // In a real implementation, you would use the OpenAI API to generate the resume content
        // For now, we'll just use the user data as is
        const resumeContent = {
            ...userData,
            generatedAt: new Date()
        };

        // Create a new user resume
        const userResume = new UserResume({
            user: userId,
            template: templateId,
            content: resumeContent,
            // In a real implementation, you would generate a PDF and store its URL
            generatedResume: "https://example.com/resume.pdf"
        });

        await userResume.save();

        res.status(201).json({
            success: true,
            message: "Resume generated successfully",
            resume: userResume
        });
    } catch (error) {
        console.error("Error generating resume:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate resume",
            error: error.message
        });
    }
};

// Get all user resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const resumes = await UserResume.find({ user: userId })
            .populate('template', 'name category')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            resumes
        });
    } catch (error) {
        console.error("Error fetching user resumes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user resumes",
            error: error.message
        });
    }
};

// Mock Interview Controllers

// Create a new mock interview
export const createMockInterview = async (req, res) => {
    try {
        const { jobTitle, interviewType } = req.body;
        const userId = req.user.id;

        // Generate interview questions based on job title and interview type
        // In a real implementation, you would use the OpenAI API to generate questions
        const questions = [
            { question: "Tell me about yourself." },
            { question: "Why are you interested in this position?" },
            { question: "Describe a challenging situation you faced at work and how you handled it." },
            { question: "What are your strengths and weaknesses?" },
            { question: "Where do you see yourself in 5 years?" }
        ];

        const mockInterview = new MockInterview({
            user: userId,
            jobTitle,
            interviewType,
            questions
        });

        await mockInterview.save();

        res.status(201).json({
            success: true,
            message: "Mock interview created successfully",
            interview: mockInterview
        });
    } catch (error) {
        console.error("Error creating mock interview:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create mock interview",
            error: error.message
        });
    }
};

// Submit answer for a mock interview question
export const submitInterviewAnswer = async (req, res) => {
    try {
        const { interviewId, questionIndex, answer } = req.body;
        const userId = req.user.id;

        const interview = await MockInterview.findOne({ _id: interviewId, user: userId });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        if (questionIndex < 0 || questionIndex >= interview.questions.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid question index"
            });
        }

        // Update the answer for the question
        interview.questions[questionIndex].answer = answer;

        // Generate feedback using AI
        // In a real implementation, you would use the OpenAI API
        const feedback = "Your answer was clear and structured. Consider providing more specific examples to strengthen your response.";
        const score = Math.floor(Math.random() * 5) + 6; // Random score between 6-10

        interview.questions[questionIndex].feedback = feedback;
        interview.questions[questionIndex].score = score;

        // Check if all questions have been answered
        const allAnswered = interview.questions.every(q => q.answer);
        if (allAnswered) {
            interview.isCompleted = true;
            
            // Generate overall feedback and score
            interview.overallFeedback = "You did well in the interview. Your responses were generally clear and relevant. Focus on providing more specific examples and quantifiable achievements in future interviews.";
            
            // Calculate average score
            const totalScore = interview.questions.reduce((sum, q) => sum + (q.score || 0), 0);
            interview.overallScore = Math.round(totalScore / interview.questions.length);
        }

        await interview.save();

        res.status(200).json({
            success: true,
            message: "Answer submitted successfully",
            feedback,
            score,
            isCompleted: interview.isCompleted,
            overallFeedback: interview.isCompleted ? interview.overallFeedback : null,
            overallScore: interview.isCompleted ? interview.overallScore : null
        });
    } catch (error) {
        console.error("Error submitting interview answer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit answer",
            error: error.message
        });
    }
};

// Get all user mock interviews
export const getUserInterviews = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const interviews = await MockInterview.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            interviews
        });
    } catch (error) {
        console.error("Error fetching user interviews:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user interviews",
            error: error.message
        });
    }
};

// Skill Gap Analysis Controllers

// Create a new skill gap analysis
export const createSkillGapAnalysis = async (req, res) => {
    try {
        const { targetJobTitle, targetJobDescription, userSkills } = req.body;
        const userId = req.user.id;

        // In a real implementation, you would use the OpenAI API to analyze skills
        // For now, we'll use a simple mock implementation
        
        // Mock required skills based on job title
        let requiredSkills = [];
        if (targetJobTitle.toLowerCase().includes('developer') || targetJobTitle.toLowerCase().includes('engineer')) {
            requiredSkills = ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Problem Solving', 'Communication'];
        } else if (targetJobTitle.toLowerCase().includes('designer')) {
            requiredSkills = ['Figma', 'Adobe XD', 'UI/UX', 'Typography', 'Color Theory', 'Wireframing', 'Prototyping'];
        } else if (targetJobTitle.toLowerCase().includes('manager')) {
            requiredSkills = ['Leadership', 'Project Management', 'Communication', 'Strategic Planning', 'Team Building', 'Conflict Resolution', 'Budgeting'];
        } else {
            requiredSkills = ['Communication', 'Problem Solving', 'Time Management', 'Teamwork', 'Adaptability', 'Critical Thinking', 'Organization'];
        }

        // Determine missing skills
        const userSkillsSet = new Set(userSkills.map(s => s.toLowerCase()));
        const missingSkills = requiredSkills
            .filter(skill => !userSkillsSet.has(skill.toLowerCase()))
            .map(skill => ({
                skill,
                importance: Math.random() > 0.7 ? 'critical' : (Math.random() > 0.5 ? 'important' : 'nice_to_have'),
                resources: [
                    {
                        title: `Learn ${skill} - Online Course`,
                        url: `https://example.com/courses/${skill.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'course'
                    },
                    {
                        title: `${skill} for Beginners - Article`,
                        url: `https://example.com/articles/${skill.toLowerCase().replace(/\s+/g, '-')}`,
                        type: 'article'
                    }
                ]
            }));

        // Generate analysis report
        const analysisReport = `
            # Skill Gap Analysis for ${targetJobTitle}

            ## Your Current Skills
            ${userSkills.join(', ')}

            ## Required Skills for ${targetJobTitle}
            ${requiredSkills.join(', ')}

            ## Missing Skills
            ${missingSkills.map(s => `- ${s.skill} (${s.importance})`).join('\n')}

            ## Recommendations
            Based on your current skill set, we recommend focusing on acquiring the missing skills, particularly those marked as 'critical' or 'important'. The resources provided for each skill can help you get started on your learning journey.
        `;

        const skillGapAnalysis = new SkillGapAnalysis({
            user: userId,
            targetJobTitle,
            targetJobDescription,
            userSkills,
            requiredSkills,
            missingSkills,
            analysisReport,
            isCompleted: true
        });

        await skillGapAnalysis.save();

        res.status(201).json({
            success: true,
            message: "Skill gap analysis created successfully",
            analysis: skillGapAnalysis
        });
    } catch (error) {
        console.error("Error creating skill gap analysis:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create skill gap analysis",
            error: error.message
        });
    }
};

// Get all user skill gap analyses
export const getUserSkillGapAnalyses = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const analyses = await SkillGapAnalysis.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            analyses
        });
    } catch (error) {
        console.error("Error fetching user skill gap analyses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user skill gap analyses",
            error: error.message
        });
    }
};

// Career Path Planning Controllers

// Create a new career path plan
export const createCareerPath = async (req, res) => {
    try {
        const { currentPosition, targetPosition, timeframe } = req.body;
        const userId = req.user.id;

        // In a real implementation, you would use the OpenAI API to generate a career path
        // For now, we'll use a simple mock implementation
        
        // Generate milestones based on positions and timeframe
        let milestones = [];
        let totalMonths = 0;
        
        switch(timeframe) {
            case 'short_term': // 1 year
                totalMonths = 12;
                break;
            case 'mid_term': // 3 years
                totalMonths = 36;
                break;
            case 'long_term': // 5+ years
                totalMonths = 60;
                break;
            default:
                totalMonths = 36;
        }
        
        // Number of milestones based on timeframe
        const milestoneCount = Math.max(3, Math.ceil(totalMonths / 12));
        const monthsPerMilestone = Math.floor(totalMonths / milestoneCount);
        
        for (let i = 0; i < milestoneCount; i++) {
            const milestone = {
                title: i === milestoneCount - 1 ? targetPosition : `Step ${i + 1} towards ${targetPosition}`,
                description: `This milestone focuses on building the foundation needed to progress towards ${targetPosition}.`,
                skillsToAcquire: [
                    `Skill ${i * 3 + 1} for ${targetPosition}`,
                    `Skill ${i * 3 + 2} for ${targetPosition}`,
                    `Skill ${i * 3 + 3} for ${targetPosition}`
                ],
                estimatedTimeMonths: i === milestoneCount - 1 ? totalMonths - (i * monthsPerMilestone) : monthsPerMilestone,
                resources: [
                    {
                        title: `Resource 1 for Milestone ${i + 1}`,
                        url: "https://example.com/resource1",
                        type: "course"
                    },
                    {
                        title: `Resource 2 for Milestone ${i + 1}`,
                        url: "https://example.com/resource2",
                        type: "book"
                    }
                ]
            };
            
            milestones.push(milestone);
        }

        // Generate path report
        const pathReport = `
            # Career Path: ${currentPosition} to ${targetPosition}

            ## Overview
            This career path plan outlines the steps to progress from ${currentPosition} to ${targetPosition} over a ${timeframe.replace('_', ' ')} period.

            ## Milestones
            ${milestones.map((m, i) => `
            ### Milestone ${i + 1}: ${m.title}
            ${m.description}
            
            **Skills to Acquire:**
            ${m.skillsToAcquire.map(s => `- ${s}`).join('\n')}
            
            **Estimated Time:** ${m.estimatedTimeMonths} months
            `).join('\n')}

            ## Recommendations
            Focus on completing each milestone before moving to the next. The resources provided for each milestone can help you acquire the necessary skills and knowledge.
        `;

        const careerPath = new CareerPath({
            user: userId,
            currentPosition,
            targetPosition,
            timeframe,
            milestones,
            pathReport,
            isCompleted: true
        });

        await careerPath.save();

        res.status(201).json({
            success: true,
            message: "Career path created successfully",
            careerPath
        });
    } catch (error) {
        console.error("Error creating career path:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create career path",
            error: error.message
        });
    }
};

// Get all user career paths
export const getUserCareerPaths = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const careerPaths = await CareerPath.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            careerPaths
        });
    } catch (error) {
        console.error("Error fetching user career paths:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user career paths",
            error: error.message
        });
    }
};

// Smart Job Matching Controller

// Get job recommendations based on user profile
export const getJobRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Get user skills
        const userSkills = user.profile.skills || [];
        
        // In a real implementation, you would use a vector database like Pinecone
        // to find jobs that match the user's skills and interests
        // For now, we'll use a simple keyword matching approach
        
        // Find jobs that match user skills
        const matchingJobs = await Job.find({
            $or: [
                { requirements: { $in: userSkills.map(skill => new RegExp(skill, 'i')) } },
                { title: { $in: userSkills.map(skill => new RegExp(skill, 'i')) } },
                { description: { $in: userSkills.map(skill => new RegExp(skill, 'i')) } }
            ]
        }).populate('company', 'name logo');
        
        // Calculate match score for each job
        const jobsWithScore = matchingJobs.map(job => {
            // Count how many user skills match job requirements
            const matchingSkillsCount = userSkills.filter(skill => {
                const skillRegex = new RegExp(skill, 'i');
                return job.requirements.some(req => skillRegex.test(req)) || 
                       skillRegex.test(job.title) || 
                       skillRegex.test(job.description);
            }).length;
            
            // Calculate match percentage
            const matchScore = userSkills.length > 0 ? 
                Math.round((matchingSkillsCount / userSkills.length) * 100) : 0;
            
            return {
                ...job.toObject(),
                matchScore
            };
        });
        
        // Sort by match score (highest first)
        jobsWithScore.sort((a, b) => b.matchScore - a.matchScore);
        
        res.status(200).json({
            success: true,
            recommendations: jobsWithScore
        });
    } catch (error) {
        console.error("Error getting job recommendations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get job recommendations",
            error: error.message
        });
    }
};