const JobService = require('./job.service');

exports.create = async (req, res) => {
  try {
    const job = await JobService.createJob(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const jobs = await JobService.getAllJobs();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
