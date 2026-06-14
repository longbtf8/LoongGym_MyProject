import PusherJS from "pusher-js";

const key = import.meta.env.VITE_PUSHER_APP_KEY;
const wsHost = import.meta.env.VITE_PUSHER_HOST || "127.0.0.1";
const wsPort = Number(import.meta.env.VITE_PUSHER_PORT) || 6002;
const forceTLS = import.meta.env.VITE_PUSHER_FORCE_TLS === "true" || false;

const client = new PusherJS(key, {
  cluster: "",
  wsHost: wsHost,
  wsPort: wsPort,
  forceTLS: forceTLS,
  encrypted: forceTLS,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
});
export default client;
