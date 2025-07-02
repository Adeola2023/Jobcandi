import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Sparkles } from 'lucide-react';
import { addUserSkill, removeUserSkill } from '@/redux/aiCoachSlice';
import useSkillSync from '@/hooks/useSkillSync';

/**
 * SkillManager Component
 * 
 * A reusable component for managing skills across AI Coach features
 * Provides consistent UI for adding, removing, and suggesting skills
 * 
 * @param {Object} props
 * @param {string} props.title - Title for the skills section
 * @param {boolean} props.showSuggestions - Whether to show skill suggestions
 * @param {function} props.onSkillsChange - Optional callback when skills change
 */
const SkillManager = ({ title = 'Skills', showSuggestions = true, onSkillsChange }) => {
  const dispatch = useDispatch();
  const [newSkill, setNewSkill] = useState('');
  const { userSkills, syncStatus } = useSkillSync();
  const { skillSuggestions } = useSelector(state => state.aiCoach);

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      dispatch(addUserSkill(newSkill.trim()));
      setNewSkill('');
      if (onSkillsChange) onSkillsChange([...userSkills, newSkill.trim()]);
    }
  };

  const handleRemoveSkill = (skill) => {
    dispatch(removeUserSkill(skill));
    if (onSkillsChange) onSkillsChange(userSkills.filter(s => s !== skill));
  };

  const handleAddSuggestion = (skill) => {
    dispatch(addUserSkill(skill));
    if (onSkillsChange) onSkillsChange([...userSkills, skill]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className="flex gap-2 mb-4">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
          />
          <Button onClick={handleAddSkill} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {/* Display sync status */}
        {syncStatus === 'syncing' && (
          <p className="text-xs text-muted-foreground mb-2">Syncing skills across features...</p>
        )}

        {/* Current skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {userSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          ) : (
            userSkills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Skill suggestions */}
      {showSuggestions && skillSuggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Suggested Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillSuggestions.slice(0, 5).map((skill, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleAddSuggestion(skill)}
              >
                + {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillManager;