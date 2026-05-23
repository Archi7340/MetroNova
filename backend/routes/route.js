const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/routeController');

router.get('/',        ctrl.getRoute);
router.get('/history', ctrl.getHistory);
router.get('/compare', ctrl.compareRoutes);

module.exports = router;