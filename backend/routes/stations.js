const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stationcontroller');

router.get('/',              ctrl.getAllStations);
router.get('/interchanges',  ctrl.getInterchanges);
router.get('/connectivity',  ctrl.getConnectivity);
router.get('/:id/neighbors', ctrl.getNeighbors);

module.exports = router;