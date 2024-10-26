const {
  sequelize,
  tbl_enterprise,
  tbl_enterprise_detail,
  tbl_work_time,
} = require("../../../db/models");
const dayjs = require("../../../libraries/day");
const _ = require("lodash");
const Helper = require("../../../libraries/helper");

const ContractServiceV1 = require("../../v1/contracts/service");
const WorkServiceV2 = require("../../v2/works/service");
const SettingServiceV2 = require("../../v1/settings/service");

const { employmentValue, workStatus } = require("../../../config/constants");
const {
  OFF_WORK,
  CONTRACT_WORK,
  OVER_WORK,
  HOLIDAY_WORK,
  TAKEOFF,
  UNPAID_TIMEOFF,
  ABSENCE,
  DATE_SHIFT,
  SHIFT_COMPENSATION,
} = workStatus;

/**
 * 5인 이상 사업장 여부를 확인하는 함수
 * 사업장의 정규직 직원 수를 조회하여 5인 미만/이상 여부를 반환
 */
exports.getPermanentEmployeeCount = async (enterprise) => {
  const enterOne = await tbl_enterprise_detail.findOne({
    where: {
      enterprise,
    },
  });

  const { members } = enterOne;
  if (members >= 5) {
    return {
      isLessThanFive: false,
    };
  }

  return {
    isLessThanFive: true,
  };
};

/**
 * 사업장의 정규직 직원 수 상태를 업데이트하는 함수
 * @param {boolean} isLessThanFive - 5인 미만 사업장 여부
 */
exports.setPermanentEmployeeCount = async (enterprise, isLessThanFive) => {
  return await tbl_enterprise_detail.update(
    {
      members: isLessThanFive ? 0 : 5,
    },
    {
      where: {
        enterprise,
      },
    }
  );
};

/**
 * 전체 직원의 현재 근무 상태를 조회하는 함수
 * 근무중, 예정, 퇴근, 휴가, 미등록 등의 상태로 분류하여 반환
 * 
 * 반환되는 상태:
 * - working: 현재 근무중인 직원
 * - scheduled: 오늘 근무 예정인 직원
 * - offWork: 퇴근한 직원
 * - onLeave: 휴가중인 직원
 * - missingRecord: 출근 기록이 없는 직원
 */
exports.getEmployeeWorkStatus = async (enterprise) => {
  // 계약 정보가 있는 전체 직원 목록 조회
  const scheduledEmployees =
    await ContractServiceV1.getCurContractsWithResignation(enterprise);

  // 현재 근무 중인 직원 목록 조회
  const workingEmployees = await WorkServiceV2.getWorkStatusByDate(
    enterprise,
    dayjs().format("YYYYMMDD")
  );

  // 계약 정보와 근무 정보를 병합
  const merged = _.merge(
    _.keyBy(scheduledEmployees, "employeeID"),
    _.keyBy(workingEmployees, "employeeID")
  );

  const allWorkStatus = _.values(merged);

  // 상태별 직원 수와 명단을 저장할 객체 초기화
  const status = {
    total: allWorkStatus.length,
    status: {
      working: { count: 0, employees: [] },
      scheduled: { count: 0, employees: [] },
      offWork: { count: 0, employees: [] },
      onLeave: { count: 0, employees: [] },
      missingRecord: { count: 0, employees: [] },
    },
  };

  const isDateValid = (date) => date && dayjs(date).isValid();
  const currentDate = dayjs();
  const currentDay = currentDate.format("ddd").toLowerCase();
  const currentTime = currentDate.format("HH:mm");

  const updateStatus = (statusKey, employeeName) => {
    status.status[statusKey].count++;
    status.status[statusKey].employees.push(employeeName);
  };

  // 각 직원의 상태를 확인하고 분류
  allWorkStatus.forEach((employee) => {
    const resignationDate = isDateValid(employee.resignationdate)
      ? dayjs(employee.resignationdate)
      : null;
    const contractStartDate = dayjs(
      employee.tbl_contract_detail.contractstartdate
    );

    if (employee.tbl_work_time) {
      const { worktype, startdate, finishdate } = employee.tbl_work_time;
      const startDate = isDateValid(startdate) ? dayjs(startdate) : null;
      const finishDate = isDateValid(finishdate) ? dayjs(finishdate) : null;

      // 근무 유형에 따라 상태 분류
      if (
        [CONTRACT_WORK, OVER_WORK, HOLIDAY_WORK, SHIFT_COMPENSATION].includes(
          worktype
        )
      ) {
        if (startDate && !finishDate) {
          updateStatus("working", employee.tbl_user_detail.username);
        } else if (startDate && finishDate) {
          updateStatus("offWork", employee.tbl_user_detail.username);
        }
      } else if ([TAKEOFF, UNPAID_TIMEOFF].includes(worktype)) {
        updateStatus("onLeave", employee.tbl_user_detail.username);
      }
    } else {
      // 근무 기록이 없는 경우 계약상의 근무 시간과 비교
      const startTimeKey = `starttime_${currentDay}`;
      const finishTimeKey = `finishtime_${currentDay}`;
      const startTime = employee.tbl_contract_detail[startTimeKey];
      const finishTime = employee.tbl_contract_detail[finishTimeKey];

      if (startTime && dayjs(startTime, "HH:mm").isValid()) {
        if (currentTime < startTime) {
          updateStatus("scheduled", employee.tbl_user_detail.username);
        } else {
          updateStatus("missingRecord", employee.tbl_user_detail.username);
        }
      }
    }
  });

  return status;
};

