const { maxNonTaxableAmount } = require("../config/constants");

exports.getMaxNonTaxableAmount = (year, key, curAmount) => {
  if (maxNonTaxableAmount[year][key] === undefined) {
    throw new Error("해당 연도에 해당 항목이 없습니다.");
  }

  return maxNonTaxableAmount[year][key] < curAmount
    ? maxNonTaxableAmount[year][key]
    : curAmount;
};
