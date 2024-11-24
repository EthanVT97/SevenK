import { Request, Response, NextFunction } from 'express';
import { languageService } from '../services/language.service';

export const languageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Get language preference
    const lang = languageService.getLanguage(req);

    // Add translate function to response locals
    res.locals.translate = (key: string) => languageService.translate(key, lang);
    res.locals.formatNumber = (num: number) => languageService.formatNumber(num, lang);
    res.locals.formatCurrency = (amount: number) => languageService.formatCurrency(amount, lang);
    res.locals.formatDate = (date: Date) => languageService.formatDate(date, lang);

    next();
}; 