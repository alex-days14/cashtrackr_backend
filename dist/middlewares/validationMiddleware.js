"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInputErrors = void 0;
const express_validator_1 = require("express-validator");
const handleInputErrors = (req, res, next) => {
    let errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};
exports.handleInputErrors = handleInputErrors;
//# sourceMappingURL=validationMiddleware.js.map