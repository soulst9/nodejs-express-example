const mongoose = require("mongoose");

const surveyAnswerSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
    describe: "설문지 Id",
  },
  userId: {
    type: String,
    required: true,
    describe: "유저 Id",
  },
  userType: {
    type: Number,
    required: false,
    describe: "유저 타입",
  },
  userName: {
    type: String,
    required: false,
    describe: "유저 이름",
  },
  userEmail: {
    type: String,
    required: false,
    describe: "유저 이메일",
  },
  birthday: {
    type: Date,
    required: false,
    describe: "유저 생년월일",
  },
  address: {
    type: String,
    required: false,
    describe: "유저 주소",
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    default: "other",
    required: false,
    describe: "유저 성별",
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurveyQuestion",
        describe: "설문지 질문 Id",
      },
      selectedContent: [
        {
          contentNumber: {
            type: Number,
            required: true,
            describe: "설문지 질문 보기 번호",
          },
          contentAnswer: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            describe: "설문지 질문 보기 답변",
          },
        },
      ],
    },
  ],
  comment: {
    type: String,
    required: false,
    default: "",
    describe: "설문지 응답자 의견",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 응답 생성일",
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    describe: "설문지 응답 수정일",
  },
});

surveyAnswerSchema.index({ surveyId: 1 });
surveyAnswerSchema.index({ userId: 1, userType: 1 });

/**
 * 첫 번째 인자: 모델 이름 (코드 내에서 해당 모델을 참조할 때 사용)
 * - PascalCase로 작성
 * - 단수형으로 작성
 *
 * 두 번째 인자: 스키마 (위에서 정의한 스키마)
 * - CamelCase로 작성
 * - 단수형으로 작성
 *
 * 세 번째 인자: 컬렉션 이름 (MongoDB에서 사용할 컬렉션 이름)
 * - CamelCase로 작성
 * - 단수형으로 작성 (일반적으로는 복수형으로 작성하지만, 이 프로젝트에서는 단수형으로 작성)
 */
module.exports = mongoose.model(
  "SurveyAnswer",
  surveyAnswerSchema,
  "surveyAnswer"
);

/**
 * 응답 예시 1
 * {
 *   // 예시 Survey
 *   "survey": "5f50c31f1234567890123456",
 *   "userId": "user123",
 *   "userType": 2,
 *   "userName": "홍길동",
 *   "userEmail": "hong@example.com",
 *   "answers": [
 *     {
 *       // '유입 경로' 질문에 대한 ObjectId
 *       "question": "5f50c31f1234567890123457",
 *       "selectedContents": [
 *         {
 *           "contentNumber": 0, // '인터넷 검색' 선택
 *           "contentAnswer": "" // 내용이 없으므로 빈 문자열
 *         }
 *       ]
 *     }
 *   ],
 *   "comment": "",
 *   "createdAt": "2021-01-01T00:00:00.000Z",
 *   "updatedAt": "2021-01-01T00:00:00.000Z"
 * }
 *
 * 응답 예시2
 * {
 *   // 예시 Survey
 *   "survey": "5f50c31f1234567890123456",
 *   "userId": "user123",
 *   "userType": 2,
 *   "userName": "홍길동",
 *   "userEmail": "hong@example.com",
 *   "answers": [
 *     {
 *       // '이용 만족도' 질문에 대한 ObjectId
 *       "question": "5f50c31f1234567890123458",
 *       "selectedContents": [
 *         {
 *           "contentNumber": 0, // '얼마나 만족하셨나요?' 선택
 *           "contentAnswer": 5 // 매우 만족
 *         },
 *         {
 *           "contentNumber": 1, // '앞으로도 이용하실 의향이 있으신가요?' 선택
 *           "contentAnswer": True
 *         }
 *       ]
 *     }
 *   ],
 *   "comment": "",
 *   "createdAt": "2021-01-01T00:00:00.000Z",
 *   "updatedAt": "2021-01-01T00:00:00.000Z"
 * }
 */
