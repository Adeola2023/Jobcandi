import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '@/utils/constant';
import {
  setUserSkills,
  setSkillSuggestions,
  setSyncStatus,
  setIntegrationState
} from '@/redux/aiCoachSlice';

/**
 * Custom hook for synchronizing skills across AI Coach features
 * This hook handles:
 * 1. Loading user skills from profile
 * 2. Syncing skills between features
 * 3. Updating user profile when skills change
 * 4. Providing skill suggestions based on user data
 */
const useSkillSync = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const {
    userSkills,
    resumes,
    interviews,
    skillGapAnalyses,
    careerPaths,
    integrationState
  } = useSelector(state => state.aiCoach);

  // Load user skills from profile on initial load
  useEffect(() => {
    if (user && user.profile && user.profile.skills && user.profile.skills.length > 0) {
      dispatch(setUserSkills(user.profile.skills));
    }
  }, [user, dispatch]);

  // Sync skills with user profile when they change
  useEffect(() => {
    const syncSkillsWithProfile = async () => {
      if (!user || !userSkills.length) return;
      
      try {
        dispatch(setSyncStatus('syncing'));
        
        // Update user profile with current skills
        await axios.put(`${USER_API_END_POINT}/update-profile`, {
          skills: userSkills
        }, { withCredentials: true });
        
        dispatch(setSyncStatus('success'));
        dispatch(setIntegrationState({ lastSkillUpdate: new Date().toISOString() }));
      } catch (error) {
        console.error('Error syncing skills with profile:', error);
        dispatch(setSyncStatus('error'));
        toast.error('Failed to sync skills with your profile');
      }
    };

    // Only sync if skills have changed (check against lastSkillUpdate timestamp)
    if (userSkills.length > 0 && integrationState.syncStatus !== 'syncing') {
      syncSkillsWithProfile();
    }
  }, [userSkills, user, dispatch, integrationState.syncStatus]);

  // Generate skill suggestions based on user data
  useEffect(() => {
    const generateSkillSuggestions = () => {
      // Collect skills from various features
      const allSkills = new Set();
      
      // Add skills from resumes
      resumes.forEach(resume => {
        if (resume.skills && Array.isArray(resume.skills)) {
          resume.skills.forEach(skill => allSkills.add(skill));
        }
      });
      
      // Add skills from career paths
      careerPaths.forEach(path => {
        if (path.milestones && Array.isArray(path.milestones)) {
          path.milestones.forEach(milestone => {
            if (milestone.skillsToAcquire && Array.isArray(milestone.skillsToAcquire)) {
              milestone.skillsToAcquire.forEach(skill => allSkills.add(skill));
            }
          });
        }
      });
      
      // Add skills from skill gap analyses
      skillGapAnalyses.forEach(analysis => {
        if (analysis.requiredSkills && Array.isArray(analysis.requiredSkills)) {
          analysis.requiredSkills.forEach(skill => allSkills.add(skill));
        }
      });
      
      // Filter out skills the user already has
      const suggestions = [...allSkills].filter(skill => !userSkills.includes(skill));
      
      // Update suggestions in state
      dispatch(setSkillSuggestions(suggestions));
    };
    
    generateSkillSuggestions();
  }, [resumes, careerPaths, skillGapAnalyses, userSkills, dispatch]);

  return {
    userSkills,
    syncStatus: integrationState.syncStatus,
    lastUpdate: integrationState.lastSkillUpdate
  };
};

export default useSkillSync;