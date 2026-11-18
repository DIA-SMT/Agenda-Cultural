export declare const MIN_PASSWORD_LENGTH: number;
export declare function hashPassword(password: string): Promise<string>;
export declare function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean>;
export declare function verifyAgainstNothing(password: string): Promise<false>;
