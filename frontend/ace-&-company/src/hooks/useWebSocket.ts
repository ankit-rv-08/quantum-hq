import { useCallback, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://127.0.0.1:8000/ws/telemetry';

export interface FirmTelemetryMessage {
  type: string;
  floor?: number;
  agent?: string;
  message?: string;
  data?: { status?: string; timestamp?: string };
  timestamp?: string;
}

export function useFirmTelemetry() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<FirmTelemetryMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);

  useEffect(() => {
    shouldReconnectRef.current = true;

    const connect = () => {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;
      socket.onopen = () => setIsConnected(true);
      socket.onmessage = (event) => {
        try {
          setMessages((previous) => [...previous, JSON.parse(event.data)].slice(-50));
        } catch {
          // Ignore malformed event-bus payloads.
        }
      };
      socket.onclose = () => {
        setIsConnected(false);
        if (shouldReconnectRef.current) {
          reconnectTimerRef.current = window.setTimeout(connect, 3000);
        }
      };
      socket.onerror = () => socket.close();
    };

    connect();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current !== null) window.clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  const sendVeto = useCallback((command: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'VETO_COMMAND', command }));
    }
  }, []);

  return { isConnected, messages, sendVeto };
}
