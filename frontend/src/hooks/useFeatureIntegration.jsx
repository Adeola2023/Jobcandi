import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { setIntegrationState } from '@/redux/aiCoachSlice';

/**
 * Custom hook for cross-feature integration in AI Coach
 * 
 * This hook enables data sharing and integration between different AI Coach features:
 * - Resume Builder
 * - Mock Interview
 * - Skill Gap Analysis
 * - Career Path Planning
 * - Job Matching
 * - AI Chat
 * 
 * It provides methods to:
 * 1. Get relevant data from other features
 * 2. Suggest actions based on user's activities
 * 3. Track feature usage and suggest next steps
 */
const useFeatureIntegration = () => {
  const dispatch = useDispatch();
  const {
    resumes,
    interviews,
    skillGapAnalyses,
    careerPaths,
    jobRecommendations,
    sessions,
    userSkills,
    integrationState
  } = useSelector(state => state.aiCoach);
  
  // Track feature usage and update integration state
  useEffect(() => {
    const updateIntegrationState = () => {
      const newState = {};
      
      // Track last updates
      if (resumes.length > 0) {
        const lastResume = resumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        newState.lastResumeUpdate = lastResume.updatedAt;
      }
      
      if (careerPaths.length > 0) {
        const lastPath = careerPaths.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        newState.lastCareerPathUpdate = lastPath.updatedAt;
      }
      
      if (skillGapAnalyses.length > 0) {
        const lastAnalysis = skillGapAnalyses.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
        newState.lastSkillGapUpdate = lastAnalysis.updatedAt;
      }
      
      dispatch(setIntegrationState(newState));
    };
    
    updateIntegrationState();
  }, [resumes, careerPaths, skillGapAnalyses, dispatch]);
  
  /**
   * Get the most recent resume data
   */
  const getLatestResumeData = () => {
    if (resumes.length === 0) return null;
    
    return resumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  };
  
  /**
   * Get the most recent career path data
   */
  const getLatestCareerPathData = () => {
    if (careerPaths.length === 0) return null;
    
    return careerPaths.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  };
  
  /**
   * Get the most recent skill gap analysis
   */
  const getLatestSkillGapData = () => {
    if (skillGapAnalyses.length === 0) return null;
    
    return skillGapAnalyses.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
  };
  
  /**
   * Get recommended next steps based on user's activity
   */
  const getRecommendedNextSteps = () => {
    const recommendations = [];
    
    // If user has a resume but no skill gap analysis
    if (resumes.length > 0 && skillGapAnalyses.length === 0) {
      recommendations.push({
        feature: 'skillGap',
        title: 'Analyze your skill gaps',
        description: 'Based on your resume, we recommend analyzing your skill gaps to identify areas for improvement.'
      });
    }
    
    // If user has a skill gap analysis but no career path
    if (skillGapAnalyses.length > 0 && careerPaths.length === 0) {
      recommendations.push({
        feature: 'careerPath',
        title: 'Create a career path plan',
        description: 'Now that you know your skill gaps, create a career path plan to address them.'
      });
    }
    
    // If user has a career path but hasn't done a mock interview
    if (careerPaths.length > 0 && interviews.length === 0) {
      recommendations.push({
        feature: 'interview',
        title: 'Practice with a mock interview',
        description: 'Prepare for your next career step with a mock interview.'
      });
    }
    
    // If user has skills but no resume
    if (userSkills.length > 0 && resumes.length === 0) {
      recommendations.push({
        feature: 'resume',
        title: 'Create a resume',
        description: 'You have skills listed in your profile. Create a resume to showcase them.'
      });
    }
    
    return recommendations;
  };
  
  /**
   * Get job recommendations that match user's skills and career goals
   */
  const getRelevantJobRecommendations = () => {
    if (jobRecommendations.length === 0) return [];
    
    // If user has a career path, prioritize jobs that match the target position
    const latestCareerPath = getLatestCareerPathData();
    if (latestCareerPath) {
      const targetPosition = latestCareerPath.targetPosition.toLowerCase();
      
      return jobRecommendations
        .filter(job => {
          const jobTitle = job.title.toLowerCase();
          return jobTitle.includes(targetPosition) || targetPosition.includes(jobTitle);
        })
        .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Otherwise, just return jobs sorted by match score
    return [...jobRecommendations].sort((a, b) => b.matchScore - a.matchScore);
  };
  
  /**
   * Suggest interview questions based on job recommendations and career path
   */
  const getSuggestedInterviewQuestions = () => {
    const relevantJobs = getRelevantJobRecommendations().slice(0, 3);
    const latestCareerPath = getLatestCareerPathData();
    
    if (relevantJobs.length === 0 && !latestCareerPath) return [];
    
    // Generate mock questions based on job titles and requirements
    const questions = [];
    
    if (relevantJobs.length > 0) {
      relevantJobs.forEach(job => {
        questions.push(`Tell me about your experience with ${job.requirements[0] || 'this field'}.`);
        questions.push(`How would you handle ${job.title} responsibilities?`);
      });
    }
    
    if (latestCareerPath) {
      questions.push(`What steps are you taking to become a ${latestCareerPath.targetPosition}?`);
      questions.push(`What skills do you think are most important for a ${latestCareerPath.targetPosition}?`);
    }
    
    // Return unique questions
    return [...new Set(questions)];
  };
  
  return {
    getLatestResumeData,
    getLatestCareerPathData,
    getLatestSkillGapData,
    getRecommendedNextSteps,
    getRelevantJobRecommendations,
    getSuggestedInterviewQuestions,
    integrationState
  };
};

export default useFeatureIntegration;