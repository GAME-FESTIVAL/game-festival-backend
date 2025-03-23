const throwError = (status, message) => {
  const errorData = new Error(message);
  errorData.status = status;
  return errorData;
};

module.exports = throwError;
