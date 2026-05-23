const { runEngine } = require('../utils/graphRunner');
const Route = require('../models/Route');

// GET /api/route?from=1&to=65&algo=dijkstra
exports.getRoute = async (req, res) => {
  try {
    const { from, to, algo = 'dijkstra' } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: 'from and to query params are required' });
    }
    if (!['dijkstra', 'bfs'].includes(algo)) {
      return res.status(400).json({ error: 'algo must be dijkstra or bfs' });
    }

    const result = await runEngine(['route', algo, String(from), String(to)]);

    // Persist search history (fire-and-forget)
    if (result.found) {
      Route.create({
        from:      parseInt(from),
        to:        parseInt(to),
        algorithm: algo,
        totalTime: result.totalTime,
        fare:      result.fare,
        stops:     result.stops,
        path:      result.path.map((s) => s.id),
      }).catch(() => {}); // non-critical
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/route/history?limit=10
exports.getHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const history = await Route.find().sort({ searchedAt: -1 }).limit(limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/route/compare?from=1&to=65
// Runs both algorithms and returns side-by-side results
exports.compareRoutes = async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'from and to are required' });
    }

    const [dijkstraResult, bfsResult] = await Promise.all([
      runEngine(['route', 'dijkstra', String(from), String(to)]),
      runEngine(['route', 'bfs', String(from), String(to)]),
    ]);

    res.json({ dijkstra: dijkstraResult, bfs: bfsResult });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};