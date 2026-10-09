import { rejectCrossOrigin } from "@/lib/request-origin";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { requestPasswordReset } from "@/lib/password-reset-request";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const throttle = rateLimit(request, "admin-forgot-password", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  return requestPasswordReset(request, "admin");
}
