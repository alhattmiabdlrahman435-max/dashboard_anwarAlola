import { useEffect, useRef } from 'react';

/**
 * اشتراك خفيف في قناة عامة على خادم Reverb (بروتوكول Pusher) بدون مكتبات إضافية.
 * يُستدعى onEvent(payload) كلما وصل الحدث، فتتحدث الصفحة في نفس اللحظة.
 *
 * الإعدادات من متغيرات البيئة (للاستضافة) وإلا القيم المحلية:
 *   VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT, VITE_REVERB_SCHEME
 */
const KEY = import.meta.env.VITE_REVERB_APP_KEY || 'anwar-alola-key-2024';
const HOST = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const PORT = import.meta.env.VITE_REVERB_PORT || '8080';
const SCHEME = import.meta.env.VITE_REVERB_SCHEME || (window.location.protocol === 'https:' ? 'wss' : 'ws');

export function useReverbChannel(channel, event, onEvent) {
  const handlerRef = useRef(onEvent);
  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let socket = null;
    let retryTimer = null;
    let pingTimer = null;
    let closedByUs = false;

    const connect = () => {
      try {
        socket = new WebSocket(`${SCHEME}://${HOST}:${PORT}/app/${KEY}?protocol=7&client=js&version=8.4.0&flash=false`);
      } catch {
        retryTimer = setTimeout(connect, 5000);
        return;
      }

      socket.onmessage = (msg) => {
        let data;
        try {
          data = JSON.parse(msg.data);
        } catch {
          return;
        }
        if (data.event === 'pusher:connection_established') {
          socket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel } }));
          clearInterval(pingTimer);
          // إبقاء الاتصال حياً
          pingTimer = setInterval(() => {
            if (socket?.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ event: 'pusher:ping', data: {} }));
            }
          }, 30000);
        } else if (data.event === event && data.channel === channel) {
          let payload = data.data;
          try {
            payload = typeof payload === 'string' ? JSON.parse(payload) : payload;
          } catch {
            /* payload as-is */
          }
          handlerRef.current?.(payload);
        }
      };

      socket.onclose = () => {
        clearInterval(pingTimer);
        if (!closedByUs) retryTimer = setTimeout(connect, 5000);
      };
      socket.onerror = () => socket?.close();
    };

    connect();
    return () => {
      closedByUs = true;
      clearTimeout(retryTimer);
      clearInterval(pingTimer);
      socket?.close();
    };
  }, [channel, event]);
}
