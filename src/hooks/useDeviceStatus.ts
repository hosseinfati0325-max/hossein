import { useState, useEffect, useCallback } from 'react';

export interface BatteryInfo {
  isSupported: boolean;
  level: number; // 0 to 100
  isCharging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export interface NetworkInfo {
  isOnline: boolean;
  effectiveType: '5g' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number | null; // Mbps
  rtt: number | null; // ms
  saveData: boolean;
  type: string;
  pingLatency: number | null; // real measured ms
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor' | 'none';
  signalBars: number; // 0 to 4
  typeLabelFa: string;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    type?: string;
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
  };
  mozConnection?: any;
  webkitConnection?: any;
  getBattery?: () => Promise<any>;
}

export function useDeviceStatus() {
  // Battery State
  const [battery, setBattery] = useState<BatteryInfo>({
    isSupported: false,
    level: 100,
    isCharging: false,
    chargingTime: 0,
    dischargingTime: Infinity,
  });

  // Network State
  const [network, setNetwork] = useState<NetworkInfo>(() => {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithConnection) : null;
    const isOnline = nav ? nav.onLine : true;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;

    let effType: NetworkInfo['effectiveType'] = '4g';
    let downlink: number | null = null;
    let rtt: number | null = null;
    let saveData = false;
    let type = 'unknown';

    if (conn) {
      effType = (conn.effectiveType as any) || '4g';
      downlink = typeof conn.downlink === 'number' ? conn.downlink : null;
      rtt = typeof conn.rtt === 'number' ? conn.rtt : null;
      saveData = Boolean(conn.saveData);
      type = conn.type || 'unknown';
    }

    // Determine 5G / High speed if downlink > 25 Mbps
    if (downlink && downlink >= 25 && effType === '4g') {
      effType = '5g';
    }

    return {
      isOnline,
      effectiveType: isOnline ? effType : 'unknown',
      downlink,
      rtt,
      saveData,
      type,
      pingLatency: null,
      signalStrength: isOnline ? (effType === '5g' || effType === '4g' ? 'excellent' : 'fair') : 'none',
      signalBars: isOnline ? (effType === '5g' ? 4 : effType === '4g' ? 4 : effType === '3g' ? 3 : 2) : 0,
      typeLabelFa: !isOnline
        ? 'آفلاین'
        : effType === '5g'
        ? '5G'
        : effType === '4g'
        ? '4G LTE'
        : effType === '3g'
        ? '3G'
        : effType === '2g'
        ? '2G'
        : 'Wi-Fi',
    };
  });

  const [isMeasuringPing, setIsMeasuringPing] = useState(false);

  // Ping Measurement to check true real-time network latency
  const measurePing = useCallback(async (): Promise<number | null> => {
    if (typeof window === 'undefined' || !navigator.onLine) return null;
    setIsMeasuringPing(true);
    const start = performance.now();
    try {
      // Use lightweight cache-busted ping request
      const response = await fetch(`/api/health?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const end = performance.now();
      const latency = Math.round(end - start);

      if (response.ok) {
        setNetwork((prev) => ({
          ...prev,
          pingLatency: latency,
          isOnline: true,
        }));
        setIsMeasuringPing(false);
        return latency;
      }
    } catch {
      // Fallback: ping current origin
      try {
        const altStart = performance.now();
        await fetch(`/?_ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
        const altEnd = performance.now();
        const altLatency = Math.round(altEnd - altStart);
        setNetwork((prev) => ({
          ...prev,
          pingLatency: altLatency,
          isOnline: true,
        }));
        setIsMeasuringPing(false);
        return altLatency;
      } catch {
        // failed
      }
    }
    setIsMeasuringPing(false);
    return null;
  }, []);

  // Battery Manager listener
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const nav = navigator as NavigatorWithConnection;

    let batteryManager: any = null;

    const updateBatteryState = (bm: any) => {
      setBattery({
        isSupported: true,
        level: Math.round(bm.level * 100),
        isCharging: bm.charging,
        chargingTime: bm.chargingTime,
        dischargingTime: bm.dischargingTime,
      });
    };

    if (typeof nav.getBattery === 'function') {
      nav
        .getBattery()
        .then((bm) => {
          batteryManager = bm;
          updateBatteryState(bm);

          const onLevelChange = () => updateBatteryState(bm);
          const onChargingChange = () => updateBatteryState(bm);

          bm.addEventListener('levelchange', onLevelChange);
          bm.addEventListener('chargingchange', onChargingChange);

          return () => {
            bm.removeEventListener('levelchange', onLevelChange);
            bm.removeEventListener('chargingchange', onChargingChange);
          };
        })
        .catch(() => {
          // If browser policy rejects battery access in sandboxed environment, fallback gracefully
          setBattery({
            isSupported: false,
            level: 100,
            isCharging: true,
            chargingTime: 0,
            dischargingTime: Infinity,
          });
        });
    }
  }, []);

  // Network listener
  useEffect(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    const updateNetworkState = () => {
      const isOnline = nav.onLine;
      let effType: NetworkInfo['effectiveType'] = '4g';
      let downlink: number | null = null;
      let rtt: number | null = null;
      let saveData = false;
      let type = 'unknown';

      if (conn) {
        effType = (conn.effectiveType as any) || '4g';
        downlink = typeof conn.downlink === 'number' ? conn.downlink : null;
        rtt = typeof conn.rtt === 'number' ? conn.rtt : null;
        saveData = Boolean(conn.saveData);
        type = conn.type || 'unknown';
      }

      if (downlink && downlink >= 25 && effType === '4g') {
        effType = '5g';
      }

      let bars = 4;
      let strength: NetworkInfo['signalStrength'] = 'excellent';

      if (!isOnline) {
        bars = 0;
        strength = 'none';
      } else if (effType === 'slow-2g' || (rtt && rtt > 1000)) {
        bars = 1;
        strength = 'poor';
      } else if (effType === '2g' || (rtt && rtt > 500)) {
        bars = 2;
        strength = 'fair';
      } else if (effType === '3g' || (rtt && rtt > 250)) {
        bars = 3;
        strength = 'good';
      } else {
        bars = 4;
        strength = 'excellent';
      }

      const typeLabelFa = !isOnline
        ? 'آفلاین'
        : effType === '5g'
        ? '5G'
        : effType === '4g'
        ? '4G LTE'
        : effType === '3g'
        ? '3G'
        : effType === '2g'
        ? '2G'
        : 'Wi-Fi';

      setNetwork((prev) => ({
        ...prev,
        isOnline,
        effectiveType: isOnline ? effType : 'unknown',
        downlink,
        rtt,
        saveData,
        type,
        signalStrength: strength,
        signalBars: bars,
        typeLabelFa,
      }));
    };

    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);

    if (conn && conn.addEventListener) {
      conn.addEventListener('change', updateNetworkState);
    }

    // Initial ping measurement
    measurePing();

    return () => {
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);
      if (conn && conn.removeEventListener) {
        conn.removeEventListener('change', updateNetworkState);
      }
    };
  }, [measurePing]);

  return {
    battery,
    network,
    measurePing,
    isMeasuringPing,
  };
}
