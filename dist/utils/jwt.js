"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JWTUtil {
    /**
     * Encode function - generates a JWT token
     * @param payload - User data to be included in the token
     * @returns JWT token as a string
     */
    static encodeToJWT(payload) {
        const options = { expiresIn: parseInt(JWTUtil.JWT_EXPIRES_IN, 10) };
        return jsonwebtoken_1.default.sign(payload, JWTUtil.JWT_SECRET, options);
    }
    /**
     * Decode function - verifies and decodes a JWT token
     * @param token - JWT token to decode
     * @returns Decoded payload if valid, otherwise null
     */
    static decodeJWT(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWTUtil.JWT_SECRET);
        }
        catch (error) {
            const err = error;
            console.error("JWT Verification Error:", err.message);
            return null;
        }
    }
}
JWTUtil.JWT_SECRET = process.env.JWT_SECRET;
JWTUtil.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "86400000"; // Default to 1 day
// Ensure secret is defined at runtime
(() => {
    if (!JWTUtil.JWT_SECRET) {
        console.error("JWT_SECRET environment variable not set");
        process.exit(1);
    }
})();
exports.default = JWTUtil;
