/**
 * 🕵️ Advanced Metadata Collection Engine - Your Developer's Intelligence System
 * نظام جمع البيانات الوصفية المتقدم - من إبداع المطور الخاص بك
 * 
 * 🎯 Signature: Digital fingerprinting for enhanced security
 * ✨ Easter Egg: Every click tells a story in the digital realm
 * 
 * @author Your Personal AI Developer
 * @version 2.0 - "Digital Detective Edition"
 * @purpose Advanced user analytics and security monitoring
 */

interface MetadataInfo {
  browserInfo: {
    userAgent: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    language: string;
    cookiesEnabled: boolean;
    doNotTrack: boolean;
  };
  deviceInfo: {
    screenWidth: number;
    screenHeight: number;
    timezone: string;
    deviceType: string;
    touchSupport: boolean;
    colorDepth: number;
    pixelRatio: number;
  };
  pageInfo: {
    referrer: string;
    currentUrl: string;
    loadTime: number;
  };
}

// Parse User Agent to extract browser and OS information
function parseUserAgent(userAgent: string) {
  const browsers = [
    { name: 'Chrome', regex: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', regex: /Safari\/([0-9.]+)/ },
    { name: 'Edge', regex: /Edg\/([0-9.]+)/ },
    { name: 'Opera', regex: /OPR\/([0-9.]+)/ },
  ];

  const os = [
    { name: 'Windows', regex: /Windows NT ([0-9.]+)/ },
    { name: 'macOS', regex: /Mac OS X ([0-9_.]+)/ },
    { name: 'Linux', regex: /Linux/ },
    { name: 'Android', regex: /Android ([0-9.]+)/ },
    { name: 'iOS', regex: /OS ([0-9_]+)/ },
  ];

  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  // Detect browser
  for (const browser of browsers) {
    const match = userAgent.match(browser.regex);
    if (match) {
      browserName = browser.name;
      browserVersion = match[1];
      break;
    }
  }

  // Detect OS
  for (const system of os) {
    const match = userAgent.match(system.regex);
    if (match) {
      osName = system.name;
      osVersion = match[1] || 'Unknown';
      break;
    }
  }

  return { browserName, browserVersion, osName, osVersion };
}

// Detect device type based on screen size and user agent
function getDeviceType(): string {
  const width = window.screen.width;
  const userAgent = navigator.userAgent;

  if (/Mobi|Android/i.test(userAgent)) {
    return 'Mobile';
  } else if (width <= 768) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}

// Collect comprehensive metadata
export function collectMetadata(): MetadataInfo {
  const userAgent = navigator.userAgent;
  const { browserName, browserVersion, osName, osVersion } = parseUserAgent(userAgent);

  const browserInfo = {
    userAgent,
    browserName,
    browserVersion,
    osName,
    osVersion,
    language: navigator.language || 'Unknown',
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',
  };

  const deviceInfo = {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    deviceType: getDeviceType(),
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  };

  const pageInfo = {
    referrer: document.referrer || 'Direct',
    currentUrl: window.location.href,
    loadTime: performance.now(),
  };

  return {
    browserInfo,
    deviceInfo,
    pageInfo,
  };
}