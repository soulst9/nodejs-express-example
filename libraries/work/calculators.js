const dayjs = require("../day");

const NONTAXABLES = ["mealPay", "drivingPay", "childcarePay", "researchPay"];

exports.getMonthlyPay = (yearlyPay) => {
  return Math.trunc(yearlyPay / 12);
};

// 일주일의 소정근로시간을 구한다.
const getNetWorkTimePerWeek = (works) => {
  return works.reduce(
    (total, work) => {
      total.hours += work.netWorkTime.hours;
      total.minutes += work.netWorkTime.minutes;

      // 분이 60분을 넘으면 시간으로 올려줌
      total.hours += Math.floor(total.minutes / 60);
      total.minutes %= 60;

      return total;
    },
    { hours: 0, minutes: 0 }
  );
};

// 주휴시간 포함하여 일주일의 소정근로시간을 구한다.
const getWorkTimePerWeek = (totalNetWorkHoursInfo) => {
  let totalHoursPerWeek = totalNetWorkHoursInfo.hours;
  if (totalHoursPerWeek >= 15) {
    // 주휴시간 구하기
    if (totalHoursPerWeek < 40) {
      totalHoursPerWeek = totalHoursPerWeek + Math.floor(totalHoursPerWeek / 5);
    } else {
      totalHoursPerWeek = totalHoursPerWeek + 8;
    }
  }

  return totalHoursPerWeek + totalNetWorkHoursInfo.minutes / 60;
};

// 비과세 항목의 합을 구한다.
const calculateNonTaxablesSum = (nonTaxables) => {
  console.log("nonTaxables:", nonTaxables);
  if (!nonTaxables || nonTaxables.length === 0) {
    return 0;
  }

  return Object.keys(nonTaxables).reduce((sum, item) => {
    sum += nonTaxables[item];
    return sum;
  }, 0);
};

// 추가 수당의 합을 구한다.
const calculateExtraPaySum = (extraPays) => {
  console.log("extraPays:", extraPays);
  if (!extraPays || extraPays.length === 0) {
    return 0;
  }

  return Object.keys(extraPays).reduce((sum, item) => {
    sum += extraPays[item];
    return sum;
  }, 0);
};

exports.calculateWorkHours = (workTimes) => {
  console.log("workTimes:", workTimes);
  const restTimeEvery = 4; // 4시간마다 휴식
  const restTime = 30; // 휴식 시간은 30분

  const result = [];

  // 요일별로 근무 시작 시간과 종료 시간을 확인하여 계산
  for (const day in workTimes) {
    const startTime = workTimes[day].startTime;
    const finishTime = workTimes[day].finishTime;

    if (startTime !== null && finishTime !== null) {
      let start = dayjs(startTime, "HHmm");

      // start가 finish보다 크면 하루가 넘어간 것이다.
      // 이 경우 하루를 더해준다.
      let finish = dayjs(finishTime, "HHmm");
      if (start.isAfter(finish)) {
        finish = finish.add(1, "day");
      }
      const workDuration = dayjs.duration(finish.diff(start));

      const totalWorkInMinutes = workDuration.as("minutes");
      const intervals = Math.floor(totalWorkInMinutes / (restTimeEvery * 60));
      const totalRestTime = intervals * restTime;

      const workHours = Math.floor(totalWorkInMinutes / 60);
      const workMinutes = totalWorkInMinutes % 60;

      const netWorkInMinutes = totalWorkInMinutes - totalRestTime;
      const netWorkHours = Math.floor(netWorkInMinutes / 60);
      const netWorkMinutes = netWorkInMinutes % 60;

      result.push({
        week: day,
        startTime,
        finishTime,
        workTime: { hours: workHours, minutes: workMinutes },
        restTime: {
          hours: Math.floor(totalRestTime / 60),
          minutes: totalRestTime % 60,
        },
        netWorkTime: { hours: netWorkHours, minutes: netWorkMinutes },
      });
    }
  }

  return result;
};

