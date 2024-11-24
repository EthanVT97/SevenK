import { UserRole } from './roles';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: UserRole;
                name: string;
                // Add other user properties you need
            };
        }
    }
}

export { }; 