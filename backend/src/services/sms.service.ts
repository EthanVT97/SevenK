import twilio from 'twilio';

class SMSService {
    private client: twilio.Twilio;

    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendSMS(to: string, message: string): Promise<boolean> {
        try {
            const response = await this.client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to
            });

            console.log('SMS sent successfully:', response.sid);
            return true;
        } catch (error) {
            console.error('SMS sending failed:', error);
            return false;
        }
    }
}

export default new SMSService(); 