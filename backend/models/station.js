const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true },
  name:        { type: String, required: true },
  line:        { type: String, required: true },
  interchange: { type: Boolean, default: false },
  x:           { type: Number },
  y:           { type: Number },
}, { timestamps: true });

StationSchema.index({ name: 'text' });
StationSchema.index({ line: 1 });
StationSchema.index({ interchange: 1 });

module.exports = mongoose.model('Station', StationSchema);