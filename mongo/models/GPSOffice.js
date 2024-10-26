const mongoose = require("mongoose");

const GPSOfficeSchema = new mongoose.Schema({
  enterpriseId: {
    type: String,
    required: true,
  },
  enterpriseName: {
    type: String,
    required: true,
  },
  officeName: {
    type: String,
    required: true,
    default: "본사",
  },
  address: {
    type: String,
    required: true,
    default: "재설정이 필요합니다.",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  branch: {
    type: Number,
    required: true,
    default: 1,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  maxDistance: {
    type: Number,
    required: true,
    default: 50,
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

GPSOfficeSchema.index({ location: "2dsphere" });
GPSOfficeSchema.index({ enterpriseId: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model("GPSOffice", GPSOfficeSchema, "GPSOffice");
