import express from 'express';
import * as notificationController from '../Controllers/notificationController.js';

const router = express.Router();

router.get('/', notificationController.listerMesNotifications);
router.put('/:id/lire', notificationController.marquerLue);

export default router;
