module.exports = (req, res, next) => {
  if (res.success === undefined) {
    next();
  } else {
    return res.status(200).json({
      status_code: "01",
      status_name: "OK",
      data: res.success,
      message: res.message,
    });
  }
};
