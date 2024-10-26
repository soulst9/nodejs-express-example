const service = require("./service");

exports.signin = async (req, res, next) => {
  try {
    const { userID, password, appVersion } = req.body;

    const result = await service.signin({
      userID,
      password,
      os: "web",
      appVersion,
    });

    res.success = result;
    next();
  } catch (error) {
    console.log("signin v3 controller error", error);
    res.error = error;
    next(error);
  }
};
