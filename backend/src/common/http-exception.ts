export class HttpException extends Error {
    constructor(
        public status: number,
        public message: string,
        public errors?: any
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpException.prototype);
    }
}

export class BadRequestException extends HttpException {
    constructor(message: string = 'Bad Request', errors?: any) {
        super(400, message, errors);
        Object.setPrototypeOf(this, BadRequestException.prototype);
    }
}

export class UnauthorizedException extends HttpException {
    constructor(message: string = 'Unauthorized') {
        super(401, message);
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }
} 