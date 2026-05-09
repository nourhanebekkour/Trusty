import express from 'express';

import { 
  createOrUpdateProfile,
  getProfileByID,
  getProfiles
} from '../Controllers/administrateurController.js';
import { requireRole } from '../Middlewars/roles.middleware.js';

const router = express.Router();

router.use(requireRole('ADMINISTRATEUR'));

router.get("/",getProfiles)
router.get("/:id",getProfileByID)
router.put("/:id",createOrUpdateProfile)

export default router;