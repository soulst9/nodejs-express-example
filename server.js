const http = require("http");
const cron = require("node-cron");

const app = require("./app");
const { env } = require("./config/env");
const memory = require("./config/env/memory");
const port = env.app.port;
const server = http.createServer(app);
const job1 = require("./jobs/job_delete_enterprise");
const job2 = require("./jobs/job_create_file_timesheet");
const job3 = require("./jobs/job_employer_assistant_alarm");
const job4 = require("./jobs/job_employee_assistant_alarm");
const remindEmployer = require("./jobs/job_employer_remind_service");
const remindEmployee = require("./jobs/job_employee_remind_service");
const inactiveUser = require("./jobs/job_inactive_user");
const paymentAPI = require("./libraries/external/payment");
const Helper = require("./libraries/helper");
const mongoose = require("mongoose");
const fs = require("fs");
const SimpledTaxTable = require("./mongo/models/SimpledTaxTable");
const ExcelJS = require("exceljs");
const join = require("path").join;

// import mongodb models
const models = join(__dirname, "mongo/models");
fs.readdirSync(models)
  .filter((file) => ~file.search(/^[^.].*\.js$/))
  .forEach((file) => require(join(models, file)));

// test
// const { legacyAPI } = require("./libraries/external/index");
//-- test

// const payClosingDays = [1, 2, 3]; // At 00:30 on day-of-month 1, 2, and 3
const perDaily = env.app.payClose.perDaily;

const setMemory = async () => {
  const products = await paymentAPI.getProducts();
  memory.setSharedMemory("product", products);
};

