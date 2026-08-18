/**
 * lib/utils/llmInputHandler.ts
 * Centralized codebase truncation logic — consistent limits across all API routes and workers.
 */

type LLMProvider = 'local' | 'gemini' | 'claude' | 'deepseek-cloud' | string;

/**
 * Truncates the codebase to fit within the LLM provider's context window.
 * For local CPU: smart truncation (first + last) to preserve auth code and exports.
 * For cloud providers: simple trailing truncation.
 */
export function truncateCodebase(codebase: string, provider: LLMProvider): string {
  switch (provider) {
    case 'local': {
      const LOCAL_LIMIT = 6_000;
      if (codebase.length > LOCAL_LIMIT) {
        const half = LOCAL_LIMIT / 2;
        return (
          codebase.slice(0, half) +
          '\n\n// ... [middle code truncated for local CPU speed] ...\n\n' +
          codebase.slice(-half)
        );
      }
      return codebase;
    }

    case 'claude':
    case 'deepseek-cloud': {
      const CLOUD_LIMIT = 1_500_000;
      if (codebase.length > CLOUD_LIMIT) {
        return (
          codebase.slice(0, CLOUD_LIMIT) +
          '\n\n// [NOTE: Codebase safely capped to fit within Cloud LLM input token budget]'
        );
      }
      return codebase;
    }

    case 'gemini':
    default: {
      const GEMINI_LIMIT = 2_200_000;
      if (codebase.length > GEMINI_LIMIT) {
        return (
          codebase.slice(0, GEMINI_LIMIT) +
          '\n\n// [NOTE: Codebase safely capped to fit within Gemini model input token budget]'
        );
      }
      return codebase;
    }
  }
}