/**
 * 직원의 다음 근무 일정을 조회하는 함수
 * 오늘부터 일주일간의 근무 일정을 확인하여 가장 빠른 근무 일정을 반환
 * 반환 형식: "오늘 09:00 - 18:00" 또는 "내일 09:00 - 18:00" 또는 "MM/DD 09:00 - 18:00"
 */
const getNextShift = (contractDetail) => {
  const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = dayjs();

  for (let i = 0; i < daysOfWeek.length; i++) {
    const checkDay = today.add(i, "day");
    const dayName = daysOfWeek[checkDay.day()];
    const startTime = contractDetail[`starttime_${dayName}`];
    const finishTime = contractDetail[`finishtime_${dayName}`];

    if (startTime && finishTime) {
      const dateString =
        i === 0 ? "오늘" : i === 1 ? "내일" : checkDay.format("MM/DD");

      return `${dateString} ${Helper.splitTime(startTime)} - ${Helper.splitTime(
        finishTime
      )}`;
    }
  }

  return "예정된 근무 없음";
};

/**
 * 주간 근무 시간을 계산하는 함수
 * @param {Object} contractDetail - 근무 계약 상세 정보
 * @param {boolean} includeBreaks - 휴게시간 포함 여부
 * @returns {number} 주간 총 근무시간 (소수점 둘째자리까지)
 * 
 * 휴게시간 계산 규칙:
 * - includeBreaks가 true인 경우 4시간마다 30분의 휴게시간 제외
 * - 야간 근무(익일 종료)의 경우 자동으로 처리
 */
const calculateWeeklyHours = (contractDetail, includeBreaks = false) => {
  const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  let totalMinutes = 0;

  daysOfWeek.forEach((day) => {
    const startTime = contractDetail[`starttime_${day}`];
    const finishTime = contractDetail[`finishtime_${day}`];

    if (startTime && finishTime) {
      const start = dayjs(`2000-01-01 ${startTime}`);
      let finish = dayjs(`2000-01-01 ${finishTime}`);

      if (finish.isBefore(start)) {
        finish = finish.add(1, "day");
      }

      let duration = finish.diff(start, "minute");

      if (includeBreaks) {
        const workHours = duration / 60;
        const breaks = Math.floor(workHours / 4) * 30;
        duration -= breaks;
      }

      totalMinutes += duration;
    }
  });

  return Math.round((totalMinutes / 60) * 100) / 100;
};

/**
 * 급여 정보를 포맷팅하는 함수
 * @param {Object} contractDetail - 근무 계약 상세 정보
 * @returns {string} 포맷팅된 급여 문자열
 * 
 * 급여 유형:
 * - 0: 연봉 (12로 나눠서 월급으로 표시)
 * - 1: 월급
 * - 2: 일급
 * - 3: 시급
 */
