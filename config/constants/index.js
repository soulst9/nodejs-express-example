// referCode length
exports.RANDOM_STRING_LENGTH = 10;

exports.userType = Object.freeze({
  ADMIN: "0",
  EMPLOYEE: "1",
  EMPLOYER: "2",
  TAXACCOUNTANT: "3",
  UNREGISTERED_EMPLOYEE: "4",
});

exports.userTypeKorean = Object.freeze({
  0: "어드민",
  1: "근로자",
  2: "사업주",
  3: "세무대리인",
});

exports.weekDay = Object.freeze({
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
});

exports.koreanWeekday = Object.freeze({
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
});

exports.payments = Object.freeze({
  bonusPay: "특별 상여금",
  mealPay: "식대",
});

exports.deductions = Object.freeze({
  earlyPay: "선지급금(가불)",
});

exports.paystubStep = Object.freeze({
  REALTIME_PAYMENT: -9,
  ABNOMAL_STATUS: -2,
  REQUIRED_PAYMENT: -1,
  TIMESHEET: 0,
  CREATING: 1,
  REVIEWING: 2,
  COMPLETED: 3,
  SENT: 4,
});

const workStatus = Object.freeze({
  OFF_WORK: 0, // 근무아님
  CONTRACT_WORK: 1, // 정규근무
  OVER_WORK: 2, // 연장근무
  HOLIDAY_WORK: 3, // 휴일근무
  TAKEOFF: 4, // 휴가
  UNPAID_TIMEOFF: 5, // 무급휴무
  ABSENCE: 6, // 결근
  DATE_SHIFT: 7, // 근무일 변경
  SHIFT_COMPENSATION: 8, // 대체 근무

  getValueOfWorktype: (status) => {
    if (status === workStatus.CONTRACT_WORK) return "정규근무";
    else if (status === workStatus.OVER_WORK) return "연장근무";
    else if (status === workStatus.HOLIDAY_WORK) return "휴일근무";
    else if (status === workStatus.TAKEOFF) return "유급휴가";
    else if (status === workStatus.UNPAID_TIMEOFF) return "무급휴가";
    else if (status === workStatus.ABSENCE) return "결근";
    else if (status === workStatus.DATE_SHIFT) return "근무일 변경";
    else if (status === workStatus.AFTERNOON_OFF) return "대체근무";
    else return "";
  },

  getValueOfWorktype2: (status) => {
    if (status === workStatus.CONTRACT_WORK) return "";
    else if (status === workStatus.OVER_WORK) return "연장근무";
    else if (status === workStatus.HOLIDAY_WORK) return "휴일근무";
    else if (status === workStatus.TAKEOFF) return "유급휴가";
    else if (status === workStatus.UNPAID_TIMEOFF) return "무급휴가";
    else if (status === workStatus.ABSENCE) return "결근";
    // else if (status === workStatus.MORNING_OFF) return "오전반차";
    // else if (status === workStatus.AFTERNOON_OFF) return "오후반차";
    else return "";
  },
});
exports.workStatus = workStatus;

/**
 * payment.api와 동기화 중요
 */
exports.grade = Object.freeze({
  BASIC: "basic",
  PRO: "pro",
});

exports.LEGAL_HOLIDAYS = Object.freeze({
  2023: [
    "20230101",
    "20230121",
    "20230122",
    "20230123",
    "20230124",
    "20230301",
    "20230501",
    "20230505",
    "20230527",
    "20230606",
    "20230815",
    "20230928",
    "20230929",
    "20230930",
    "20231003",
    "20231009",
    "20231225",
  ],
  2024: [
    "20240101",
    "20240209",
    "20240210",
    "20240211",
    "20240212",
    "20240301",
    "20240410",
    "20240505",
    "20240506",
    "20240515",
    "20240606",
    "20240815",
    "20240916",
    "20240917",
    "20240918",
    "20241003",
    "20241009",
    "20241225",
  ],
});

exports.contractStep = Object.freeze({
  CONTRACT_TERMINATED: -1, // 파기된 계약
  TEMPORARY_CREATE: 0, // 임시저장 상태
  EMPLOYER_CREATE: 1, // 사업주가 작성한 상태
  EMPLOYEE_CREATE: 2, // 근로자가 작성한 상태
  CONTRACT_COMPLETED: 3, // 계약 완료
});

// exports.contractType = Object.freeze({
//   1: "정규직",
//   2: "계약직",
//   3: "아르바이트",
//   4: "프리랜서",
//   5: "일용직",
// });

exports.payType = Object.freeze({
  0: "연봉",
  1: "월급",
  2: "일급",
  3: "시급",
});

exports.authType = Object.freeze({
  PHONE: "phone",
  EMAIL: "email",
});

// 원천세 신고 일(평일 기준)
exports.WITHHOLDING_TAX_DUE = 10;

