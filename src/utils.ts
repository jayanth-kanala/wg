import {
  WG_ALLOWED_IPS,
  WG_DEFAULT_ADDRESS,
  WG_DEFAULT_ADDRESS_OFFSET,
  WG_DEFAULT_DNS,
  WG_HOST,
  WG_MTU,
  WG_PATH,
  WG_PERSISTENT_KEEPALIVE,
  WG_PORT,
  WG_POST_DOWN,
  WG_POST_UP,
  WG_PRE_DOWN,
  WG_PRE_UP,
}
  from './config'
import { WgConfig } from "./types"
import { readFile, writeFile } from 'node:fs/promises'
import path from 'path'
import util from 'node:util';
import { existsSync } from 'node:fs';
const exec = util.promisify(require('node:child_process').exec);

class Utils {

  async getConfig(): Promise<WgConfig> {
    let config = <WgConfig>{};
    try {
      config = JSON.parse(await readFile(path.join(WG_PATH, 'wg0.json'), 'utf8'))
    } catch (error: any) {
      console.error(error);
    }
    return config;
  }

  async initServer() {
    if (!WG_HOST) {
      throw new Error("Host is required!");
    }
    if (!existsSync(path.join(WG_PATH, 'wg0.conf'))) {
      const config = <WgConfig>await this.getServerConfig();
      await this.saveConfig(config);
    }
    await this.startWgInterface()
  }

  async getServerConfig() {
    const privateKey = await this.processExec('wg genkey');
    const publicKey = await this.processExec(`echo ${privateKey} | wg pubkey`)
    const address = WG_DEFAULT_ADDRESS.replace('x', '1');
    return <WgConfig>{
      server: {
        address,
        privateKey,
        publicKey
      },
      clients: []
    }
  }

  async saveConfig(config: WgConfig) {
    await writeFile(path.join(WG_PATH, 'wg0.json'), JSON.stringify(config, null, 2), {
      encoding: 'utf8',
      mode: 0o660
    });
    let out =
      `[Interface]
PrivateKey = ${config.server.privateKey}
Address = ${config.server.address}${WG_DEFAULT_ADDRESS_OFFSET}
ListenPort = 51820
PreUp = ${WG_PRE_UP}
PostUp = ${WG_POST_UP}
PreDown = ${WG_PRE_DOWN}
PostDown = ${WG_POST_DOWN}
`;

    for (const client of config.clients) {
      if (!client.enabled) continue;

      out += `
# Client: ${client.name} (${client.id})
[Peer]
PublicKey = ${client.publicKey}
PresharedKey = ${client.preSharedKey}
AllowedIPs = ${client.address}/32
PersistentKeepalive = ${client.persistentKeepalive}
`;
    }
    await writeFile(path.join(WG_PATH, 'wg0.conf'), out, {
      encoding: 'utf8',
      mode: 0o660
    });
    if (config.clients.length) {
      try {
        await this.processExec('wg syncconf wg0 <(wg-quick strip wg0)');
      } catch (error) {
        console.error(error)
      }
    }
  }

  async processExec(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, { shell: 'bash' }, (err: Error, stdout: any) => {
        if (err) return reject(err);
        return resolve(String(stdout).trim())
      })
    })
  }

  async startWgInterface() {
    try {
      await this.processExec('wg-quick up wg0')
    } catch (err: any) {
      if (err && err.message && err.message.includes('Cannot find device "wg0"')) {
        console.error(err)
        throw new Error('WireGuard exited with the error: Cannot find device "wg0"\nThis usually means that your host\'s kernel does not support WireGuard!');
      }
    }
  }

  async getClientConfiguration(clientId: string) {
    const wgConfig = await this.getConfig();
    const client = wgConfig.clients.find(x => x.id === clientId);
    if (!client) {
      throw new Error("Client not found");
    }
    // Address = ${client.address}${WG_DEFAULT_ADDRESS_OFFSET}, ${client.address6}${WG_DEFAULT_ADDRESS_OFFSET_V6}
    return `[Interface]
PrivateKey = ${client.privateKey}
Address = ${client.address}${WG_DEFAULT_ADDRESS_OFFSET}
${WG_DEFAULT_DNS ? `DNS = ${WG_DEFAULT_DNS}` : ''}
${WG_MTU ? `MTU = ${WG_MTU}` : ''}

[Peer]
PublicKey = ${wgConfig.server.publicKey}
PresharedKey = ${client.preSharedKey}
AllowedIPs = ${WG_ALLOWED_IPS}
PersistentKeepalive = ${WG_PERSISTENT_KEEPALIVE}
Endpoint = ${WG_HOST}:${WG_PORT}`;
  }

  getClientIp(wgConfig: WgConfig): string {
    // Calculate next IP
    let address;
    for (let i = 2; i < 255; i++) {
      const client = wgConfig.clients.find(client => {
        return client.address === WG_DEFAULT_ADDRESS.replace('x', String(i));
      });
      if (!client) {
        address = WG_DEFAULT_ADDRESS.replace('x', String(i));
        break;
      }
    }
    if (!address) {
      throw new Error('Maximum number of clients reached.');
    }
    return address;
  }

  async getTransferRates() {
    let wgConfig = <WgConfig>{};
    try {
      wgConfig = await this.getConfig();
      const dump = await this.processExec('wg show wg0 dump');
      dump
        .trim()
        .split('\n')
        .slice(1)
        .forEach(line => {
          const [
            publicKey,
            preSharedKey,
            endpoint,
            allowedIps,
            latestHandshakeAt,
            transferRx,
            transferTx,
            persistentKeepalive,
          ] = line.split('\t');

          const index = wgConfig.clients.findIndex(client => client.publicKey === publicKey);
          const client = wgConfig.clients.find(client => client.publicKey === publicKey);
          if (!client) return;
          client.latestHandshakeAt = latestHandshakeAt === '0'
            ? null
            : new Date(Number(`${latestHandshakeAt}000`));
          client.transferRx = Number(transferRx);
          client.transferTx = Number(transferTx);
          client.persistentKeepalive = Number(persistentKeepalive) || 0;
          wgConfig.clients[index] = client;
        });
      return wgConfig;
    } catch (error) {
      console.error(error);
    }
    return wgConfig;
  }
}
export default new Utils();