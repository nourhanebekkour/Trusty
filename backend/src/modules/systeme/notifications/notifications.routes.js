import express from 'express';
import * as notificationsController from './notifications.controller.js';

const router = express.Router();

router.get('/', notificationsController.listerMesNotifications);
router.put('/:id/lire', notificationsController.marquerLue);

export default router;
