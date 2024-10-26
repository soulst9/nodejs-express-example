const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const passwordValidator = require("password-validator");
const getUuid = require("uuid-by-string");
const { env } = require("../config/env");
const _ = require("lodash");
const dayjs = require("./day");
const { TAX_RATES } = require("../config/constants");
const { URL } = require("url");

const schema = new passwordValidator();
schema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(30) // Maximum length 20
  .symbols(1)
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1) // Must have at least 2 digits
  .has()
  .not()
  .spaces() // Should not have spaces
  .is()
  .not()
  .oneOf(["Passw0rd", "Password123"]); // Blacklist these values
// .has().uppercase()  // Must have uppercase letters

const Helper = {
  /**
   * Check duplicates in array
   * @param {Array} arr
   * @returns {Array} Array of duplicates
   */
  findDuplicateInArray(arr) {
    var object = {};
    var result = [];

    arr.forEach(function (item) {
      if (!object[item]) object[item] = 0;
      object[item] += 1;
    });

    for (var prop in object) {
      if (object[prop] >= 2) {
        result.push(prop);
      }
    }

    return result;
  },

  /**
   * Hash Password Method
   * @param {string} password
   * @returns {string} returns hashed password
   */
  hashPassword(password) {
    // return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
    const hmac = crypto.createHmac("sha256", env.app.cryptoKey);
    return hmac.update(password).digest("hex");
  },

  /**
   * comparePassword
   * @param {string} hashPassword
   * @param {string} password
   * @returns {Boolean} return True or False
   */
  comparePassword(hashPassword, password) {
    return bcrypt.compareSync(password, hashPassword);
  },

  isValidEmail(email) {
    /**
     * [a-zA-Z0-9._%+-]
     * 이메일 주소가 알파벳 대소문자, 숫자, 점(.), 백분율 기호(%),
     * 더하기(+), 빼기(-), 밑줄(_) 중 하나로 시작
     * [a-zA-Z]{2,}$/i
     * 대소문자를 구분하지 않고,
     * 문자열의 끝이 최소 두 개 이상의 알파벳 문자로 끝나는 경우
     */
    const pattern = new RegExp(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i
    );
    return pattern.test(String(email));
  },

  /**
   * Gnerate Refresh Token
   * @param {string} id
   * @returns {string} token
   */
  generateRefreshToken(id) {
    const expiredTime = "365d";
    const token = jwt.sign(
      {
        userId: id,
      },
      env.app.secret,
      { expiresIn: expiredTime }
    );
    return token;
  },
  /**
   * Gnerate Token
   * @param {string} id
   * @returns {string} token
   */
  generateToken(userObject, expiredTime) {
    const token = jwt.sign(userObject, env.app.jwtKey, {
      algorithm: "HS256",
      issuer: "banimani.net",
      expiresIn: expiredTime,
    });
    return token;
  },

  /**
   *
   * @param {string} enterprise
   * @returns {string} token
   */
  generateTokenforOpenLink(enterprise) {
    const token = jwt.sign(
      {
        enterprise,
      },
      env.app.jwtKeyforOpenLink,
      { expiresIn: "7d" }
    );
    return token;
  },

  generateTokenforOpenLinkUserEmail(userID, enterprise, toMail) {
    const token = jwt.sign(
      {
        userID,
        enterprise,
        toMail,
      },
      env.app.jwtKeyforOpenLink,
      { expiresIn: "5m" }
    );
    return token;
  },

  fomartDate(date) {
    if (date != "N/A") {
      return date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
    } else {
      return date;
    }
  },

  getUuidfromId(userId) {
    return getUuid(userId);
  },

  equalsIgnoreCase(compare_str1, compare_str2) {
    return compare_str1.localeCompare(compare_str2, undefined, {
      sensitivity: "base",
    }) === 0
      ? true
      : false;
  },

  equalsCase(compare_str1, compare_str2) {
    return compare_str1.localeCompare(compare_str2, undefined, {
      sensitivity: "case",
    }) === 0
      ? true
      : false;
  },

  isValidPassword(password) {
    const result = schema.validate(password, { details: true });
    if (result.length === 0) {
      return {
        isPass: true,
      };
    } else {
      return {
        isPass: false,
        message: result[0].message,
      };
    }
  },

  findValueInAOnly(A, B) {
    const result = [];

    for (let i = 0; i < A.length; i++) {
      if (!B.includes(A[i])) {
        result.push(A[i]);
      }
    }

    return result;
  },

  removeMatchesFromArray(arr, removeTarget) {
    return arr.filter((item) => !removeTarget.includes(item));
  },

  sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  },

  convertArrayToObject(arr) {
    const obj = {};
    arr.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        obj[key] = value;
      });
    });
    return obj;
  },

  generateNumber(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  sleep(millisecond) {
    return new Promise((resolve) => setTimeout(resolve, millisecond));
  },

  placeholdQuery(req, paramName, holder) {
    const paramValue = req.query?.[paramName] ?? holder;

    if (
      paramValue === holder ||
      paramValue === "undefined" ||
      paramValue === "null"
    ) {
      console.log("placeholdQuery::nullish value entered in:", paramName);
      return holder;
    }

    return paramValue;
  },

  placeholdParams(req, paramName, holder) {
    const paramValue = req.params?.[paramName] ?? holder;

    if (
      paramValue === holder ||
      paramValue === "undefined" ||
      paramValue === "null"
    ) {
      console.log("placeholdParams::nullish value entered in:", paramName);
      return holder;
    }

    return paramValue;
  },

  placeholdBody(req, paramName, holder) {
    const paramValue = req.body?.[paramName] ?? holder;

    if (
      paramValue === holder ||
      paramValue === "undefined" ||
      paramValue === "null"
    ) {
      console.log("placeholdBody::nullish value entered in:", paramName);
      return holder;
    }

    return paramValue;
  },

  mergeTwoObjects(arr1, arr2, key) {
    const result = _.merge(_.keyBy(arr1, key), _.keyBy(arr2, key));
    return result;
  },

  /**
   * @returns {true} when value is '', null, undefined, 0, false, NaN
   * @returns {false} when value is someting else
   */
  isFalsey(value) {
    return !value;
  },

  isNullObjectAndThrow(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let value = obj[key];
        if (typeof value === "object") {
          // 중첩된 객체인 경우 재귀 호출로 순회
          this.isNullObjectAndThrow(value);
        } else {
          // 중첩된 객체가 아닌 경우 작업 수행
          if (value === undefined) {
            console.log(key, value);
            throw new Error(`[${key}] value is undefined`);
          }
        }
      }
    }
  },

  generateRandomString(length) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString("hex")
      .slice(0, length);
  },

  isEmptyString(str) {
    return str.length === 0;
  },

  isNullOrEmpty(str) {
    return str === null || str === undefined || str.length === 0;
  },

  getValueOrDefault(obj, key) {
    // 만약 obj의 key가 존재하지 않으면 기본적으로 0을 반환합니다.
    return Number(obj?.[key]) || 0;
  },

  findObjectById(arr, targetKey, returnKey, defaultValue = 0) {
    for (const obj of arr) {
      if (obj.code === targetKey) {
        return obj[returnKey];
      }
    }
    return defaultValue;
  },

  updateKey(obj, oldKey, newKey) {
    if (obj.hasOwnProperty(oldKey)) {
      obj[newKey] = obj[oldKey];
      delete obj[oldKey];
    } else {
      new Error(`Key "${oldKey}" not found in the object.`);
    }
  },

  maskSubstring(input, start, end, maskChar = "*") {
    if (start < 0 || start > end) {
      throw new Error("Invalid range");
    }

    end = Math.min(end, input.length - 1);
    const maskedPart = maskChar.repeat(end - start + 1);
    const maskedInput =
      input.substring(0, start) + maskedPart + input.substring(end + 1);

    return maskedInput;
  },

  /**
   * targetMonth가 start와 end 사이에 포함되는지 확인
   * @param {date} start
   * @param {date} end
   * @param {date} targetMonth
   * @returns
   */
  isRangeInMonth(start, end, targetMonth) {
    const startOfMonth = dayjs(targetMonth).startOf("month");
    const endOfMonth = dayjs(targetMonth).endOf("month");
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    return (
      startDate.isSameOrBefore(endOfMonth) &&
      endDate.isSameOrAfter(startOfMonth)
    );
  },

  removeChar(str, char) {
    return str == null ? null : str.replace(char, "");
  },

  // 폰번호 형식 체크
  isValidPhoneNumber(phoneNumber) {
    // 정규식을 사용하여 패턴 매칭
    const pattern = /^010\d{8}$/;
    return pattern.test(phoneNumber);
  },

  /**
   * @function quitFunctionTimer
   * @param {*} asyncFunction -> 반드시 비동기 함수여야 함
   * @param {*} outTime -> 타임아웃 시간
   * @param {*} exception -> 반드시 에러 객체여야 함
   * @returns {Promise} -> await로 받아야 함
   *
   * @example
   * const someFunction = async () => {
   *   return await new Promise((resolve) => {
   *     setTimeout(() => {
   *       console.log("someFunction called");
   *       resolve();
   *     }, 2000);
   *   });
   * };
   *
   * (async () => {
   *   try {
   *     await quitFunctionTimer(someFunction, 1000, new Error("timeout"));
   *   } catch (e) {
   *     console.log(e);
   *   }
   * })();
   *
   * @example
   * sendTempCommuteMessage in enterprises/service.js
   */
  quitFunctionTimer(asyncFunction, outTime, exception) {
    return Promise.race([
      asyncFunction(),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(exception);
        }, outTime);
      }),
    ]);
  },

  // 간이세액표 연도별 기준
  getTaxTableYear(year) {
    switch (year) {
      case 2023:
      case 2024:
        return 2023;
      default:
        return 2023;
    }
  },

  // 문자열에서 첫번째로 찾아진 숫자만 추출
  /**
   *
   * @param {string} mixedString
   * @returns number or false
   */
  getNumberFromMixedString(mixedString) {
    const matchResult = mixedString.match(/\d+|[a-zA-Z]+/g);

    if (matchResult && matchResult.some((value) => !isNaN(value))) {
      const extractedNumber = Number(
        matchResult.find((value) => !isNaN(value))
      );
      console.log(extractedNumber);
      return extractedNumber;
    } else {
      console.log(
        "No matching pattern found or no number found in the string."
      );
      return "";
    }
  },

  formatBusinessRegistrationNumber(registrationNumber) {
    // 숫자만 추출
    const digitsOnly = registrationNumber.replace(/\D/g, "");

    // 정규 표현식을 사용하여 형식에 맞게 변환
    const formattedNumber = digitsOnly.replace(
      /(\d{3})(\d{2})(\d{5})/,
      "$1-$2-$3"
    );

    return formattedNumber;
  },

  formatPhoneNumber(phoneNumber) {
    if (phoneNumber.length === 11) {
      // 11자리인 경우
      const formattedNumber = phoneNumber.replace(
        /(\d{3})(\d{4})(\d{4})/,
        "$1-$2-$3"
      );
      return formattedNumber;
    } else {
      // 11자리가 아닌 경우
      return phoneNumber;
    }
  },

  splitTime(number) {
    const hour = number.substr(0, 2);
    const minute = number.substr(2, 2);

    // 분이 0이면 시간만 표시
    if (minute === "00") {
      return `${Number(hour)}시`;
    } else {
      return `${Number(hour)}시${Number(minute)}분`;
    }
  },

  formatTime(hour, minute) {
    if (hour !== 0 && minute === 0) {
      return `${hour}시간`;
    } else if (hour === 0 && minute !== 0) {
      return `${minute}분`;
    } else if (hour !== 0 && minute !== 0) {
      return `${hour}시간 ${minute}분`;
    } else {
      return "";
    }
  },

  getDatesFromTo(contracts = []) {
    console.log("contracts:", contracts);
    const dates = [];

    contracts.forEach((contract) => {
      const { startDate, endDate, worksOfWeek } = contract;
      const { weekdays } = worksOfWeek;

      const start = dayjs(startDate);
      const end = dayjs(endDate);

      let currentDate = start;

      while (currentDate.isSameOrBefore(end, "day")) {
        if (weekdays.includes(currentDate.day())) {
          dates.push(currentDate.format("YYYY-MM-DD"));
        }
        currentDate = currentDate.add(1, "day");
      }
    });

    return dates;
  },

  convertArray(objArray, etc) {
    if (!objArray || typeof objArray !== "object") {
      return [];
    }

    return Object.entries(objArray)
      .map(([name, value]) => ({ name, value, etc }))
      .flat();
  },

  /**
   *
   * @param {array} array1 => 중복키가 있을 때 우선 순위가 높은 배열
   * @param {array} array2 => 중복키가 있을 때 우선 순위가 낮은 배열
   * @returns {array} => merged array
   */
  mergeArraysByPriority(array1, array2) {
    const map = new Map();

    array1.forEach((obj) => {
      map.set(obj.workdate, obj);
    });

    array2.forEach((obj) => {
      const workdate = obj.workdate;
      if (!map.has(workdate)) {
        map.set(workdate, obj);
      }
    });

    const mergedArray = [...map.values()];
    return mergedArray;
  },

  /**
   * JSON.parse에서 오류가 나면 null로 반환
   */
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  },

  getCurrentKSTDate() {
    return dayjs(new Date()).add(9, "hour").toISOString();
  },

  convertKSTDate(date) {
    return dayjs(date).add(9, "hour").toISOString();
  },

  /**
   * object의 nubmer 항목에 접근 시 항목이 없을 경우에는 0으로 반환
   */
  getNumberOrZero(obj, key) {
    return Number(obj?.[key]) || 0;
  },

  /**
   * 일단위 절삭.56
   * @param {number} number
   * @returns
   */
  truncateToWon(number) {
    return Math.floor(number / 10) * 10;
  },

  /**
   * 주어진 날짜 및 시간 문자열이 'YYYY-MM-DD HH:mm' 형식에 부합하는지 검증합니다.
   *
   * 이 함수는 입력된 문자열이 정확히 4자리 년도, 2자리 월, 2자리 일, 2자리 시간 및 2자리 분으로 구성되어 있는지 확인합니다.
   * 각 부분은 '-' 또는 ':'으로 구분되며, 날짜와 시간 사이에는 공백이 있어야 합니다. 이 형식은 일반적으로
   * 날짜와 시간을 표시하는 데 사용됩니다.
   *
   * 예시: '2023-03-25 13:30'
   *
   * @param {string} dateTime 검증하고자 하는 날짜 및 시간 문자열입니다.
   * @returns {boolean} 문자열이 'YYYY-MM-DD HH:mm' 형식에 맞으면 true를, 그렇지 않으면 false를 반환합니다.
   */
  isValidDateTimeFormat(dateTime, format) {
    let regex;

    switch (format) {
      case "YYYY-MM-DD HH:mm":
        regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        break;
      case "YYYY-MM-DD":
        regex = /^\d{4}-\d{2}-\d{2}$/;
        break;
      // 필요에 따라 추가적인 형식을 지원할 수 있습니다.
      case "YYYYMMDD":
        regex = /^\d{4}\d{2}\d{2}$/;
        break;
      default:
        throw new Error("Unsupported date format");
    }

    return regex.test(dateTime);
  },

  /**
   * 주어진 값이 주어진 유형 객체에 속하는지 확인합니다.
   */
  isValidType(value, typeObject) {
    return Object.values(typeObject).includes(value);
  },

  /**
   * Converts a number to a float with one decimal place.
   *
   * This function takes a number, converts it to a string with one decimal place using
   * the toFixed(1) method, and then parses it back to a float to ensure the result is a number.
   *
   * @param {number} value - The number to be formatted to one decimal place.
   * @returns {number} - The formatted number with one decimal place.
   */
  toFixedOne(value) {
    if (typeof value === "number") {
      return parseFloat(value.toFixed(1));
    }
    return 0; // or handle it appropriately if it's not a number
  },

  // 연봉일 경우 월급 계산
  // 월급일 경우 연봉 계산
  calculateSalary(payType, payValue) {
    if (payType === 0) {
      return `[월급] ${Math.floor(payValue / 12).toLocaleString()}`;
    } else if (payType === 3) {
      return `[시급] ${payValue.toLocaleString()}`;
    }
  },

  /**
   * 주어진 객체가 비어 있는지 확인합니다.
   * @param {*} obj
   * @returns
   */
  isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
  },

  getTaxRatesForYear(year) {
    const years = Object.keys(TAX_RATES)
      .map(Number)
      .sort((a, b) => a - b);

    let selectedYear = years[0];

    for (const availableYear of years) {
      if (year < availableYear) {
        break;
      }
      selectedYear = availableYear;
    }

    return TAX_RATES[selectedYear];
  },

  /**
   * url 문자 검증
   * @param {string} urlString
   * @returns
   */
  isValidUrl(urlString) {
    try {
      new URL(urlString);
      return (
        urlString.startsWith("http://") || urlString.startsWith("https://")
      );
    } catch (err) {
      return false;
    }
  },

  // 같은 해가 아닐 경우: yyyy년 m월 d일
  // 같은 해지만 6일보다 클 경우: m월 d일
  // 1일보다 크고 6일보다 같거나 작을 경우: d일 전
  // 1시간보다 크고 1일보다 작을 경우: h시간 전
  // 1분보다 크고 1시간보다 작을 경우: M분 전
  // 1초보다 크고 1분보다 작을 경우: s초 전
  getRelativeTimeFormat(createdAt, options = { showFullDate: false }) {
    const now = dayjs();
    const past = dayjs(createdAt);
    const rtf = new Intl.RelativeTimeFormat("ko-KR", { numeric: "auto" });

    const units = [
      { unit: "year", seconds: 31536000 },
      { unit: "month", seconds: 2592000 },
      { unit: "week", seconds: 604800 },
      { unit: "day", seconds: 86400 },
      { unit: "hour", seconds: 3600 },
      { unit: "minute", seconds: 60 },
      { unit: "second", seconds: 1 },
    ];

    const diffSeconds = now.diff(past, "second");

    if (options.showFullDate) {
      if (now.year() > past.year()) {
        return past.format("YYYY년 M월 D일");
      } else if (diffSeconds > 518400) {
        // 6 days in seconds
        return past.format("M월 D일");
      }
    }

    for (const { unit, seconds } of units) {
      if (diffSeconds >= seconds) {
        const diff = Math.floor(diffSeconds / seconds);
        return rtf.format(-diff, unit);
      }
    }

    return rtf.format(0, "second");
  },

  // 사용 예:
  // getRelativeTimeFormat(createdAt) // 상대적 시간만 표시
  // getRelativeTimeFormat(createdAt, { showFullDate: true }) // 오래된 날짜는 전체 날짜로 표시
};

module.exports = Helper;
