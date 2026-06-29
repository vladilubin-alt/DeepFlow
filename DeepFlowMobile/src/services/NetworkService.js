import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processQueue } from './SyncQueue';

export function useNetworkSync() {
  const [isConnected, setIsConnected] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const processedRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);

      if (connected && !processedRef.current) {
        processedRef.current = true;
        processQueue().then(() => {
          import('./SyncQueue').then(({ getQueueLength }) => {
            getQueueLength().then(setPendingSync);
          });
        });
      }

      if (!connected) {
        processedRef.current = false;
      }
    });

    // Initial queue check
    import('./SyncQueue').then(({ getQueueLength }) => {
      getQueueLength().then(setPendingSync);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, pendingSync };
}
