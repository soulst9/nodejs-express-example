const service = require("./service");
const PayrollService = require("../payrolls/service");
const WorkService = require("../works/service");
const UserService = require("../users/service");

/**
 * 직원의 기본 정보를 수정하는 컨트롤러
 */
exports.updateEmployeeInfo = async (req, res, next) => {
  try {
    const { enterprise, year, month } = req.params;
    const results = await UserService.updateEmployeeInfo(
      enterprise,
      year,
      month
    );
    res.success = results;
    res.message = "직원 정보 수정 성공";
    next();
  } catch (error) {
    console.log("updateEmployeeInfo v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 월의 정규직 직원 수 현황을 조회하는 컨트롤러
 */
exports.getMonthlyEmployeeCountStatus = async (req, res, next) => {
  try {
    const { enterprise, year, month } = req.params;
    const results = await PayrollService.getMonthlyEmployeeCountStatus(
      enterprise,
      year,
      month
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getMonthlyEmployeeCountStatus v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 월의 정규직 직원 수 현황을 업데이트하는 컨트롤러
 * isLessThanFive: 5인 미만 사업장 여부
 */
exports.updateMonthlyEmployeeCountStatus = async (req, res, next) => {
  try {
    const { enterprise, year, month } = req.params;
    const { isLessThanFive } = req.body;
    const results = await PayrollService.updateMonthlyEmployeeCountStatus(
      enterprise,
      year,
      month,
      isLessThanFive
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("updateMonthlyEmployeeCountStatus v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 전체 직원의 현재 근무 상태를 실시간으로 조회하는 컨트롤러
 */
exports.getEmployeeWorkStatus = async (req, res, next) => {
  try {
    const { enterprise } = req.params;
    const results = await service.getEmployeeWorkStatus(enterprise);
    res.success = results;
    res.message = "직원 현재 상태 조회";
    next();
  } catch (error) {
    console.log("getEmployeeWorkStatus v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 직원 목록을 조회하는 컨트롤러
 * type 쿼리 파라미터에 따라 정직원/파트타임/퇴사자 목록을 필터링하여 조회
 */
exports.getAllEmployees = async (req, res, next) => {
  try {
    const { enterprise } = req.params;
    const { type } = req.query;

    let employeeType;
    switch (type) {
      case "fulltime":
        employeeType = "FULL_TIME";
        res.message = "정직원 목록 조회";
        break;
      case "parttime":
        employeeType = "PART_TIME";
        res.message = "아르바이트 목록 조회";
        break;
      case "retired":
        employeeType = "RETIRED";
        res.message = "퇴사 직원 목록 조회";
        break;
      default:
        employeeType = null;
        res.message = "모든 직원 목록 조회";
    }

    const results = await service.getAllEmployees(enterprise, { employeeType });

    res.success = results;
    next();
  } catch (error) {
    console.log("getAllEmployees controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 월의 전체 직원 근무 일정을 조회하는 컨트롤러
 */
exports.getMonthlyEmployeeSchedules = async (req, res, next) => {
  try {
    const { enterprise, year, month } = req.params;
    const results = await WorkService.getMonthlyEmployeeSchedules(
      enterprise,
      year,
      month
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getMonthlyEmployeeSchedules v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 일자의 전체 직원 근무 일정을 조회하는 컨트롤러
 */
exports.getDailyEmployeeSchedules = async (req, res, next) => {
  try {
    const { enterprise, year, month, day } = req.params;
    const results = await WorkService.getDailyEmployeeSchedules(
      enterprise,
      year,
      month,
      day
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getDailyEmployeeSchedules v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 일자에 근무 가능한 직원 목록을 조회하는 컨트롤러
 */
exports.getAvailableEmployees = async (req, res, next) => {
  try {
    const { enterprise, year, month, day } = req.params;
    const yyyymmdd = `${year}${month}${day}`;

    const results = await WorkService.getAvailableEmployees(
      enterprise,
      yyyymmdd
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getAvailableEmployees v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 연도의 전체 급여 정산 결과를 조회하는 컨트롤러
 */
exports.getYearlyPayrollResults = async (req, res, next) => {
  try {
    const { enterprise, year } = req.params;
    const results = await PayrollService.getYearlyPayrollResults(
      enterprise,
      year
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getYearlyPayrollResults controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 월의 전체 급여 정산 상세 내역을 조회하는 컨트롤러
 */
exports.getMonthlyPayrollDetailResults = async (req, res, next) => {
  try {
    const { enterprise, year, month } = req.params;
    const results = await PayrollService.getMonthlyPayrollDetail(
      enterprise,
      year,
      month
    );
    res.success = results;
    next();
  } catch (error) {
    console.log("getMonthlyPayrollDetailResults controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 직원의 특정 월 급여 정산 상세 내역을 조회하는 컨트롤러
 */
exports.getMonthlyEmployeePayrollDetailResults = async (req, res, next) => {
  try {
    const { enterprise, employee, year, month } = req.params;
    const results = await PayrollService.getMonthlyEmployeePayrollDetailResults(
      enterprise,
      employee,
      year,
      month
    );
    res.success = results;
    next();
  } catch (error) {
    console.log(
      "getMonthlyEmployeePayrollDetailResults controller error",
      error
    );
    res.error = error;
    next(error);
  }
};

////// 일정 관리 //////

/**
 * 특정 직원의 휴일 근무를 등록하는 컨트롤러
 */
exports.addHolidayWorkRecord = async (req, res, next) => {
  try {
    const { enterprise, employeeId, yyyymmdd } = req.params;
    const { userId: employerId } = req.decoded;
    await WorkService.addHolidayWorkRecord({
      ...req.body,
      enterprise,
      employerId,
      employeeId,
      yyyymmdd,
    });
    res.success = true;
    res.message = "근무 추가 성공";
    next();
  } catch (error) {
    console.log("addHolidayWorkRecord v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 직원의 근무 시간을 변경하는 컨트롤러
 * - 미래 날짜: 예정된 근무 시간 변경
 * - 과거 날짜: 실제 근무 시간 변경
 */
exports.updateDailyWorkRecord = async (req, res, next) => {
  try {
    const { enterprise, employeeId, yyyymmdd } = req.params;
    const { userId: employerId } = req.decoded;
    await WorkService.updateDailyWorkRecord({
      ...req.body,
      enterprise,
      employerId,
      employeeId,
      yyyymmdd,
    });
    res.success = true;
    res.message = "수정 요청 성공";
    next();
  } catch (error) {
    console.log("updateDailyWorkRecord v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 직원의 휴가를 등록하는 컨트롤러
 */
exports.addLeaveRecord = async (req, res, next) => {
  try {
    const { enterprise, employeeId, yyyymmdd } = req.params;
    const { userId: employerId } = req.decoded;
    await WorkService.addLeaveRecord({
      ...req.body,
      enterprise,
      employerId,
      employeeId,
      yyyymmdd,
    });
    res.success = true;
    res.message = "휴가 변경 성공";
    next();
  } catch (error) {
    console.log("addLeaveRecord v3 controller error", error);
    res.error = error;
    next(error);
  }
};

/**
 * 특정 직원의 결근을 등록하는 컨트롤러
 */
exports.addDailyAbsenceRecord = async (req, res, next) => {
  try {
    const { enterprise, employeeId, yyyymmdd } = req.params;
    const { userId: employerId } = req.decoded;
    await WorkService.addDailyAbsenceRecord({
      ...req.body,
      enterprise,
      employerId,
      employeeId,
      yyyymmdd,
    });
    res.success = true;
    res.message = "결근 변경 성공";
    next();
  } catch (error) {
    console.log("updateDailyAbsenceRecord v3 controller error", error);
    res.error = error;
    next(error);
  }
};