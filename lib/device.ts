export type DeviceInfo = {
  deviceName: string;
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Unknown";
  browser: string;
  os: string;
  userAgent: string;
};

export function parseDevice(userAgent = ""): DeviceInfo {
  const ua = userAgent.toLowerCase();
  const deviceType = /ipad|tablet|kindle/.test(ua) ? "Tablet" : /mobile|iphone|android/.test(ua) ? "Mobile" : ua ? "Desktop" : "Unknown";
  const browser = /edg\//.test(ua) ? "Microsoft Edge" : /firefox\//.test(ua) ? "Firefox" : /chrome\//.test(ua) ? "Chrome" : /safari\//.test(ua) ? "Safari" : "Unknown browser";
  const os = /windows/.test(ua) ? "Windows" : /iphone|ipad|ios/.test(ua) ? "iOS" : /android/.test(ua) ? "Android" : /mac os|macintosh/.test(ua) ? "macOS" : /linux/.test(ua) ? "Linux" : "Unknown OS";
  return { deviceName: `${browser} on ${os}`, deviceType, browser, os, userAgent };
}
