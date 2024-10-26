const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { authorization } = require("../../../middleware/auth");

/**
 * 사업장 직원 관리 라우터
 * 직원 기본 정보, 근무 현황, 급여 정산, 일정 관리 등의 기능을 제공
 */

/**
 * 직원 기본 정보 관리
 */

/**
 * @route    GET /:enterprise/employees
 * @desc     사업장의 전체 직원 목록을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 */
router.get("/:enterprise/employees", authorization, controller.getAllEmployees);

/**
 * @route    PUT /:enterprise/employees/:employee
 * @desc     특정 직원의 기본 정보를 수정
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employee - 직원 식별자
 */
router.put(
  "/:enterprise/employees/:employee",
  authorization,
  controller.updateEmployeeInfo
);

/**
 * 근무 현황 관리
 */

/**
 * @route    GET /:enterprise/employees/status
 * @desc     전체 직원들의 현재 근무 상태를 실시간으로 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 */
router.get(
  "/:enterprise/employees/status",
  authorization,
  controller.getEmployeeWorkStatus
);

/**
 * @route    GET /:enterprise/employees/schedules/:year/:month
 * @desc     특정 월의 전체 직원 근무 일정을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 */
router.get(
  "/:enterprise/employees/schedules/:year/:month",
  authorization,
  controller.getMonthlyEmployeeSchedules
);

/**
 * @route    GET /:enterprise/employees/schedules/:year/:month/:day
 * @desc     특정 일자의 전체 직원 근무 일정을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 *          day - 일
 */
router.get(
  "/:enterprise/employees/schedules/:year/:month/:day",
  authorization,
  controller.getDailyEmployeeSchedules
);

/**
 * @route    GET /:enterprise/employees/available/:year/:month/:day
 * @desc     특정 일자에 근무 가능한 직원 목록을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 *          day - 일
 */
router.get(
  "/:enterprise/employees/available/:year/:month/:day",
  authorization,
  controller.getAvailableEmployees
);

/**
 * 급여 정산 관리
 */

/**
 * @route    GET /:enterprise/paystubs/year/:year
 * @desc     특정 연도의 전체 급여 정산 결과를 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 */
router.get(
  "/:enterprise/paystubs/year/:year",
  authorization,
  controller.getYearlyPayrollResults
);

/**
 * @route    GET /:enterprise/paystubs/year/:year/:month
 * @desc     특정 월의 전체 급여 정산 상세 내역을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 */
router.get(
  "/:enterprise/paystubs/year/:year/:month",
  authorization,
  controller.getMonthlyPayrollDetailResults
);

/**
 * @route    GET /:enterprise/employees/:employee/paystubs/:year/:month
 * @desc     특정 직원의 특정 월 급여 정산 상세 내역을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employee - 직원 식별자
 *          year - 연도
 *          month - 월
 */
router.get(
  "/:enterprise/employees/:employee/paystubs/:year/:month",
  authorization,
  controller.getMonthlyEmployeePayrollDetailResults
);

/**
 * @route    GET /:enterprise/paystubs/:year/:month/permanent-employee-count
 * @desc     특정 월의 정규직 직원 수 현황을 조회
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 */
router.get(
  "/:enterprise/paystubs/:year/:month/permanent-employee-count",
  authorization,
  controller.getMonthlyEmployeeCountStatus
);

/**
 * @route    PATCH /:enterprise/paystubs/:year/:month/permanent-employee-count
 * @desc     특정 월의 정규직 직원 수 현황을 업데이트
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          year - 연도
 *          month - 월
 */
router.patch(
  "/:enterprise/paystubs/:year/:month/permanent-employee-count",
  authorization,
  controller.updateMonthlyEmployeeCountStatus
);

/**
 * 일정 관리
 */

/**
 * @route    POST /:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/holiday-work-records
 * @desc     직원의 특정 일자 휴일 근무 기록을 추가
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employeeId - 직원 식별자
 *          yyyymmdd - 날짜(YYYYMMDD 형식)
 */
router.post(
  "/:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/holiday-work-records",
  authorization,
  controller.addHolidayWorkRecord
);

/**
 * @route    PATCH /:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/work-records
 * @desc     직원의 특정 일자 근무 기록을 수정
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employeeId - 직원 식별자
 *          yyyymmdd - 날짜(YYYYMMDD 형식)
 */
router.patch(
  "/:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/work-records",
  authorization,
  controller.updateDailyWorkRecord
);

/**
 * @route    POST /:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/leave-records
 * @desc     직원의 특정 일자 휴가 기록을 추가
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employeeId - 직원 식별자
 *          yyyymmdd - 날짜(YYYYMMDD 형식)
 */
router.post(
  "/:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/leave-records",
  authorization,
  controller.addLeaveRecord
);

/**
 * @route    POST /:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/absence-records
 * @desc     직원의 특정 일자 결근 기록을 추가
 * @access   Private
 * @params   enterprise - 사업장 식별자
 *          employeeId - 직원 식별자
 *          yyyymmdd - 날짜(YYYYMMDD 형식)
 */
router.post(
  "/:enterprise/employees/:employeeId/yyyymmdd/:yyyymmdd/absence-records",
  authorization,
  controller.addDailyAbsenceRecord
);

module.exports = router;