/**
 *
 * @param {array} workInfoArray  // 근무시간 정보
 * @param {array} workDays // 근무일
 * @returns {object} // { hours: number, minutes: number }
 */
function calculateTotalNetWorkTime(workInfoArray, workDays) {
  const sum = workDays.reduce((total, workDay) => {
    const week = dayjs(workDay).day();
    const dayInfo = workInfoArray.find((info) => info.week === String(week));
    if (dayInfo && dayInfo.netWorkTime) {
      const { hours, minutes } = dayInfo.netWorkTime;
      const netWorkTime = dayjs.duration({ hours, minutes });
      total = total.add(netWorkTime);
    }
    return total;
  }, dayjs.duration({ hours: 0, minutes: 0 }));

  return {
    hours: sum.days() ? sum.days() * 24 + sum.hours() : sum.hours(),
    minutes: sum.minutes(),
  };
}

exports.segmentizePaystubDetails = (monthlyPay, payDetails) => {
  try {
    payDetails = payDetails || [];

    if (typeof monthlyPay !== "number" || monthlyPay < 0) {
      throw new Error("Invalid monthlyPay value");
    }

    if (!Array.isArray(payDetails)) {
      throw new Error("payDetails must be an array");
    }

    let totalPayIncluded = 0;
    let totalPayNotIncluded = 0;

    // 추가 지급 포함된 항목들과 제외된 항목들의 값을 계산
    payDetails.forEach((payment) => {
      if (typeof payment !== "object") {
        throw new Error("Invalid payment object");
      }

      const paymentKeys = Object.keys(payment);
      if (!paymentKeys.includes("isInclude")) {
        throw new Error("Invalid payment object structure");
      }

      if (typeof payment.value !== "number" || payment.value < 0) {
        throw new Error("Invalid payment amount");
      }
    });

    payDetails.forEach((item) => {
      const { isInclude, value } = item;
      isInclude ? (totalPayIncluded += value) : (totalPayNotIncluded += value);
    });

    // 기본급 계산 (비과세 항목 제외)
    const basePay = monthlyPay - totalPayIncluded;

    // 지급총액 계산 (추가 지급 포함된 항목들의 합과 월급의 합)
    const totalPayment = monthlyPay + totalPayNotIncluded;
    if (basePay < 0) {
      return [{ 기본급: monthlyPay }, { 지급총액: totalPayment }];
    }

    // 과세 항목들의 금액 계산
    // 과세금액 = 지급총액 - 비과세 항목들의 합
    // 비과세 항목마다 최대 금액이 존재함
    const nonTaxables = payDetails.filter((item) => item.isNonTaxable);
    const maxNonTaxableAmount = nonTaxables.reduce((acc, item) => {
      console.log("acc, item:", acc, item);

      // 200000보다 크면 200000을 반환하고, 그렇지 않으면 item.value를 반환
      if (NONTAXABLES.includes(item.key)) {
        return acc + (item.value > 200000 ? 200000 : item.value);
      }

      return acc + item.value;
    }, 0);

    // paymentDetails 구성
    const paymentDetails = [
      { maxNonTaxableAmount },
      { basePay },
      ...payDetails.map((item) => {
        return {
          [item.key]: item.value,
          isInclude: item.isInclude,
          isNonTaxable: item.isNonTaxable,
        };
      }),
      { sumPay: totalPayment },
    ];

    return paymentDetails;
  } catch (error) {
    console.error("Error in calculatePaymentDetails:", error.message);
    return [];
  }
};

/**
 *
 * @param {object} param
 * @param {number} param.paytype // 0: 연봉, 1: 월급, 2: 일급, 3: 시급
 * @param {number} param.payvalue // 시급, 일급, 월급, 연봉 금액
 * @param {array} param.works // 근무시간
 * @param {object} param.additionalPayments // 추가 수당 [deprecated]
 * @param {object} param.nonTaxables // 비과세 항목 [deprecated]
 * @param {array} param.paystubDetails // 급여 세부항목 (비과세와 수당 항목 포함)
 * @returns
 */
