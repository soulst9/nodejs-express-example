const mongoose = require("mongoose");

const GPSBranchMetaSchema = new mongoose.Schema({
  enterpriseId: {
    type: String,
    required: true,
  },
  lastBranch: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

GPSBranchMetaSchema.index({ enterpriseId: 1 }, { unique: true });

module.exports = mongoose.model(
  "GPSBranchMeta",
  GPSBranchMetaSchema,
  "GPSBranchMeta"
);
