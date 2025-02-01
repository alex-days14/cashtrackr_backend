type EmailType = {
    name: string;
    email: string;
    token: string;
};
export declare class AuthEmail {
    static sendConfirmationEmail: (user: EmailType) => Promise<void>;
    static sendForgotPasswordEmail: (user: EmailType) => Promise<void>;
}
export {};
