const express = require('express');
const router = express.Router();
const ResumeController = require('./resume.controller');
const auth = require('../middlewares/auth');

router.post('/', auth, ResumeController.create);
router.get('/', auth, ResumeController.list);

module.exports = router;
