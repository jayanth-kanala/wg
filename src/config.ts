import { createHash, randomUUID } from "node:crypto";
export const PORT = process.env.PORT || 51821;
export const PASSWORD = process.env.PASSWORD;
export const WG_PATH = process.env.WG_PATH || '/etc/wireguard/';
export const WG_HOST = process.env.WG_HOST;
export const WG_PORT = process.env.WG_PORT || 51820;
export const WG_MTU = process.env.WG_MTU || null;
export const WG_PERSISTENT_KEEPALIVE = process.env.WG_PERSISTENT_KEEPALIVE || 0;
export const WG_DEFAULT_ADDRESS = process.env.WG_DEFAULT_ADDRESS || '10.0.0.x';
export const WG_DEFAULT_ADDRESS_OFFSET = process.env.WG_DEFAULT_ADDRESS_OFFSET || '/24'
export const WG_DEFAULT_DNS = typeof process.env.WG_DEFAULT_DNS === 'string'
  ? process.env.WG_DEFAULT_DNS
  : '1.1.1.1';
export const WG_ALLOWED_IPS = process.env.WG_ALLOWED_IPS || '0.0.0.0/0, ::/0';
const iptablesV4Up = `
iptables -t nat -A POSTROUTING -s ${WG_DEFAULT_ADDRESS.replace('x', '0')}${WG_DEFAULT_ADDRESS_OFFSET} -o eth0 -j MASQUERADE;
iptables -A INPUT -p udp -m udp --dport 51820 -j ACCEPT;
iptables -A FORWARD -i wg0 -j ACCEPT;
iptables -A FORWARD -o wg0 -j ACCEPT;
`.split('\n').join(' ');

const iptablesV4Down = `
iptables -t nat -D POSTROUTING -s ${WG_DEFAULT_ADDRESS.replace('x', '0')}${WG_DEFAULT_ADDRESS_OFFSET} -o eth0 -j MASQUERADE;
iptables -D INPUT -p udp -m udp --dport 51820 -j ACCEPT;
iptables -D FORWARD -i wg0 -j ACCEPT;
iptables -D FORWARD -o wg0 -j ACCEPT;
`.split('\n').join(' ');

export const WG_PRE_UP = process.env.WG_PRE_UP || '';
export const WG_POST_UP = process.env.WG_POST_UP || iptablesV4Up

export const WG_PRE_DOWN = process.env.WG_PRE_DOWN || '';
export const WG_POST_DOWN = process.env.WG_POST_DOWN || iptablesV4Down