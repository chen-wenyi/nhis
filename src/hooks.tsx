import { useState } from 'react';

/**
 * useCopyToClipboard hook
 * Returns a copy function and a boolean indicating if the text was copied.
 */
export function useCopyToClipboard(
  timeout = 1500,
): [(text: string) => void, boolean] {
  const [isCopied, setIsCopied] = useState(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), timeout);
    });
  }

  return [copy, isCopied];
}
