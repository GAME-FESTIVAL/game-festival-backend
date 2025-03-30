const throwError = require("../utils/throwError");

const validateGameFields = (req, res, next) => {
  const validateFields = [
    "title",
    "price",
    "thumbnails",
    "releaseAt",
    "category",
    "discountPeriod",
    "options",
  ];
  for (const field of validateFields) {
    const value = req.body[field];
    switch (field) {
      case "category":
      case "thumbnails": {
        if (!value[0]) {
          return next(throwError(400, `${field}는 1개 이상이어야 합니다.`));
        }
        break;
      }
      case "discountPeriod": {
        const isDiscount = !!req.body.discountPercentage;
        const { start, end } = value ?? {};
        if (isDiscount && !start) field.start = new Date();
        if (isDiscount && start > end) {
          return next(throwError(400, "할인 기간이 올바르지 않습니다."));
        }
        break;
      }
      case "options": {
        if (!value[0]) break;
        for (const option of value) {
          if (!option.name || !option.price) {
            return next(throwError(400, "옵션 이름과 가격은 필수입니다."));
          }
        }
      }
      default: {
        if (!value) return next(throwError(400, `${field} 필드는 필수입니다.`));
      }
    }
  }
  next();
};

module.exports = {
  validateGameFields,
};
