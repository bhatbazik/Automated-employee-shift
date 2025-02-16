const express = require('express');
const { protect } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.use(protect);

router.get('/profile', employeeController.getProfile);
router.post('/availability', employeeController.updateAvailability);
router.get('/shifts', employeeController.getShifts);

module.exports = router;