exports.confirmType = Object.freeze({
  REJECT: 0,
  APPROVE: 1,
});

// 1: 출근수정요청, 2: 퇴근수정요청, 3: 근무변경요청, 4: 추가근무요청, 5: 연차요청, 6: 휴무요청, 7: 시스템알람, 8: QR 생성 요청
exports.noticeType = Object.freeze({
  출근시간수정요청: 1,
  퇴근시간수정요청: 2,
  근무시간변경요청: 3,
  휴일근무요청: 4,
  유급휴가요청: 5,
  무급휴가요청: 6,
  시스템알람: 7,
  타입없음: 8,
  근무일변경요청: 9,
});

exports.leaveType = Object.freeze({
  월차: 0,
  연차: 1,
  오전반차: 2,
  오후반차: 3,

  getValueOfLeaveType: (type) => {
    if (type === this.leaveType.월차) return "월차";
    else if (type === this.leaveType.연차) return "연차";
    else if (type === this.leaveType.오전반차) return "오전반차";
    else if (type === this.leaveType.오후반차) return "오후반차";
    else return "";
  },
});

exports.rollingTargetType = Object.freeze({
  ALL: "0",
  EMPLOYEE: "1",
  EMPLOYER: "2",
});

exports.messageType = Object.freeze({
  COMMUTE_COMPLETE_ROLLING: "0", // 미 적용 (legacy에 존재)
  ENTERPRISE_CREATE_ROLLING: "1", // 적용 중
  CONTRACT_CREATE_ROLLING: "2", // 적용 중
  PAYSTUB_COMPLETE_ROLLING: "3", // 미 적용 (4번과 겹침)
  PAYROLL_CREATE_ROLLING: "4", // 적용 중
  PAYSTUB_MAILER_ROLLING: "5", // 미 적용 (추후에 고민d)
});

exports.inviteStep = Object.freeze({
  NON_MEMBER_INVITE: "0", // 비회원 회원가입 추천
  ENABLE_CONTRACT: "1", // 계약 근로 체결 가능
  INVITE_COMPLETED: "2", // 초대 완료
});

exports.isAWSRuning = () => {
  return (
    process.env.NODE_ENV === "staging" || process.env.NODE_ENV === "production"
  );
};

exports.footContent = `더 자세한 내용은 메뉴얼을 통해 확인하실 수 있습니다.\n[바니마니 사용자 매뉴얼 바로가기]: https://www.banimani.net/faq/faq-1.html \n\n사용 중 문의가 있으신 경우 [카카오톡 채널] “바니마니”로 문의 주시기 바랍니다.\n[카카오톡 채널 바니마니 바로가기]: https://pf.kakao.com/_Avllxj/chat \n\n감사합니다.`;

exports.GPS = Object.freeze({
  MAX_LATITUDE: 90,
  MIN_LATITUDE: -90,
  MAX_LONGITUDE: 180,
  MIN_LONGITUDE: -180,
  COMMUTE_PADDING_RANGE: 100,
});

exports.payToKorean = (key) => {
  const keyMap = {
    sumPay: "지급총액",
    basePay: "기본급",
    bonusPay: "특별 상여금",
    mealPay: "식대",
    mealPay1: "식대",
    mealPay2: "식대",
    drivingPay: "자가운전",
    childcarePay: "출산보육수당",
    researchPay: "연구비",
    // 다른 항목들도 필요에 따라 추가할 수 있습니다.
  };

  return keyMap[key] || key;
};

exports.funnelSurvey202301Short = Object.freeze({
  0: "검색",
  1: "SNS",
  2: "TV, 지하철",
  3: "인플루언서",
  4: "행사, 전단",
  5: "지인 추천",
  6: "기타",
});

exports.funnelSurvey202403Short = Object.freeze({
  0: "웹 검색",
  1: "앱스토어 검색",
  2: "카페 및 커뮤니티",
  3: "지인 추천",
  4: "SNS",
  5: "TV,지하철 광고",
  6: "기타",
});

exports.employeeInterest202403FirstShort = Object.freeze({
  0: "출퇴근 관리",
  1: "휴가 등 일정 관리",
  2: "성과 평가 및 통계화",
  3: "정확한 급여 계산",
  4: "법규 준수",
  5: "기타",
});

exports.employeeInterest202403SecondShort = Object.freeze({
  0: "전자근로계약",
  1: "근로자 출퇴근 기록",
  2: "근태 관리",
  3: "급여/세금 자동 계산",
  4: "급여명세서 발행",
  5: "인사/노무 정보",
});

