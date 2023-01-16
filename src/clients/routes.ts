import express from 'express';
const router = express.Router();
import Clients from './controller';

router.get('/', Clients.getClients);
router.post('/', Clients.addClient);
router.delete('/:id', Clients.deleteClient);
router.get('/:id/qrcode', Clients.getQrCode);
router.get('/:id/download', Clients.downloadConfigFile);
router.put('/:id/enable', Clients.enableClient);
router.put('/:id/disable', Clients.disableClient);

export default router;