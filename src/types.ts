export type WgConfig = {
  server: {
    address: string,
    address6: string,
    privateKey: string,
    publicKey: string
  },
  clients: {
    address: string,
    address6: string,
    allowedIPs?: string,
    createdAt: Date,
    enabled: boolean,
    id: string,
    latestHandshakeAt?: null | Date,
    name: string,
    persistentKeepalive?: number,
    preSharedKey: string,
    publicKey: string,
    privateKey: string,
    transferRx?: number,
    transferTx?: number,
    updatedAt?: Date,
  }[]
}