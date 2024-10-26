const aligoapi = require("aligoapi");
const { env } = require("../../config/env");

// sender: env.sms.senderPhoneNumber,
// receiver: phoneNumber,

const auth = {
  key: env.sms.key,
  user_id: env.sms.id,
};

/**
 * 
 * @param {*} params 
 * @returns 
 *  msg_type: SMS(단문), LMS(장문), MMS(그림문자)
    title: 문자제목(LMS, MMS만 허용) // (1~44Byte)
    destination: %고객명% 치환용 입력
    rdate: 예약일(현재일이상) // YYYYMMDD
    rtime: 예약시간-현재시간기준 10분이후 // HHMM
    image: 첨부이미지 // JPEG, PNG, GIF
 */

exports.send = (params) => {
  const { title, receiver, msg, msg_type } = params;

  // 메시지 발송하기
  const req = {
    /*** 필수값입니다 ***/
    headers: "application/json",
    body: {
      sender: env.sms.senderPhoneNumber,
      receiver,
      title,
      msg,
      msg_type: msg_type === undefined ? "SMS" : msg_type,
    },
  };

  return new Promise((resolve, reject) => {
    // promise.then(resolve, reject);
    aligoapi
      .send(req, auth)
      .then((r) => {
        return resolve(r);
        // res.send(r);
      })
      .catch((e) => {
        return reject(e);
        // res.send(e);
      });
  });
};
