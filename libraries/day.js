const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const duration = require("dayjs/plugin/duration");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const minMax = require("dayjs/plugin/minMax");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isBetween = require("dayjs/plugin/isBetween");
const { weekDay } = require("../config/constants");
const { SUNDAY, SATURDAY } = weekDay;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.tz.setDefault("Asia/Seoul");

const getWeekdaysInMonth = (year, month, includeWeekdays, start = 1, end) => {
  console.log(start, end);

  const wednesdays = [];
  const from = start;
  const daysInMon = dayjs(`${year}-${month}`).daysInMonth();

  // end의 유효성을 보장받기 위해
  // 월의 최대치를 넘어설 수는 없음.
  const to = end ? Math.min(end, daysInMon) : daysInMon;

  for (let day = from; day <= to; day++) {
    const date = dayjs(`${year}-${month}-${day}`);
    if (includeWeekdays.includes(date.day())) {
      wednesdays.push(date.format("YYYYMMDD"));
    }
  }

  return wednesdays;
};

const deleteAfterRange = (arr, rangeDate) => {
  const rangeIndex = arr.findIndex((date) => date > rangeDate);
  if (rangeIndex === -1) {
    return arr;
  }
  arr.splice(rangeIndex);
  return arr;
};

const isLastDayOfMonth = () => {
  if (dayjs().endOf("month").format("DD") === dayjs().format("DD")) return true;
  return false;
};

/**
 * 현재 시간과 입력된 시간의 월 차이를 반환하는 함수
 * @param {string or date} time
 * @returns
 */
const diffCurrentMonth = (time) => {
  const now = dayjs();
  return now.diff(dayjs(time), "month");
};

/**
 * 입력된 시간이 현재 달인지를 판단하는 함수
 * */
const areDatesInSameMonth = (date1, date2) => {
  const d1 = dayjs(date1);
  const d2 = dayjs(date2);

  return d1.isSame(d2, "month");
};

/**
 * 입력된 시간이 지난 달인지를 판단하는 함수
 * @param {} time
 * @returns
 */
const areDatesInLastMonth = (date1) => {
  if (diffCurrentMonth(date1) === 1) {
    return true;
  }

  return false;
};

// deadline이 주말일 경우 얼마나 지연되는 지에 대한 일 수
function getDelayedDay(deadline) {
  const date = dayjs().date(deadline);
  return date.day() === SUNDAY ? 1 : date.day() === SATURDAY ? 2 : 0;
}

// function getMonthsForYear(year) {
//   const currentDate = dayjs();
//   const currentYear = currentDate.year();
//   const currentMonth = currentDate.month() + 1; // month()는 0부터 시작하므로 1을 더해줍니다.

//   if (year === currentYear) {
//     // 현재 연도인 경우 현재 월까지만 반환
//     return Array.from({ length: currentMonth }, (_, index) => index + 1);
//   } else {
//     // 다른 연도인 경우 모든 월 반환
//     return Array.from({ length: 12 }, (_, index) => index + 1);
//   }
// }

/**
 *
 * @param {Date} start
 * @param {Date} end
 * @returns Number
 */

function getDiffTime(start, end) {
  const diff = dayjs(end).diff(dayjs(start), "minute");
  console.log("diff:", diff);

  // 시간과 분으로 분리
  const hours = Math.floor(diff / 60); // 시간
  const minutes = diff % 60; // 분

  console.log("hours:", hours);
  console.log("minutes:", minutes);

  // 시간과 분을 합쳐서 1시간 30분 형태로 표현
  const formattedTime = (hours + minutes / 60).toFixed(1);
  return parseFloat(formattedTime); // 숫자로 변환하여 반환
}

/**
 *
 * @param {String} start
 * @param {String} end
 * @returns Number
 */
function getDiffTime2(start, end) {
  const startTime = dayjs(start, "HH:mm");
  const endTime = dayjs(end, "HH:mm");

  // 두 시간 사이의 차이를 분 단위로 구합니다.
  const diffInMinutes = endTime.diff(startTime, "minute");

  const hours = Math.floor(diffInMinutes / 60); // 시간
  const minutes = diffInMinutes % 60; // 분

  // 시간과 분을 합쳐서 1시간 30분 형태로 표현하고, 소수점 한 자리로 고정
  const formattedTime = (hours + minutes / 60).toFixed(1);
  return parseFloat(formattedTime); // 숫자로 변환하여 반환
}

function isNightShiftIncluded(start, end, nightShiftStart, nightShiftEnd) {
  const startTime = start;
  const endTime = end;

  // const nightShiftStart = dayjs(start).set("hour", 22); // 밤 10시
  // const nightShiftEnd = dayjs(start).set("hour", 6).add(1, "day"); // 새벽 6시

  // 시작 시간과 종료 시간이 모두 야간 근무 시간대 안에 있을 경우
  if (startTime >= nightShiftStart && startTime <= nightShiftEnd) {
    return true;
  } else if (endTime >= nightShiftStart && endTime <= nightShiftEnd) {
    return true;
  } else if (startTime <= nightShiftStart && endTime >= nightShiftEnd) {
    return true;
  } else if (startTime >= nightShiftStart && endTime <= nightShiftEnd) {
    return true;
  }

  return false;
}

