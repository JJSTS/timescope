import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocketNotif(
  username: string | undefined,
  onNotificacion: (mensaje: string) => void
) {
  const callbackRef = useRef(onNotificacion);
  callbackRef.current = onNotificacion;

  useEffect(() => {
    if (!username) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    let reconnectCount = 0;
    const MAX_RECONNECTS = 5;

    const client = new Client({
      webSocketFactory: () => new (SockJS as any)(process.env.REACT_APP_WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        reconnectCount = 0;
        client.subscribe('/user/queue/notificacion', (msg: { body: string }) => {
          callbackRef.current(msg.body);
        });
      },
      onDisconnect: () => {
        reconnectCount++;
        if (reconnectCount >= MAX_RECONNECTS) {
          client.deactivate();
        }
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [username]);
}
