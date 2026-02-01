import type { AblyMessageCallback } from 'ably/react';
import { useChannel, useChannelStateListener } from 'ably/react';
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

export function useNHISChannel(callbackOnMessage?: AblyMessageCallback) {
  return useChannel('nhis-channel', callbackOnMessage);
}

export function useNHISChannelStateListener() {
  return useChannelStateListener('nhis-channel', (state) => {
    console.log('NHIS Channel state changed to:', state);
  });
}
