import { useEffect, useRef, useState } from "react";

interface WebSocketOptions {
  onOpen?: (e: Event) => void;
  onMessage?: (e: MessageEvent) => void;
  onClose?: (e: CloseEvent) => void;
  onError?: (e: Event) => void;
  reconnectInterval?: number;
  protocols?: string | string[];
}

export const useWebSocket = (
  url: string,
  options: WebSocketOptions = {}
) => {
  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3000, //3초마다 한번씩 재연결요청!
    protocols
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);

  const connect = () => {
    const ws = new WebSocket(url, protocols);
    socketRef.current = ws;

    ws.onopen = (e) => {
      setConnected(true);
      onOpen?.(e);
    };

    ws.onmessage = (e) => {
      onMessage?.(e);
    };

    ws.onclose = (e) => {
      setConnected(false);
      onClose?.(e); //연결이끊기면면
      reconnectTimer.current = setTimeout(() => {
        connect(); // 재연결 시도 (알아서 3초마다 재연결시도 하게 되어있음)
      }, reconnectInterval);
    };

    ws.onerror = (e) => {
      onError?.(e);
    };
  };

  const sendMessage = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(data);
    } else {
      console.warn("WebSocket is not open. Can't send message.");
    }
  };

  useEffect(() => {
    connect();
    return () => {
      reconnectTimer.current && clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [url]);

  return {
    sendMessage,
    connected,
    socket: socketRef.current,
  };
};