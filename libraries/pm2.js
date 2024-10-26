const pm2 = require("pm2");

exports.getInstanceList = (name) => {
  return new Promise((resolve, reject) => {
    pm2.connect(function (err) {
      if (err) {
        console.error(err);
        reject(err);
        // process.exit(2);
      }
      pm2.list((err, list) => {
        if (err) {
          console.error(err);
          reject(err);
        }

        const len = list.filter((item) => item.name === name).length;
        resolve(len);
      });
    });
  });
};
