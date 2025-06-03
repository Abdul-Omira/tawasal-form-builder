/**
 * Simple, reliable metadata capture
 */

export function captureBasicMetadata() {
  const metadata = {
    pageUrl: window.location.href,
    referrerUrl: document.referrer || '',
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    javascriptEnabled: true,
    cookiesEnabled: navigator.cookieEnabled,
    touchSupport: 'ontouchstart' in window,
    pageLoadTime: Math.round(performance.now()),
    timestamp: new Date().toISOString()
  };
  
  console.log("Basic metadata captured:", metadata);
  return metadata;
}