const express = require('express');
const router = express.Router();
const JobController = require('./job.controller');

router.post('/', JobController.create);
router.get('/', JobController.list);

module.exports = router;
