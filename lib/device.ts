export function detectDevice(userAgent: string | null) {
  const ua = userAgent?.toLowerCase() ?? "";
  const client = ua.includes("googleimageproxy")
    ? "Gmail image proxy"
    : ua.includes("outlook")
      ? "Outlook"
      : ua.includes("applewebkit") && ua.includes("mail")
        ? "Apple Mail"
        : ua.includes("thunderbird")
          ? "Thunderbird"
          : ua
            ? "Unknown client"
            : "Unknown";

  const deviceType = ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")
    ? "Mobile"
    : ua.includes("ipad") || ua.includes("tablet")
      ? "Tablet"
      : ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux")
        ? "Desktop"
        : ua.includes("googleimageproxy")
          ? "Proxied"
          : "Unknown";

  return { client, deviceType };
}
