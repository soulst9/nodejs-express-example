const mongoose = require("mongoose");

const GPSCommuteSchema = new mongoose.Schema({
  enterpriseId: {
    type: String,
    required: true,
  },
  employeeId: {
    type: String,
    required: true,
  },
  isAccepted: {
    type: Boolean,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  officeName: {
    type: String,
    default: null,
  },
  branch: {
    type: Number,
    default: null,
  },
  checkLocation: {
    type: {
      type: String,
      default: null,
    },
    coordinates: {
      type: [Number],
      default: null,
    },
  },
  officeLocation: {
    type: {
      type: String,
      default: null,
    },
    coordinates: {
      type: [Number],
      default: null,
    },
  },
  commuteStatus: {
    type: String,
  },
  distance: {
    type: Number,
    default: null,
  },
  maxDistance: {
    type: Number,
    default: null,
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

GPSCommuteSchema.index({ enterpriseId: 1, employeeId: 1 });
GPSCommuteSchema.index({ isAccepted: 1 });
GPSCommuteSchema.index({ createdAt: 1 });

module.exports = mongoose.model("GPSCommute", GPSCommuteSchema, "GPSCommute");
