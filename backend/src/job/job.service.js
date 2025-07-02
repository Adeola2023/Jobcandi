const Job = require('./job.model');

exports.createJob = async (jobData) => {
  const job = new Job(jobData);
  await job.save();
  return job;
};

exports.getAllJobs = async () => {
  return Job.find();
};