server.listen(port, async () => {
  console.log(`listen on port: ${port} | NODE_ENV: ${process.env.NODE_ENV}`);

  // docker-compose의 환경 파일 누락 여부 확인
  Helper.isNullObjectAndThrow(env);

  // product에 대한 정보
  // 추후에 redis로 대체
  await setMemory();

  // 테스트
  //
  // await inactiveUser.change();
  // await remindEmployer.unregisteredEmployee();
  // await job4.alarmEmployeesForWorkAlerts("start");
  // await job4.alarmEmployeesForWorkAlerts("finish");
  // await job3.alarmResignationBefore();

  // [기업회원] 사업장 완전 삭제
  // 10일 후 완전 삭제 진행 (복구 불가)
  cron.schedule(`1 0 * * *`, job1.run, {
    timezone: "Asia/Seoul",
  });

  /**
   * 기업회원 알림
   */

  // [기업회원] 급여정산
  // 00:30 ~ 07:00 까지만 진행
  // 처음에는 1 ~ 10일까지만 진행했다가 현재는 모든 일자에 대해 진행
  const cronjob2 = `${perDaily} * * *`;
  cron.schedule(cronjob2, job2.run, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 장기 미태깅 알림 (퇴사 진행 권고)
  // 10일 단위로만 알림 (10, 20, 30, 40 ...)
  cron.schedule(`0 9 * * *`, job3.alarmMore10dayUntagged, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 사업장 등록 후 직원 등록을 하지 않은 경우 알림
  cron.schedule(`0 10 * * *`, remindEmployer.unregisteredEmployee, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 근로계약이 만료되는 직원이 있는 경우 알림
  cron.schedule(`0 12 * * *`, job3.alarmResignationBefore, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 원천세 신고 알림
  cron.schedule(`0 15 7-12 * *`, job3.alarmWithholdingTax, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 월 마지막 날 모든 근로자 근태 통계 알림
  cron.schedule(`0 18 28-31 * *`, job3.alarmTimeSheetStatsLastday, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 내일 휴가자 알림
  cron.schedule(`0 20 * * *`, job3.alarmHolidayTomorrow, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 사업장 등록을 하지 않은 사업주에게 리마인드 알림 (3일, 10일)
  cron.schedule(`30 9 * * *`, remindEmployer.unregisterEnterprise, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 근로계약서 임시저장 상태에서 3일이 지난 경우 알림 (3일)
  cron.schedule(`30 10 * * *`, remindEmployer.draftContract, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 출퇴근 기록을 사용하고 있는 사업장에 대해 프로모션 추천 알림 (10일)
  cron.schedule(`30 11 * * *`, remindEmployer.past10daytagged, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 근로계약서 전송 후 서명이 필요한 경우 (2일)
  cron.schedule(`30 13 * * *`, remindEmployer.signing, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 급여정산 완료하기 알림 (급여정산 생성 후 1일 지남)
  cron.schedule(`30 14 * * *`, remindEmployer.paystubCompleted, {
    timezone: "Asia/Seoul",
  });

  /**
   * 개인회원 알림
   */

  // [개인회원] 출근 미태깅 알림
  // 출근/퇴근시간 이후 (30~40)분 사이의 미태깅 근로자 대상
  const GAP = 10; // 10 minutes
  cron.schedule(
    `*/${GAP} * * * *`,
    () => {
      // job4.alarm30minUntaggedAtWork(GAP); // 출근
      // job4.alarm30minUntaggedOffWork(GAP); // 퇴근
      job4.alarmEmployeesForWorkAlerts("start"); // 근무시간 알림
      job4.alarmEmployeesForWorkAlerts("finish"); // 근무시간 알림
    },
    {
      timezone: "Asia/Seoul",
    }
  );

  // [개인회원] 마지막 출퇴근 기록이 7일된 근로자에게 출퇴근 기록을 추천하는 리마인드 알람
  cron.schedule(`30 12 * * *`, remindEmployee.past7dayLastCommute, {
    timezone: "Asia/Seoul",
  });

  // [기업회원] 근로계약서 전송 후 서명이 필요한 경우 (2일)
  cron.schedule(`30 15 * * *`, remindEmployee.signing, {
    timezone: "Asia/Seoul",
  });

  /**
   * 회원 전체 대상
   */
  cron.schedule(`30 0 * * *`, inactiveUser.change, {
    timezone: "Asia/Seoul",
  });

  await Helper.sleep(2000);

  const MAX_RETRIES = 5;
  let currentRetry = 0;

  const mongoConnect = () => {
    console.log("mongodb connecting...");

    mongoose
      .connect(env.mongo.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(async () => {
        console.log("mongodb connected");
        currentRetry = 0;

        await seedDatabase();
        if (process.env.NODE_ENV !== "production") {
          mongoose.set("debug", true);
        }
      })
      .catch((err) => {
        console.error("mongodb connection failed", err);

        currentRetry++;

        if (currentRetry <= MAX_RETRIES) {
          console.log(`Retry ${currentRetry}/${MAX_RETRIES}...`);

          setTimeout(mongoConnect, 5000);
        } else {
          console.error("Max retries reached. mongodb is not connected.");
        }
      });
  };

  mongoConnect();
});

const seedDatabase = async () => {
  try {
    const data = await readExcel();

    // 이미 데이터가 존재하면 삽입 안함
    const count = await SimpledTaxTable.countDocuments();
    console.log("count", count);
    if (count > 0) {
      return;
    }
    await SimpledTaxTable.insertMany(data);
  } catch (error) {
    console.log("seedDatabase error", error);
  }
};

const readExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(
    "./reference/2023년_근로소득_간이세액표(조견표).xlsx"
  ); // 여기에 파일 경로 넣기
  const worksheet = workbook.getWorksheet("Sheet1"); // 시트 이름 설정

  // 시트에서 각 행을 읽어서 데이터베이스에 삽입
  const result = [];
  for (let i = 6; i <= 652; i++) {
    // 첫 번째 행은 헤더라고 가정하고 무시
    const row = worksheet.getRow(i);

    // 부양가족 1
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("C4").value),
      taxAmount: row.getCell(`C`).value?.result ?? 0,
    });
    // 부양가족 2
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("D4").value),
      taxAmount: row.getCell(`D`).value?.result ?? 0,
    });
    // 부양가족 3
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("E4").value),
      taxAmount: row.getCell(`E`).value?.result ?? 0,
    });
    // 부양가족 4
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("G4").value),
      taxAmount: row.getCell(`G`).value?.result ?? 0,
    });
    // 부양가족 5
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("I4").value),
      taxAmount: row.getCell(`I`).value?.result ?? 0,
    });
    // 부양가족 6
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("K4").value),
      taxAmount: row.getCell(`K`).value?.result ?? 0,
    });
    // 부양가족 7
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("M4").value),
      taxAmount: row.getCell(`M`).value?.result ?? 0,
    });
    // 부양가족 8
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("O4").value),
      taxAmount: row.getCell(`O`).value?.result ?? 0,
    });
    // 부양가족 9
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("Q4").value),
      taxAmount: row.getCell(`Q`).value?.result ?? 0,
    });
    // 부양가족 10
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("S4").value),
      taxAmount: row.getCell(`S`).value?.result ?? 0,
    });
    // 부양가족 11
    result.push({
      year: 2023,
      incomeMin: Number(row.getCell("A").value),
      incomeMax: Number(row.getCell("B").value),
      dependents: Number(worksheet.getCell("U4").value),
      taxAmount: row.getCell(`U`).value?.result ?? 0,
    });
  }

  return result;
};
