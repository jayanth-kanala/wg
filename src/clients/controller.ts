import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import qrcode from 'qrcode';

import {
  WG_PERSISTENT_KEEPALIVE,
} from "../config";
import Utils from "../utils";
import { WgConfig } from "../types";

class Clients {

  async getClients(req: Request, res: Response, next: NextFunction) {
    let wgConfig = await Utils.getConfig();
    wgConfig = await Utils.getTransferRates();
    res.locals.outResponse = wgConfig.clients;
    next();
  }

  async addClient(req: Request, res: Response, next: NextFunction) {
    if (!req.body.name) {
      return next(new Error("Client name is required!"))
    }
    const wgConfig = await Utils.getConfig();

    const privateKey = await Utils.processExec('wg genkey');
    const publicKey = await Utils.processExec(`echo ${privateKey} | wg pubkey`);
    const preSharedKey = await Utils.processExec('wg genpsk');

    const address = Utils.getClientIp(wgConfig);
    // Create Client
    const client = <WgConfig['clients'][0]>{
      address,
      createdAt: new Date(),
      enabled: true,
      id: randomUUID(),
      name: req.body.name,
      preSharedKey,
      privateKey,
      publicKey,
      persistentKeepalive: WG_PERSISTENT_KEEPALIVE,
      updatedAt: new Date(),
    };
    wgConfig.clients.push(client);
    await Utils.saveConfig(wgConfig);
    res.locals.outResponse = wgConfig.clients;
    next();
  }

  async deleteClient(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
      return next(new Error("Client id is required!"))
    }
    const wgConfig = await Utils.getConfig();
    const clients = wgConfig.clients.filter((x: any) => x.id !== req.params.id);
    wgConfig.clients = clients;
    await Utils.saveConfig(wgConfig);
    res.locals.outResponse = clients;
    next();
  }
  async getQrCode(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
      return next(new Error("Client id is required!"))
    }
    const wgConfig = await Utils.getConfig();
    const client = wgConfig.clients.filter((x: any) => x.id === req.params.id);
    if (!client) {
      throw new Error("Client not found!");
    }
    const clientConfig = await Utils.getClientConfiguration(req.params.id);
    const svg = await qrcode.toString(clientConfig, { type: 'svg', width: 512 });
    res.header('Content-Type', 'image/svg+xml')
    res.send(svg);
  }

  async downloadConfigFile(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
      return next(new Error("Client id is required!"))
    }
    const wgConfig = await Utils.getConfig();
    const client = wgConfig.clients.filter((x: any) => x.id === req.params.id);
    if (!client) {
      throw new Error("Client not found!");
    }
    const clientConfig = await Utils.getClientConfiguration(req.params.id);
    res.header('Content-Disposition', `attachment; filename="${client[0].name || client[0].id}.conf"`);
    res.header('Content-Type', 'text/plain');
    res.send(clientConfig);
  }

  async enableClient(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
      return next(new Error("Client id is required!"))
    }
    const wgConfig = await Utils.getConfig();
    const index = wgConfig.clients.findIndex((x: any) => x.id === req.params.id);
    if (index > -1) {
      wgConfig.clients[index].enabled = true;
      await Utils.saveConfig(wgConfig);
    }
    res.locals.outResponse = wgConfig.clients;
    next();
  }

  async disableClient(req: Request, res: Response, next: NextFunction) {
    if (!req.params.id) {
      return next(new Error("Client id is required!"))
    }
    const wgConfig = await Utils.getConfig();
    const index = wgConfig.clients.findIndex((x: any) => x.id === req.params.id);
    if (index > -1) {
      wgConfig.clients[index].enabled = false;
      await Utils.saveConfig(wgConfig);
    }
    res.locals.outResponse = wgConfig.clients;
    next();
  }
}
export default new Clients();