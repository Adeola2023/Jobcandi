import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
    createAiCoachSession,
    getUserSessions,
    getSessionById,
    sendMessage,
    closeSession,
    provideFeedback,
    getResumeTemplates,
    generateResume,
    getUserResumes,
    createMockInterview,
    submitInterviewAnswer,
    getUserInterviews,
    createSkillGapAnalysis,
    getUserSkillGapAnalyses,
    createCareerPath,
    getUserCareerPaths,
    getJobRecommendations
} from "../controllers/aiCoach.controller.js";

const router = express.Router();

// AI Coach Session Routes
router.post("/sessions", isAuthenticated, createAiCoachSession);
router.get("/sessions", isAuthenticated, getUserSessions);
router.get("/sessions/:sessionId", isAuthenticated, getSessionById);
router.post("/sessions/:sessionId/messages", isAuthenticated, sendMessage);
router.put("/sessions/:sessionId/close", isAuthenticated, closeSession);
router.post("/sessions/:sessionId/feedback", isAuthenticated, provideFeedback);

// Resume Builder Routes
router.get("/resume/templates", isAuthenticated, getResumeTemplates);
router.post("/resume/generate", isAuthenticated, generateResume);
router.get("/resume", isAuthenticated, getUserResumes);

// Mock Interview Routes
router.post("/interview", isAuthenticated, createMockInterview);
router.post("/interview/answer", isAuthenticated, submitInterviewAnswer);
router.get("/interview", isAuthenticated, getUserInterviews);

// Skill Gap Analysis Routes
router.post("/skill-gap", isAuthenticated, createSkillGapAnalysis);
router.get("/skill-gap", isAuthenticated, getUserSkillGapAnalyses);

// Career Path Planning Routes
router.post("/career-path", isAuthenticated, createCareerPath);
router.get("/career-path", isAuthenticated, getUserCareerPaths);

// Smart Job Matching Routes
router.get("/job-recommendations", isAuthenticated, getJobRecommendations);

export default router;