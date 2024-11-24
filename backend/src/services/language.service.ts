import { Request } from 'express';

// Define available languages
export type Language = 'my' | 'en';

// Define translation structure
interface Translations {
    [key: string]: {
        my: string;
        en: string;
    };
}

// Define translations
const translations: Translations = {
    // Auth messages
    'login.success': {
        my: 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ',
        en: 'Login successful'
    },
    'login.failed': {
        my: 'ဖုန်းနံပါတ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်',
        en: 'Invalid phone number or password'
    },

    // Wallet messages
    'wallet.insufficient': {
        my: 'လက်ကျန်ငွေ မလုံလောက်ပါ',
        en: 'Insufficient balance'
    },
    'wallet.deposit.success': {
        my: 'ငွေဖြည့်ခြင်း အောင်မြင်ပါသည်',
        en: 'Deposit successful'
    },
    'wallet.withdraw.success': {
        my: 'ငွေထုတ်ခြင်း အောင်မြင်ပါသည်',
        en: 'Withdrawal successful'
    },

    // Lottery messages
    'lottery.bet.success': {
        my: 'လောင်းကစားခြင်း အောင်မြင်ပါသည်',
        en: 'Bet placed successfully'
    },
    'lottery.bet.invalid': {
        my: 'မှားယွင်းသော လောင်းကစားမှု ဖြစ်နေပါသည်',
        en: 'Invalid bet'
    },
    'lottery.win': {
        my: 'ဂုဏ်ယူပါတယ်! သင်အနိုင်ရရှိပါသည်',
        en: 'Congratulations! You won'
    },
    'lottery.lose': {
        my: 'စိတ်မကောင်းပါဘူး။ နောက်တခါ ထပ်ကြိုးစားပါ',
        en: 'Sorry, better luck next time'
    },

    // Error messages
    'error.general': {
        my: 'တစ်ခုခုမှားယွင်းနေပါသည်။ နောက်မှ ထပ်မံကြိုးစားပါ',
        en: 'Something went wrong. Please try again later'
    },
    'error.validation': {
        my: 'ထည့်သွင်းထားသော အချက်အလက်များ မှားယွင်းနေပါသည်',
        en: 'Invalid input data'
    },

    // Success messages
    'success.general': {
        my: 'အောင်မြင်စွာ ဆောင်ရွက်ပြီးပါပြီ',
        en: 'Operation successful'
    }
};

class LanguageService {
    private defaultLanguage: Language = 'my';

    getLanguage(req: Request): Language {
        // Get language from header or query parameter
        const lang = (req.headers['accept-language'] || req.query.lang || this.defaultLanguage) as Language;
        return lang === 'en' ? 'en' : 'my';
    }

    translate(key: string, lang: Language = 'my'): string {
        const translation = translations[key];
        if (!translation) {
            return key;
        }
        return translation[lang] || translation[this.defaultLanguage];
    }

    formatNumber(num: number, lang: Language = 'my'): string {
        if (lang === 'my') {
            // Convert to Myanmar numerals
            return num.toString().replace(/[0-9]/g, (d) => {
                const myanmarNumerals = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
                return myanmarNumerals[parseInt(d)];
            });
        }
        return num.toLocaleString();
    }

    formatCurrency(amount: number, lang: Language = 'my'): string {
        const formattedNumber = this.formatNumber(amount, lang);
        return lang === 'my' ? `${formattedNumber} ကျပ်` : `${formattedNumber} MMK`;
    }

    formatDate(date: Date, lang: Language = 'my'): string {
        if (lang === 'my') {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Intl.DateTimeFormat('my-MM', options).format(date);
        }
        return date.toLocaleString('en-US');
    }
}

export const languageService = new LanguageService(); 