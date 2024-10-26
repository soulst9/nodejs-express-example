const mongoose = require("mongoose");

const surveyQuestionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true,
    describe: "설문지 질문 번호",
  },
  text: {
    type: String,
    required: true,
    describe: "설문지 질문 내용",
  },
  type: {
    type: String,
    required: true,
    enum: ["selectOne", "multiSelect"],
    describe: "설문지 질문 타입",
  },
  contents: [
    {
      contentNumber: {
        type: Number,
        required: true,
        describe: "설문지 질문 보기 번호",
      },
      contentText: {
        type: String,
        required: true,
        describe: "설문지 질문 보기 내용",
      },
      image: {
        type: String,
        required: false,
        describe: "설문지 질문 보기 이미지",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 질문 생성일",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 질문 수정일",
  },
});

surveyQuestionSchema.index({ questionNumber: 1 });

module.exports = mongoose.model(
  "SurveyQuestion",
  surveyQuestionSchema,
  "surveyQuestion"
);

/**
 * 잘문 예시 1
 *   {
 *     "questionNumber": 0,
 *     "text": "유입 경로",
 *     "contents": [
 *       {
 *         "contentNumber": 0,
 *         "contentText": "인터넷 검색"
 *       },
 *       {
 *         "contentNumber": 1,
 *         "contentText": "광고"
 *       },
 *       {
 *         "contentNumber": 2,
 *         "contentText": "지인 추천"
 *       },
 *       {
 *         "contentNumber": 3,
 *         "contentText": "기타"
 *       }
 *     ],
 *     "createdAt": "2021-01-01T00:00:00.000Z",
 *     "updatedAt": "2021-01-01T00:00:00.000Z"
 *   }
 *
 * 잘문 예시 2
 *   {
 *     "questionNumber": 1,
 *     "text": "이용 만족도",
 *     "contents": [
 *       {
 *         "contentNumber": 0,
 *         "contentText": "얼마나 만족하셨나요?"
 *       },
 *       {
 *         "contentNumber": 1,
 *         "contentText": "앞으로도 이용하실 의향이 있으신가요?"
 *       },
 *     ],
 *    "createdAt": "2021-01-01T00:00:00.000Z",
 *    "updatedAt": "2021-01-01T00:00:00.000Z"
 *   }
 *
 */
