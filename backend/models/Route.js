const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  from:        { type: Number, required: true },
  to:          { type: Number, required: true },
  algorithm:   { type: String, enum: ['dijkstra', 'bfs'], required: true },
  totalTime:   { type: Number },
  fare:        { type: Number },
  stops:       { type: Number },
  path:        [{ type: Number }],
  searchedAt:  { type: Date, default: Date.now },
});

RouteSchema.index({ from: 1, to: 1 });
RouteSchema.index({ searchedAt: -1 });

module.exports = mongoose.model('Route', RouteSchema);