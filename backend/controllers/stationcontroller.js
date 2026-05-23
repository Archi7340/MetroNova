const { runEngine } = require('../utils/graphRunner');

// GET /api/stations
exports.getAllStations = async (_req, res) => {
  try {
    const stations = await runEngine(['stations']);
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/stations/interchanges
exports.getInterchanges = async (_req, res) => {
  try {
    const interchanges = await runEngine(['interchanges']);
    res.json(interchanges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/stations/:id/neighbors
exports.getNeighbors = async (req, res) => {
  try {
    const neighbors = await runEngine(['neighbors', req.params.id]);
    res.json(neighbors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/stations/connectivity
exports.getConnectivity = async (_req, res) => {
  try {
    const result = await runEngine(['connectivity']);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};