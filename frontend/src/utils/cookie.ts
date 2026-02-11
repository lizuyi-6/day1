import Cookies from 'js-cookie';

const BROWSER_ID_KEY = 'browser_id';

export function getBrowserId(): string {
  let browserId = Cookies.get(BROWSER_ID_KEY);
  console.log('[Cookie] getBrowserId from cookie:', browserId);

  // Fallback to localStorage if cookie fails or is missing
  if (!browserId) {
    browserId = localStorage.getItem(BROWSER_ID_KEY) || undefined;
    console.log('[Cookie] getBrowserId from localStorage:', browserId);
  }

  if (!browserId) {
    browserId = generateBrowserId();
    console.log('[Cookie] Generated new browserId:', browserId);
    console.log('[Cookie] Setting new browserId via setBrowserId...');
    setBrowserId(browserId);
  }

  console.log('[Cookie] Final browserId to return:', browserId);
  return browserId;
}

export function setBrowserId(browserId: string): void {
  // Set cookie
  Cookies.set(BROWSER_ID_KEY, browserId, {
    expires: 365,
    path: '/',
    secure: window.location.protocol === 'https:',
    sameSite: 'lax',
  });
  
  // Also set localStorage as backup
  localStorage.setItem(BROWSER_ID_KEY, browserId);
}

export function clearBrowserId(): void {
  Cookies.remove(BROWSER_ID_KEY, { path: '/' });
  localStorage.removeItem(BROWSER_ID_KEY);
}

function generateBrowserId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
