/**
 * Simple metadata capture test to debug issues
 */

export function testBasicMetadata() {
  console.log("Testing basic metadata capture...");
  
  const basicData = {
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    javascriptEnabled: true,
  };
  
  console.log("Basic metadata captured:", basicData);
  return basicData;
}

export async function testFullMetadata() {
  console.log("Testing full metadata capture...");
  
  try {
    // Basic metadata
    const metadata = {
      pageUrl: window.location.href,
      referrerUrl: document.referrer,
      javascriptEnabled: true,
      cookiesEnabled: document.cookie !== undefined,
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchSupport: 'ontouchstart' in window,
      doNotTrack: navigator.doNotTrack === '1',
      pageLoadTime: Math.round(performance.now()),
    };
    
    console.log("Full metadata captured:", metadata);
    return metadata;
  } catch (error) {
    console.error("Error capturing metadata:", error);
    return {
      pageUrl: window.location.href,
      javascriptEnabled: true,
      error: error.message
    };
  }
}