exports.getPayItems = ({
  paytype,
  payvalue,
  works,
  workDays,
  paystubDetails,
  // additionalPayments,
  // nonTaxables,
}) => {
  console.log(
    "paytype, payvalue, works, paystubDetails:",
    paytype,
    payvalue,
    works,
    paystubDetails
  );
  let monthlyPay = 0;
  let totalNetWorkHoursInfo = { hours: 0, minutes: 0 };

  // const segments = this.segmentizePaystubDetails(monthlyPay, paystubDetails);
  // // console.log("segment:", segment);
  // const basePayItem = segments.find((item) => item.hasOwnProperty("basePay"));
  // console.log("basePayItem:", basePayItem);
  // const sumPayItem = segments.find((item) => item.hasOwnProperty("sumPay"));
  // console.log("sumPayItem:", sumPayItem);

  let totalHoursMonth = 0;

  switch (paytype) {
    case 0: // 연봉
      monthlyPay = this.getMonthlyPay(payvalue);
      totalNetWorkHoursInfo = getNetWorkTimePerWeek(works);
      console.log("totalNetWorkHoursInfo:", totalNetWorkHoursInfo);

      totalHoursMonth = Math.floor(
        getWorkTimePerWeek(totalNetWorkHoursInfo) * 4.345
      );

      // return {
      //   basePay: basePayItem.basePay || 0,
      //   sumPay: sumPayItem.sumPay || 0,
      //   // basePay: monthlyPay - calculateNonTaxablesSum(nonTaxables),
      //   // sumPay: monthlyPay + calculateExtraPaySum(additionalPayments),
      //   totalHoursMonth: Math.floor(
      //     getWorkTimePerWeek(totalNetWorkHoursInfo) * 4.345
      //   ), // 소수점 없애고 반올림
      // };
      break;
    case 1: // 월급
      // monthlyPay = payvalue;
      throw new Error("Not implemented");
    case 2: // 일급
      throw new Error("Not implemented");
    case 3: // 시급
      // workDays가 없으면 1개월 이상 근무라 평균 근로시간을 구한다.
      console.log("시급 계산 시작", workDays.length, workDays);
      if (workDays.length > 0) {
        // 1개월 미만 근로자는 평균 근로시간을 구하지 않고 근무시간의 총합을 구한다.
        const { hours, minutes } = calculateTotalNetWorkTime(works, workDays);
        // console.log("hours, minutes:", hours, minutes);

        monthlyPay = Math.floor(payvalue * hours + (payvalue * minutes) / 60);
        totalHoursMonth = hours + Math.floor(minutes / 60);
        // return {
        //   basePay: basePayItem.basePay || 0,
        //   sumPay: sumPayItem.sumPay || 0,
        //   totalHoursMonth: hours + Math.floor(minutes / 60),
        // };
      } else {
        // 평균 근로시간 계산
        totalNetWorkHoursInfo = getNetWorkTimePerWeek(works);
        totalHoursMonth = Math.round(
          getWorkTimePerWeek(totalNetWorkHoursInfo) * 4.345
        );
        console.log("totalHoursMonth:", totalHoursMonth);

        // 월소정근로시간 * 시급 = 기본급
        monthlyPay = payvalue * totalHoursMonth;
      }
      break;
  }

  // console.log("segment:", segment);
  // const basePayItem = segments.find((item) => item.hasOwnProperty("basePay"));
  // console.log("basePayItem:", basePayItem);
  // const sumPayItem = segments.find((item) => item.hasOwnProperty("sumPay"));
  // console.log("sumPayItem:", sumPayItem);

  const segments = this.segmentizePaystubDetails(monthlyPay, paystubDetails);
  console.log("segments:", segments);

  return {
    basePay:
      segments.find((item) => item.hasOwnProperty("basePay"))?.basePay || 0,
    sumPay: segments.find((item) => item.hasOwnProperty("sumPay"))?.sumPay || 0,
    totalHoursMonth,
  };
};