exports.employeeInterest202405FirstShort = Object.freeze({
  0: "근로계약서 작성, 변경, 갱신",
  1: "근로자의 출퇴근 관리",
  2: "정확한 급여 계산",
  3: "세무대리인 신고자료 전송",
  4: "법규준수",
  5: "근태관리 (휴가, 조퇴, 결근 등)",
  6: "기타 (직접 입력 가능)",
});

exports.employeeInterest202405SecondShort = Object.freeze({
  0: "전자근로계약",
  1: "근로자 출퇴근 기록",
  2: "근태 관리",
  3: "급여/세금 자동 계산",
  4: "급여명세서 발행",
  5: "인사/노무 정보",
});

exports.convertInviteStepToKorean = Object.freeze({
  null: "초대 코드 생성",
  1: "초대 수락",
  2: "계약서 작성 완료",
});

exports.maxNonTaxableAmount = Object.freeze({
  2023: {
    mealPay: 200000,
    drivingPay: 200000,
    researchPay: 200000,
    childcarePay: 100000,
  },
  2024: {
    mealPay: 200000,
    drivingPay: 200000,
    researchPay: 200000,
    childcarePay: 200000,
  },
  2025: {
    mealPay: 200000,
    drivingPay: 200000,
    researchPay: 200000,
    childcarePay: 200000,
  },
});

// 거절: 0, 승인: 1
exports.confirmType = Object.freeze({
  REJECT: 0,
  APPROVE: 1,
});

// 고용 타입
exports.employmentType = Object.freeze({
  정직원: 1,
  계약직: 2,
  아르바이트: 3,
});

const reverseEmploymentType = Object.fromEntries(
  Object.entries(exports.employmentType).map(([key, value]) => [value, key])
);

// 이제 getEmploymentType 함수를 다음과 같이 수정할 수 있습니다:
exports.employmentValue = (contracttype) => {
  return reverseEmploymentType[contracttype];
};

exports.workTimeRecordStatus = Object.freeze({
  APPROVAL: 1,
  REJECT: 2,
  PENDING: 3,
  CANCEL: 4,
});

exports.workTimeRecordStatusKorean = Object.freeze({
  1: "승인",
  2: "거절",
  3: "대기",
  4: "취소",
});

exports.leavePayType = Object.freeze({
  UNPAID: 0,
  PAID: 1,
});

// 근무 요청 타입
exports.workRequestType = Object.freeze({
  CHANGED: "Changed",
  HOLIDAY_WORK: "HolidayWork",
  LEAVE: "Leave",
  SHIFT_WORK: "ShiftWork",
  BUSINESS_TRIP: "BusinessTrip",
  FIELD_WORK: "FieldWork",
  ABSENCE: "Absence",
});

// 근무요청 상태
exports.workRequestStatus = Object.freeze({
  NONE: "None",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELED: "Canceled",
  DIRECT_MODIFIED: "DirectModified",
});
exports.MAX_INVITE_CODE_GENERATE_ATTEMPTS = 10;

// 설정값의 타입 (boolean, integer, string 등)
exports.settingType = Object.freeze({
  SWITCH: "switch",
  SELECTED: "selected",
  STRING: "string",
  NUMBER: "number",
});

// onoff 설정값
exports.onoff = Object.freeze({
  ON: 1,
  OFF: 0,
});

// 출퇴근 기록 타입
exports.commuteType = Object.freeze({
  BOTH: "both",
  QR: "qr",
  GPS: "gps",
});

// 근로소득, 사업소득 구분
exports.incomeType = Object.freeze({
  EMPLOYEE_INCOME: "employee_income",
  BUSINESS_INCOME: "business_income",
  ETC_INCOME: "etc_income",
});

// 사업장 설정의 범위
exports.settingScope = Object.freeze({
  ENTERPRISE: "enterprise",
  EMPLOYEE: "employee",
});

// 사업소득 시 세율
exports.businessIncomeRate = Object.freeze({
  _3_3: "3.3%",
  _8_8: "8.8%",
});

// 4대보험 정의
exports.insuranceType = Object.freeze({
  PENSION: "pension",
  HEALTH_INS: "healthIns",
  EMPLOYMENT_INS: "employmentIns",
  COMPENSATION_INS: "compensationIns",
});

exports.TAX_RATES = {
  2023: {
    PENSION: 0.045,
    HEALTH_INS: 0.03545,
    CARE_INS: 0.004591,
    EMPLOYMENT_INS: 0.009,
    LOCAL_INCOME_TAX: 0.1,
    BUSINESS_INCOME_TAX: 0.03,
    ETC_INCOME_TAX: 0.08,
  },
};

// 근로계약서 서명 여부
exports.contractSign = Object.freeze({
  NOT_SIGNED: 0,
  SIGNED: 1,
});

//
exports.contractType = Object.freeze({
  정규직: 1,
  계약직: 2,
  아르바이트: 3,
  프리랜서: 4,
  일용직: 5,
});
