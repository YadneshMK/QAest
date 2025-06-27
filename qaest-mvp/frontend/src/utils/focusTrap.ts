// Focus trap utility for modal dialogs
export const createFocusTrap = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const closeButton = element.querySelector('[aria-label*="Close"], [aria-label*="close"], button[type="button"]') as HTMLElement;
      closeButton?.click();
    }
  };

  element.addEventListener('keydown', handleTabKey);
  element.addEventListener('keydown', handleEscapeKey);
  
  // Focus first element when trap is created
  setTimeout(() => firstFocusable?.focus(), 100);

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
    element.removeEventListener('keydown', handleEscapeKey);
  };
};