const formatSalary = (contractDetail) => {
  const { paytype, payvalue } = contractDetail;
  let salaryString = "";

  switch (paytype) {
    case 0:
      salaryString = `${(payvalue / 12).toLocaleString()}원 / 월`;
      break;
    case 1:
      salaryString = `${payvalue.toLocaleString()}원 / 월`;
      break;
    case 2:
      salaryString = `${payvalue.toLocaleString()}원 / 일`;
      break;
    case 3:
      salaryString = `${payvalue.toLocaleString()}원 / 시간`;
      break;
    default:
      salaryString = "정보 없음";
  }

  return salaryString;
};

/**
 * 직원의 휴게시간 포함 여부를 확인하는 함수
 * @param {string} enterprise - 사업장 ID
 * @param {string} employeeId - 직원 ID
 * @param {number} contractType - 계약 유형
 * @returns {boolean} 휴게시간 포함 여부
 * 
 * 계약 유형에 따른 처리:
 * - 1, 2: 정규직/계약직 - 항상 휴게시간 포함
 * - 3: 아르바이트 - 설정에 따라 휴게시간 포함 여부 결정
 */
const isIncludeBreaks = async (enterprise, employeeId, contractType) => {
  switch (contractType) {
    case 1:
    case 2:
      return true;
    case 3:
      const { value } = await SettingServiceV2.getEmployeeSetting(
        enterprise,
        employeeId,
        "work",
        "mandatedBreakTime"
      );

      if (value) return true;
      return false;
  }
};

/**
 * 전체 직원 목록을 조회하는 함수
 * @param {string} enterprise - 사업장 ID
 * @param {Object} options - 조회 옵션 (employeeType으로 직원 유형 필터링)
 * @returns {Array} 직원 목록 (근무 상태, 기본 정보, 근무 시간, 급여 정보 포함)
 */
exports.getAllEmployees = async (enterprise, options) => {
  const { employeeType } = options;

  let query = { enterprise };
  if (employeeType) {
    query.employeeType = employeeType;
  }

  // 계약 정보와 현재 근무 상태 조회 및 병합
  const scheduledEmployees =
    await ContractServiceV1.getCurContractsWithResignation(enterprise);
  const workingEmployees = await WorkServiceV2.getWorkStatusByDate(
    enterprise,
    dayjs().format("YYYYMMDD")
  );
  const merged = _.merge(
    _.keyBy(scheduledEmployees, "employeeID"),
    _.keyBy(workingEmployees, "employeeID")
  );
  const allWorks = _.values(merged);

  // 각 직원의 상세 정보 매핑
  return await Promise.all(
    allWorks.map(async (contract) => {
      const employmentType = employmentValue(contract.contracttype);
      const nextShift = getNextShift(contract.tbl_contract_detail);

      const includeBreaks = await isIncludeBreaks(
        enterprise,
        contract.employeeID,
        contract.contracttype
      );

      const weeklyHours = calculateWeeklyHours(
        contract.tbl_contract_detail,
        includeBreaks
      );

      const salary = formatSalary(contract.tbl_contract_detail);
      const thumbnailUrl = Helper.isValidUrl(contract.tbl_user_detail.thumbnail)
        ? contract.tbl_user_detail.thumbnail
        : null;

      // 현재 근무 상태 확인
      const status = null;
      if (contract.tbl_work_time) {
        const { worktype, startdate, finishdate } = contract.tbl_work_time;
        const startDate = isDateValid(startdate) ? dayjs(startdate) : null;
        const finishDate = isDateValid(finishdate) ? dayjs(finishdate) : null;

        if (
          [CONTRACT_WORK, OVER_WORK, HOLIDAY_WORK, SHIFT_COMPENSATION].includes(
            worktype
          )
        ) {
          if (startDate && !finishDate) {
            status = "근무중";
          } else if (startDate && finishDate) {
            status = "퇴근";
          }
        } else if ([TAKEOFF, UNPAID_TIMEOFF].includes(worktype)) {
          status = "휴가";
        }
      }

      return {
        contractno: contract.contractno,
        name: contract.tbl_user_detail.username,
        isVirtualUser: contract.tbl_user.isVirtualUser,
        imageUrl: thumbnailUrl,
        employmentType,
        contact: Helper.formatPhoneNumber(contract.tbl_user_detail.tel),
        position: contract.jobposition,
        hireDate: dayjs(contract.contractdate).format("YYYY-MM-DD"),
        status: status || nextShift,
        weeklyHours,
        salary,
      };
    })
  );
};
