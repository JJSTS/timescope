import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocketNotif(
  username: string | undefined,
  onNotificacion: (mensaje: string) => void
) {
  // Ref para que el callback siempre sea el más reciente sin reconectar
  const callbackRef = useRef(onNotificacion);
  callbackRef.current = onNotificacion;

  useEffect(() => {
    if (!username) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new (SockJS as any)('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notificacion', (msg: { body: string }) => {
          callbackRef.current(msg.body);
        });
      },
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [username]);
}
