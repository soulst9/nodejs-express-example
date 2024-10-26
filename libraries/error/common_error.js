module.exports = {
  INTERNAL_SERVER_ERROR: "서버 내부 오류",
  METHOD_NOT_ALLOWED: "허용되지 않은 메소드",
  BAD_REQUEST: "잘못된 요청",
  UNAUTHENTICATED: "인증오류",
  UNAUTHORIZED: "권한없음",
  CONFLICT: "이미 처리됨",
  UNKNOWN:
    "[시스템 오류, 네트웍 오류 등] 알 수 없는 오류로 인해 요청을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.",
  NOT_FOUND: "요청한 자원을 찾을 수 없음.",
  FORBIDDEN: "접근할 수 없는 정보",
  MISSING_REQUIRED_PARAMETERS: "필수 파라미터 누락",
  OUT_OF_DATE_ARCHIVE: (year) =>
    `서비스 정책에 따른 보관연도(${year}년)가 지났어요.`,
  INVALID_DATE: "날짜가 유효하지 않습니다.",
  IS_NOT_ADMIN: "Admin 유저가 아닙니다",
  INVALID_EMAIL: "이메일 주소가 유효하지 않습니다",
  INVALID_DATATYPE: "데이터 형식의 타입이 유효하지 않습니다.",
};
