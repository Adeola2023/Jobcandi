import { createSlice } from "@reduxjs/toolkit";

const aiCoachSlice = createSlice({
    name: "aiCoach",
    initialState: {
        sessions: [],
        currentSession: null,
        resumes: [],
        resumeTemplates: [],
        interviews: [],
        skillGapAnalyses: [],
        careerPaths: [],
        jobRecommendations: [],
        userSkills: [],
        skillSuggestions: [],
        loading: false,
        error: null,
        integrationState: {
            lastSkillUpdate: null,
            lastResumeUpdate: null,
            lastCareerPathUpdate: null,
            lastSkillGapUpdate: null,
            syncStatus: 'idle' // 'idle', 'syncing', 'success', 'error'
        }
    },
    reducers: {
        // Session actions
        setSessions: (state, action) => {
            state.sessions = action.payload;
        },
        setCurrentSession: (state, action) => {
            state.currentSession = action.payload;
        },
        addMessage: (state, action) => {
            if (state.currentSession) {
                state.currentSession.messages.push(action.payload);
            }
        },
        
        // Resume actions
        setResumes: (state, action) => {
            state.resumes = action.payload;
        },
        setResumeTemplates: (state, action) => {
            state.resumeTemplates = action.payload;
        },
        addResume: (state, action) => {
            state.resumes.push(action.payload);
        },
        
        // Interview actions
        setInterviews: (state, action) => {
            state.interviews = action.payload;
        },
        addInterview: (state, action) => {
            state.interviews.push(action.payload);
        },
        updateInterview: (state, action) => {
            const index = state.interviews.findIndex(interview => interview._id === action.payload._id);
            if (index !== -1) {
                state.interviews[index] = action.payload;
            }
        },
        
        // Skill gap analysis actions
        setSkillGapAnalyses: (state, action) => {
            state.skillGapAnalyses = action.payload;
        },
        addSkillGapAnalysis: (state, action) => {
            state.skillGapAnalyses.push(action.payload);
        },
        
        // Career path actions
        setCareerPaths: (state, action) => {
            state.careerPaths = action.payload;
        },
        addCareerPath: (state, action) => {
            state.careerPaths.push(action.payload);
        },
        
        // Job recommendation actions
        setJobRecommendations: (state, action) => {
            state.jobRecommendations = action.payload;
        },
        
        // User skills actions
        setUserSkills: (state, action) => {
            state.userSkills = action.payload;
            state.integrationState.lastSkillUpdate = new Date().toISOString();
        },
        addUserSkill: (state, action) => {
            if (!state.userSkills.includes(action.payload)) {
                state.userSkills.push(action.payload);
                state.integrationState.lastSkillUpdate = new Date().toISOString();
            }
        },
        removeUserSkill: (state, action) => {
            state.userSkills = state.userSkills.filter(skill => skill !== action.payload);
            state.integrationState.lastSkillUpdate = new Date().toISOString();
        },
        setSkillSuggestions: (state, action) => {
            state.skillSuggestions = action.payload;
        },
        
        // Integration state actions
        setIntegrationState: (state, action) => {
            state.integrationState = { ...state.integrationState, ...action.payload };
        },
        setSyncStatus: (state, action) => {
            state.integrationState.syncStatus = action.payload;
        },
        
        // Loading and error states
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    }
});

export const {
    setSessions,
    setCurrentSession,
    addMessage,
    setResumes,
    setResumeTemplates,
    addResume,
    setInterviews,
    addInterview,
    updateInterview,
    setSkillGapAnalyses,
    addSkillGapAnalysis,
    setCareerPaths,
    addCareerPath,
    setJobRecommendations,
    setUserSkills,
    addUserSkill,
    removeUserSkill,
    setSkillSuggestions,
    setIntegrationState,
    setSyncStatus,
    setLoading,
    setError
} = aiCoachSlice.actions;

export default aiCoachSlice.reducer;