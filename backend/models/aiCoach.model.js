import mongoose from "mongoose";

const aiCoachSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionType: {
        type: String,
        enum: ['career_advice', 'resume_review', 'interview_prep', 'skill_gap_analysis', 'career_path_planning'],
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant', 'system'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    feedback: {
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const AiCoachSession = mongoose.model("AiCoachSession", aiCoachSessionSchema);

const resumeTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    template: {
        type: String,
        required: true
    },
    previewImage: String,
    category: {
        type: String,
        enum: ['professional', 'creative', 'academic', 'entry_level', 'executive'],
        default: 'professional'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const ResumeTemplate = mongoose.model("ResumeTemplate", resumeTemplateSchema);

const userResumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResumeTemplate'
    },
    content: {
        type: Object,
        required: true
    },
    generatedResume: String, // URL to the generated resume file
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const UserResume = mongoose.model("UserResume", userResumeSchema);

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobTitle: String,
    interviewType: {
        type: String,
        enum: ['behavioral', 'technical', 'general', 'job_specific'],
        default: 'general'
    },
    questions: [{
        question: String,
        answer: String,
        feedback: String,
        score: Number
    }],
    overallFeedback: String,
    overallScore: Number,
    recordingUrl: String, // For video interviews
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const MockInterview = mongoose.model("MockInterview", mockInterviewSchema);

const skillGapAnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetJobTitle: String,
    targetJobDescription: String,
    userSkills: [String],
    requiredSkills: [String],
    missingSkills: [{
        skill: String,
        importance: {
            type: String,
            enum: ['critical', 'important', 'nice_to_have'],
            default: 'important'
        },
        resources: [{
            title: String,
            url: String,
            type: {
                type: String,
                enum: ['course', 'book', 'article', 'video', 'other'],
                default: 'course'
            }
        }]
    }],
    analysisReport: String,
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const SkillGapAnalysis = mongoose.model("SkillGapAnalysis", skillGapAnalysisSchema);

const careerPathSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentPosition: String,
    targetPosition: String,
    timeframe: {
        type: String,
        enum: ['short_term', 'mid_term', 'long_term'],
        default: 'mid_term'
    },
    milestones: [{
        title: String,
        description: String,
        skillsToAcquire: [String],
        estimatedTimeMonths: Number,
        resources: [{
            title: String,
            url: String,
            type: String
        }]
    }],
    pathReport: String,
    isCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const CareerPath = mongoose.model("CareerPath", careerPathSchema);