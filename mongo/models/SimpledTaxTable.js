const mongoose = require("mongoose");

// 간이세액표 스키마 정의
const simpledTaxTableSchema = new mongoose.Schema({
  year: { type: Number, required: true }, // 연도
  incomeMin: { type: Number, required: true }, // 최소 소득 (이상)
  incomeMax: { type: Number, required: true }, // 최대 소득 (미만)
  dependents: { type: Number, required: true }, // 부양 가족 수
  taxAmount: { type: Number, required: true }, // 세액
});

simpledTaxTableSchema.index(
  { year: 1, incomeMin: 1, incomeMax: 1, dependents: 1 },
  { unique: true }
);

// 간이세액표 모델 생성
const SimpledTaxTable = mongoose.model(
  "SimpledTaxTable",
  simpledTaxTableSchema,
  "simpledTaxTable"
);

module.exports = SimpledTaxTable;
