import jwt, { Secret, SignOptions, VerifyErrors } from "jsonwebtoken";

// Define the payload structure
export interface JwtPayload {
    id: string;
    name: string;
    email: string;
}

class JWTUtil {
    private static JWT_SECRET: Secret = process.env.JWT_SECRET as string;
    private static JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "86400000"; // Default to 1 day

    // Ensure secret is defined at runtime
    static {
        if (!JWTUtil.JWT_SECRET) {
            console.error("JWT_SECRET environment variable not set");
            process.exit(1);
        }
    }

    /**
     * Encode function - generates a JWT token
     * @param payload - User data to be included in the token
     * @returns JWT token as a string
     */
    static encodeToJWT(payload: JwtPayload): string {
        const options: SignOptions = { expiresIn: parseInt(JWTUtil.JWT_EXPIRES_IN, 10) };
        return jwt.sign(payload, JWTUtil.JWT_SECRET, options);
    }

    /**
     * Decode function - verifies and decodes a JWT token
     * @param token - JWT token to decode
     * @returns Decoded payload if valid, otherwise null
     */
    static decodeJWT(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, JWTUtil.JWT_SECRET) as JwtPayload;
        } catch (error) {
            const err = error as VerifyErrors;
            console.error("JWT Verification Error:", err.message);
            return null;
        }
    }
}

export default JWTUtil;
