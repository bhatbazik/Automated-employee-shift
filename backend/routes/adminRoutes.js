const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/employees', adminController.getAllEmployees);
router.patch('/employees/:employeeId/seniority', adminController.updateEmployeeSeniority);
router.post('/schedule/generate', adminController.generateSchedule);

module.exports = router;
