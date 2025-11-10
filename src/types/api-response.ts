/**
 * src/types/api-response.ts
 * ----------------------------------------
 * Standardized API response type.
 *
 * Ensures consistent response structure across all endpoints,
 * whether successful or failed.
 *
 * Integrates:
 *  - controllers
 *  - middlewares
 *  - client-side API consumers
 *
 * @module types/api-response
 * ----------------------------------------
 */

export type ApiResponse<T = unknown> = {
  /** Indicates whether the request succeeded. */
  ok: boolean;

  /** Response payload (present only when `ok` is true). */
  data?: T;

  /** Error message for failed requests. */
  error?: string;

  /** Optional domain-level error code (e.g., EMAIL_TAKEN, INVALID_CREDENTIALS). */
  code?: string;
};
