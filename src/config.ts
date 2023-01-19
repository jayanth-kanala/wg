import { createHash, randomUUID } from "node:crypto";
// https://www.digitalocean.com/community/tutorials/how-to-set-up-wireguard-on-ubuntu-22-04#step-2-choosing-ipv4-and-ipv6-addresses
// https://www.rfc-editor.org/rfc/rfc4193#section-3
function getIpV6() {
  const uniqueId = Date.now() + randomUUID();
  const hexString = createHash('sha1').update(uniqueId).digest('hex').substring(31);
  return `fd${hexString.substring(0, 2)}:${hexString.substring(2, 6)}:${hexString.substring(6, 10)}::x`
}
export const PORT = process.env.PORT || 51821;
export const PASSWORD = process.env.PASSWORD;
export const WG_PATH = process.env.WG_PATH || '/etc/wireguard/';
export const WG_HOST = process.env.WG_HOST;
export const WG_PORT = process.env.WG_PORT || 51820;
export const WG_MTU = process.env.WG_MTU || null;
export const WG_PERSISTENT_KEEPALIVE = process.env.WG_PERSISTENT_KEEPALIVE || 0;
export const WG_DEFAULT_ADDRESS = process.env.WG_DEFAULT_ADDRESS || '10.0.0.x';
export const WG_DEFAULT_ADDRESS_V6 = process.env.WG_DEFAULT_ADDRESS_V6 || getIpV6();
export const WG_DEFAULT_ADDRESS_OFFSET = process.env.WG_DEFAULT_ADDRESS_OFFSET || '/24'
export const WG_DEFAULT_ADDRESS_OFFSET_V6 = process.env.WG_DEFAULT_ADDRESS_OFFSET_V6 || '/64'
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

const iptablesV6Up = `
ip6tables -t nat -A POSTROUTING -s ${WG_DEFAULT_ADDRESS_V6.replace('x', '0')}${WG_DEFAULT_ADDRESS_OFFSET_V6} -o eth0 -j MASQUERADE;
ip6tables -A INPUT -p udp -m udp --dport 51820 -j ACCEPT;
ip6tables -A FORWARD -i wg0 -j ACCEPT;
ip6tables -A FORWARD -o wg0 -j ACCEPT;
`.split('\n').join(' ');

const iptablesV6Down = `
ip6tables -t nat -D POSTROUTING -s ${WG_DEFAULT_ADDRESS_V6.replace('x', '0')}${WG_DEFAULT_ADDRESS_OFFSET_V6} -o eth0 -j MASQUERADE;
ip6tables -D INPUT -p udp -m udp --dport 51820 -j ACCEPT;
ip6tables -D FORWARD -i wg0 -j ACCEPT;
ip6tables -D FORWARD -o wg0 -j ACCEPT;
`.split('\n').join(' ');

export const WG_PRE_UP = process.env.WG_PRE_UP || '';
export const WG_POST_UP = process.env.WG_POST_UP || iptablesV4Up + iptablesV6Up

export const WG_PRE_DOWN = process.env.WG_PRE_DOWN || '';
export const WG_POST_DOWN = process.env.WG_POST_DOWN || iptablesV4Down + iptablesV6Down