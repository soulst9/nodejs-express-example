const dayjs = require("../day");

class Workday {
  constructor({ start, end }) {
    this._start = start;
    this._end = end;
    this._startDayjs = undefined;
    this._endDayjs = undefined;
    this._hours = 0;
    this._minutes = 0;

    this.init();
  }

  init() {
    this._startDayjs = dayjs(this._start.yyyymmdd)
      .set("hour", this._start.hour)
      .set("minute", this._start.minute)
      .set("second", 0)
      .set("millisecond", 0);

    this._endDayjs = dayjs(this._end.yyyymmdd)
      .set("hour", this._end.hour)
      .set("minute", this._end.minute)
      .set("second", 0)
      .set("millisecond", 0);

    const dur = dayjs.duration(this._endDayjs.diff(this._startDayjs));
    this._hours = dur.hours();
    this._minutes = dur.minutes();

    console.log(this._hours, this._minutes);
  }

  // distance(start, end) {
  //   const arr = [0, 1, 2, 3, 4, 5, 6]; // 일 ~ 토
  //   return Math.min(
  //     Math.abs(end - start),
  //     Math.abs(arr.length - arr[start] + arr[end])
  //   );
  // }

  getStartDate() {
    return this._start.yyyymmdd;
  }

  getEndDate() {
    return this._end.yyyymmdd;
  }

  getStartDayjs() {
    return this._startDayjs;
  }

  getEndDayjs() {
    return this._endDayjs;
  }

  hours() {
    return this._hours;
  }

  minutes() {
    return this._minutes;
  }
}

class RealWorkday extends Workday {
  constructor({ workType, start, end }) {
    super({ workType, start, end });
  }

  getStartDate() {
    return this._start.yyyymmdd;
  }

  getEndDate() {
    return this._end.yyyymmdd;
  }

  getStart() {
    return this._start;
  }

  getEnd() {
    return this._end;
  }

  getStartWeekday() {
    return this._start?.weekday;
  }

  getEndWeekday() {
    return this._end?.weekday;
  }

  convertMinuteByWeek() {
    return this._start;
  }
}

class ContractWork {
  constructor(works) {
    this.works = [];
    works.forEach((workday) => {
      this.addWork(workday);
    });
  }

  addWork(workday) {
    if (!workday instanceof Workday) {
      throw new Error("workday must be an instance of class Workday.");
    }
    this.works.push(workday);
  }

  getWorks() {
    return this.works;
  }
}

class Contract {
  constructor({ hourlyPay, contractWork }) {
    this._hourlyPay = hourlyPay;
    this._contractWork = contractWork;
  }

  getContractWork() {
    return this._contractWork.getWorks();
  }
}

class ClassifyWork {
  constructor(contract, realWorkday) {
    if (!contract || !realWorkday) {
      throw new Error("Not enough arguments");
    }

    if (!contract instanceof Contract) {
      throw new Error("contract must be an instance of class Contract.");
    }

    if (!realWorkday instanceof RealWorkday) {
      throw new Error("workTime must be an instance of class RealWorkday.");
    }

    // if (!workPlace instanceof WorkPlace) {
    //   throw new Error("workTime must be an instance of class WorkPlace.");
    // }

    this._contract = contract;
    this._realWorkday = realWorkday;
  }

  isHolidayWork() {
    return LEGAL_HOLIDAYS.includes(this._realWorkday.getStartDate());
  }

  convertTime(weekday, hour, minute) {
    return weekday * 24 + hour + minute / 60;
  }

  convertTimeMinute(weekday, hour, minute) {
    return weekday * 24 * 60 + hour * 60 + minute;
  }

  calcTime(minutes) {
    return {
      hours: parseInt(minutes / 60),
      minutes: minutes % 60,
    };
  }

  subtractTime(time1, time2) {
    console.log(
      "====",
      time2.hour * 60 + time2.minute,
      time1.hour * 60 + time1.minute
    );

    return this.calcTime(
      time2.hour * 60 + time2.minute - (time1.hour * 60 + time1.minute)
    );
  }

  diffDate(start, end) {
    const x = dayjs()
      .set("hour", start.hour)
      .set("minute", start.minute)
      .set("second", 0)
      .set("millisecond", 0);
    // console.log("x", x);
    const y = dayjs()
      .set("hour", end.hour)
      .set("minute", end.minute)
      .set("second", 0)
      .set("millisecond", 0);
    // console.log("y", y);

    const dur = dayjs.duration(x.diff(y));
    // console.log(dur.hours());
    // console.log(dur.minutes());

    return {
      hours: dur.hours(),
      minutes: dur.minutes(),
    };
  }