function calculateNightShiftHours(start, end) {
  const actualStart = dayjs(start);
  const actualEnd = dayjs(end);

  const NIGHT_START = dayjs(start).set("hour", 22); // 밤 10시
  const NIGHT_END = dayjs(start).set("hour", 6).add(1, "day"); // 새벽 6시

  if (isNightShiftIncluded(actualStart, actualEnd, NIGHT_START, NIGHT_END)) {
    // 야간 근무 시간 계산
    const nightStartInActual = dayjs.max(NIGHT_START, actualStart);
    const nightEndInActual = dayjs.min(NIGHT_END, actualEnd);
    // console.log("야간 근무 시간 계산");
    const diffInMinutes = nightEndInActual.diff(nightStartInActual, "minute");

    const hours = Math.floor(diffInMinutes / 60); // 시간
    const minutes = diffInMinutes % 60; // 분

    // 시간과 분을 합쳐서 1시간 30분 형태로 표현
    const formattedTime = hours + minutes / 60;
    return parseFloat(formattedTime.toFixed(2));
  }

  return 0;
}

/**
 *
 * @param {Date} start
 * @param {String} end
 * @returns Number
 * 입력된 두 날짜의 월 차이를 반환하는 함수
 * 다만, 두 날짜가 같은 달이라면 1을 반환하므로, 그 차이는 1씩 더해짐
 */
function getMonthDifference(start, end) {
  const startDate = dayjs(start).startOf("month");
  const endDate = dayjs(end).startOf("month");

  const diff = endDate.diff(startDate, "month");
  return diff + 1;
}

/**
 * 두 날짜 사이의 일 수를 반환하는 함수
 * endDate가 없다면 현재 월의 마지막 날짜까지의 일 수를 반환합니다.
 * @param {string} startDate
 * @param {string} endDate
 * @returns Number
 */
function getDaysDiffStartAndEnd(yyyymm, startDate, endDate) {
  // 현재 날짜를 가져옵니다.

  const currentDate = dayjs();
  const standardDate =
    dayjs(yyyymm).format("YYYYMM") === currentDate.format("YYYYMM")
      ? currentDate
      : dayjs(yyyymm).endOf("month");

  console.log(
    'currentDate.startOf("month")',
    currentDate.startOf("month").format("YYYYMM")
  );
  console.log("standardDate:", standardDate.format("YYYY-MM-DD"));

  startDate = startDate ? dayjs(startDate) : standardDate.startOf("month");
  endDate = endDate ? dayjs(endDate) : dayjs().endOf("month");

  if (startDate.isAfter(endDate, "day")) {
    throw new Error("시작일은 종료일보다 이전이어야 합니다.");
  }

  if (standardDate.isBefore(startDate, "day")) {
    return 0;
  }

  // 시작일이 이번 달 1일보다 작으면 이번 달 1일로 설정합니다.
  if (startDate.isBefore(standardDate.startOf("month"), "day")) {
    startDate = standardDate.startOf("month");
  }

  // 종료일이 이번 달 말일을 넘어가면 이번 달 말일로 설정합니다.
  if (endDate.isAfter(standardDate.endOf("month"), "day")) {
    endDate = standardDate.endOf("month");
  }

  // 종료일이 오늘보다 이후인 경우 현재 날짜와의 차이를 반환합니다.
  if (endDate.isAfter(standardDate, "day")) {
    endDate = standardDate;
  }

  console.log("startDate:", startDate.format("YYYY-MM-DD"));
  console.log("endDate:", endDate.format("YYYY-MM-DD"));

  return endDate.diff(startDate, "days") + 1;
}

dayjs.getWeekdaysInMonth = getWeekdaysInMonth;
dayjs.deleteAfterRange = deleteAfterRange;
dayjs.isLastDayOfMonth = isLastDayOfMonth;
dayjs.diffCurrentMonth = diffCurrentMonth;
dayjs.getDelayedDay = getDelayedDay;
dayjs.areDatesInSameMonth = areDatesInSameMonth;
dayjs.areDatesInLastMonth = areDatesInLastMonth;
dayjs.getDiffTime = getDiffTime;
dayjs.getDiffTime2 = getDiffTime2;
dayjs.calculateNightShiftHours = calculateNightShiftHours;
dayjs.getMonthDifference = getMonthDifference;
dayjs.getDaysDiffStartAndEnd = getDaysDiffStartAndEnd;

module.exports = dayjs;
