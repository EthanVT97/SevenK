"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageMiddleware = void 0;
const language_service_1 = require("../services/language.service");
const languageMiddleware = (req, res, next) => {
    // Get language preference
    const lang = language_service_1.languageService.getLanguage(req);
    // Add translate function to response locals
    res.locals.translate = (key) => language_service_1.languageService.translate(key, lang);
    res.locals.formatNumber = (num) => language_service_1.languageService.formatNumber(num, lang);
    res.locals.formatCurrency = (amount) => language_service_1.languageService.formatCurrency(amount, lang);
    res.locals.formatDate = (date) => language_service_1.languageService.formatDate(date, lang);
    next();
};
exports.languageMiddleware = languageMiddleware;
