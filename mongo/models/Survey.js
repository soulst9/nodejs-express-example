const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: true,
    describe: "설문지 제목",
  },
  description: {
    type: String,
    required: true,
    default: "",
    describe: "설문지 설명",
  },
  progression: {
    type: String,
    required: true,
    enum: ["active", "closed", "draft"],
    default: "draft",
    describe: "설문지 진행 상태",
  },
  questionIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SurveyQuestion",
      describe: "설문지 질문 Id",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 생성일",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 수정일",
  },
});

// title로 query를 할 것이기 때문에 index를 걸어준다.
surveySchema.index({ title: 1 });

module.exports = mongoose.model("Survey", surveySchema, "survey");
