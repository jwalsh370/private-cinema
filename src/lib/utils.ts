import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

// Core classname utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Type validation schemas
export const SignedUrlSchema = z.object({
  signedUrl: z.string().url(),
  expiresAt: z.number().int().positive()
})

export const ErrorResponseSchema = z.object({
  error: z.string().max(500)
})

export type SignedUrlResponse = 
  | z.infer<typeof SignedUrlSchema>
  | z.infer<typeof ErrorResponseSchema>;

// Security utilities
export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly clientMessage?: string
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }

  toResponse() {
    return {
      error: this.clientMessage || "An unexpected error occurred",
      status: this.statusCode
    }
  }
}

export const sanitizeStreamError = (error: string): string => {
  const redacted = error
    // AWS credentials
    .replace(/AWS_ACCESS_KEY_ID=([a-zA-Z0-9/+]+);?/g, '[REDACTED]')
    .replace(/AWS_SECRET_ACCESS_KEY=([a-zA-Z0-9/+]+);?/g, '[REDACTED]')
    // Session tokens
    .replace(/AWS_SESSION_TOKEN=([a-zA-Z0-9/+]+);?/g, '[REDACTED]')
    // S3 paths
    .replace(/(s3:\/\/)[^\s]+/g, '$1[REDACTED_BUCKET]')
    // Presigned URL parameters
    .replace(/X-Amz-[^=]+=[^&]+/g, '[REDACTED_PARAM]')

  // Truncate long errors while preserving important parts
  const maxLength = 200
  return redacted.length > maxLength 
    ? `${redacted.slice(0, maxLength)}... [TRUNCATED]` 
    : redacted
}

// Validation utilities
export const validateS3Key = (key: string) => {
  if (!key || typeof key !== 'string') return false
  // Prevent directory traversal patterns
  if (/(\/\.\.\/|\.\.$)/.test(key)) return false
  // Validate S3 key format
  return /^[a-zA-Z0-9!\-_.*'()/]+$/.test(key)
}

export const validateExpiration = (expiresInSeconds: number) => {
  const MAX_EXPIRATION = 3600 * 6 // 6 hours
  return expiresInSeconds > 0 && expiresInSeconds <= MAX_EXPIRATION
}
