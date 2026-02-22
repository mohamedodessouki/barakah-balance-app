/**
 * Shared helper for extracting text from OpenAI Responses API responses.
 *
 * The Responses API returns data in the following structure:
 *   { output: [{ type: "message", content: [{ type: "output_text", text: "..." }] }] }
 *
 * This function also handles the legacy `output_text` top-level field as a
 * fallback in case the API shape changes.
 */
export function extractResponseText(data: Record<string, unknown>): string {
  // Primary: top-level output_text (documented shorthand)
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  // Fallback: walk output[].content[].text
  if (Array.isArray(data.output)) {
    let result = "";
    for (const item of data.output as Array<Record<string, unknown>>) {
      if (item.type === "message" && Array.isArray(item.content)) {
        for (const part of item.content as Array<Record<string, unknown>>) {
          if (part.type === "output_text" && typeof part.text === "string") {
            result += part.text;
          }
        }
      }
    }
    if (result.length > 0) {
      return result;
    }
  }

  return "";
}
