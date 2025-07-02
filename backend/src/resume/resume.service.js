const Resume = require('./resume.model');

exports.createResume = async (resumeData) => {
  const resume = new Resume(resumeData);
  await resume.save();
  return resume;
};

exports.getUserResumes = async (userId) => {
  return Resume.find({ user: userId });
};
