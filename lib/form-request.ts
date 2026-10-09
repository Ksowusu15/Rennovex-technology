/** Fetch JSON with a bounded wait and feedback suitable for form users. */
export async function formRequest(
  url: string,
  options: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    // Read the body before clearing the timeout; stalled bodies also time out.
    const body = await response.text();
    let data: unknown;

    try {
      data = JSON.parse(body);
    } catch {
      throw new Error("We could not process the response. Please try again.");
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error("This is taking longer than expected. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error("Check your connection and try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
