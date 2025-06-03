/**
 * Client-side metadata capture utilities
 * Collects browser, device, and environment information
 */

export interface ClientMetadata {
  // Browser Environment
  pageUrl?: string;
  referrerUrl?: string;
  pageLoadTime?: number;
  javascriptEnabled?: boolean;
  cookiesEnabled?: boolean;
  doNotTrack?: boolean;
  
  // Device & Browser
  screenResolution?: string;
  timezone?: string;
  touchSupport?: boolean;
  language?: string;
  
  // Advanced fingerprinting
  installedFonts?: string[];
  browserPlugins?: string[];
  webglFingerprint?: string;
  batteryStatus?: {
    charging?: boolean;
    level?: number;
  };
}

/**
 * Detect if cookies are enabled
 */
function detectCookiesEnabled(): boolean {
  try {
    document.cookie = "test=1; SameSite=Strict";
    const cookiesEnabled = document.cookie.indexOf("test=1") !== -1;
    // Clean up test cookie
    document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    return cookiesEnabled;
  } catch {
    return false;
  }
}

/**
 * Get screen resolution
 */
function getScreenResolution(): string {
  return `${screen.width}x${screen.height}`;
}

/**
 * Get user timezone
 */
function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return new Date().getTimezoneOffset().toString();
  }
}

/**
 * Detect touch support
 */
function detectTouchSupport(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get user language
 */
function getUserLanguage(): string {
  return navigator.language || navigator.languages?.[0] || 'en';
}

/**
 * Detect Do Not Track setting
 */
function getDoNotTrack(): boolean {
  return navigator.doNotTrack === '1' || 
         (window as any).doNotTrack === '1' || 
         (navigator as any).msDoNotTrack === '1';
}

/**
 * Get list of installed fonts (basic detection)
 */
function getInstalledFonts(): string[] {
  const baseFonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'];
  const testFonts = ['Calibri', 'Cambria', 'Segoe UI', 'Tahoma', 'Lucida Console', 'Lucida Sans Unicode', 'MS Sans Serif', 'MS Serif'];
  
  const detectedFonts: string[] = [];
  const testString = "mmmmmmmmmmlli";
  const testSize = "72px";
  
  // Create canvas for font detection
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return [];
  
  // Test base fonts
  const baseWidths: { [key: string]: number } = {};
  baseFonts.forEach(font => {
    context.font = testSize + ' ' + font;
    baseWidths[font] = context.measureText(testString).width;
  });
  
  // Test additional fonts
  testFonts.forEach(font => {
    context.font = testSize + ' ' + font + ', ' + baseFonts[0];
    const width = context.measureText(testString).width;
    if (width !== baseWidths[baseFonts[0]]) {
      detectedFonts.push(font);
    }
  });
  
  return detectedFonts.slice(0, 20); // Limit to 20 fonts
}

/**
 * Get browser plugins (limited in modern browsers)
 */
function getBrowserPlugins(): string[] {
  const plugins: string[] = [];
  
  try {
    for (let i = 0; i < navigator.plugins.length; i++) {
      const plugin = navigator.plugins[i];
      if (plugin && plugin.name) {
        plugins.push(plugin.name);
      }
    }
  } catch {
    // Modern browsers restrict plugin enumeration
  }
  
  return plugins.slice(0, 10); // Limit to 10 plugins
}

/**
 * Generate WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    
    if (!gl) return '';
    
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    return `${vendor}|${renderer}`.slice(0, 100);
  } catch {
    return '';
  }
}

/**
 * Get battery status (if available)
 */
async function getBatteryStatus(): Promise<ClientMetadata['batteryStatus']> {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        charging: battery.charging,
        level: battery.level
      };
    }
  } catch {
    // Battery API not available or blocked
  }
  return undefined;
}

/**
 * Calculate page load time
 */
function getPageLoadTime(): number {
  try {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData && perfData.loadEventEnd && perfData.fetchStart) {
      return Math.round(perfData.loadEventEnd - perfData.fetchStart);
    }
  } catch {
    // Performance API not available
  }
  return 0;
}

/**
 * Capture comprehensive client-side metadata
 */
export async function captureClientMetadata(): Promise<ClientMetadata> {
  const startTime = performance.now();
  
  const metadata: ClientMetadata = {
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    javascriptEnabled: true, // Obviously true if this code runs
    cookiesEnabled: detectCookiesEnabled(),
    doNotTrack: getDoNotTrack(),
    screenResolution: getScreenResolution(),
    timezone: getTimezone(),
    touchSupport: detectTouchSupport(),
    language: getUserLanguage(),
    pageLoadTime: getPageLoadTime(),
    installedFonts: getInstalledFonts(),
    browserPlugins: getBrowserPlugins(),
    webglFingerprint: getWebGLFingerprint(),
  };
  
  // Get battery status asynchronously
  try {
    metadata.batteryStatus = await getBatteryStatus();
  } catch {
    // Battery API not available
  }
  
  return metadata;
}

/**
 * Capture metadata and return as form data to be included in submissions
 */
export async function getMetadataForSubmission(): Promise<Partial<ClientMetadata>> {
  try {
    console.log("Starting metadata capture...");
    
    const metadata: Partial<ClientMetadata> = {
      pageUrl: window.location.href,
      referrerUrl: document.referrer,
      javascriptEnabled: true,
      cookiesEnabled: detectCookiesEnabled(),
      screenResolution: getScreenResolution(),
      timezone: getTimezone(),
      touchSupport: detectTouchSupport(),
      language: getUserLanguage(),
      doNotTrack: getDoNotTrack(),
      pageLoadTime: getPageLoadTime(),
    };
    
    console.log("Metadata captured successfully:", metadata);
    return metadata;
  } catch (error) {
    console.warn('Failed to capture client metadata:', error);
    return {
      javascriptEnabled: true,
      pageUrl: window.location.href,
      cookiesEnabled: detectCookiesEnabled(),
    };
  }
}