const ResumeService = require('./resume.service');

exports.create = async (req, res) => {
  try {
    const resume = await ResumeService.createResume({
      user: req.user.id,
      fileUrl: req.body.fileUrl
    });
    res.status(201).json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const resumes = await ResumeService.getUserResumes(req.user.id);
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