  isContractWork() {
    const realWork = this._realWorkday;
    const convertWorkTimes = this._contract.getContractWork().map((workday) => {
      // console.log(workday);
      return [
        this.convertTime(
          workday.start.weekday,
          workday.start.hour,
          workday.start.minute
        ),
        this.convertTime(
          workday.end.weekday,
          workday.end.hour,
          workday.end.minute
        ),
      ];
    });

    // console.log("convertWorkTimes", convertWorkTimes);

    const convertRealWorkTime = [
      this.convertTime(
        realWork._start.weekday,
        realWork._start.hour,
        realWork._start.minute
      ),
      this.convertTime(
        realWork._end.weekday,
        realWork._end.hour,
        realWork._end.minute
      ),
    ];

    let isContractWork = false;
    // console.log(convertRealWorkTime[0], convertRealWorkTime[1]);

    for (let i = 0; i < convertWorkTimes.length; i++) {
      if (
        convertRealWorkTime[0] >= convertWorkTimes[i][0] &&
        convertRealWorkTime[0] <= convertWorkTimes[i][1]
      ) {
        isContractWork = true;
        break;
      } else if (
        convertRealWorkTime[1] >= convertWorkTimes[i][0] &&
        convertRealWorkTime[1] <= convertWorkTimes[i][1]
      ) {
        isContractWork = true;
        break;
      } else if (
        convertRealWorkTime[0] <= convertWorkTimes[i][0] &&
        convertRealWorkTime[1] >= convertWorkTimes[i][1]
      ) {
        isContractWork = true;
        break;
      } else if (
        convertRealWorkTime[0] >= convertWorkTimes[i][0] &&
        convertRealWorkTime[1] <= convertWorkTimes[i][1]
      ) {
        isContractWork = true;
        break;
      }
    }

    console.log("isContractWork = ", isContractWork);

    return isContractWork;
  }

  isOverWork() {
    const _contractWork = this._contract.getContractWork();
    const weekdays = _contractWork.map((workday) => workday.start.weekday);
    const position = weekdays.indexOf(this._realWorkday.getStartWeekday());

    const { start: cStart, end: cEnd } = _contractWork[position];
    const { _start: rStart, _end: rEnd } = this._realWorkday;

    // console.log(cStart, cEnd, rStart, rEnd);

    /**
     * 출근 전 초과 근무 시간의 계산은
     * 계약출근시간 - 실제출근시간
     */
    const beforeOver = this.diffDate(
      {
        weekday: cStart.weekday,
        hour: cStart.hour,
        minute: cStart.minute,
      },
      {
        weekday: rStart.weekday,
        hour: rStart.hour,
        minute: rStart.minute,
      }
    );

    /**
     * 퇴근 이후 초과 근무 시간의 경우
     * 실제퇴근시간 - 계약퇴근시간
     */

    const afterOver = this.diffDate(
      {
        weekday: rEnd.weekday,
        hour: rEnd.hour,
        minute: rEnd.minute,
      },
      {
        weekday: cEnd.weekday,
        hour: cEnd.hour,
        minute: cEnd.minute,
      }
    );

    console.log("beforeOver", beforeOver);
    console.log("afterOver", afterOver);

    // 초과된 시간만 의미 있음.
    beforeOver.hours = beforeOver.hours < 0 ? 0 : beforeOver.hours;
    beforeOver.minutes = beforeOver.minutes < 0 ? 0 : beforeOver.minutes;
    afterOver.hours = afterOver.hours < 0 ? 0 : afterOver.hours;
    afterOver.minutes = afterOver.minutes < 0 ? 0 : afterOver.minutes;

    const tt = this.calcTime(
      (beforeOver.hours + afterOver.hours) * 60 +
        (beforeOver.minutes + afterOver.minutes)
    );

    console.log("tt", tt);

    const overWork = {
      hour: tt.hours < 0 ? 0 : tt.hours,
      minute: tt.minutes < 0 ? 0 : tt.minutes,
    };

    if (overWork.hour > 0 || overWork.minute > 0) {
      return true;
    }

    return false;
  }
}

module.exports = {
  Workday,
  RealWorkday,
  ContractWork,
  Contract,
  ClassifyWork,
};
