import express from 'express';

import { 
    
    
  createOrUpdateProfile,
    
    getProfileByID,
    getProfiles
  } from '../controllers/administrateurController.js';

const router = express.Router();
router.get("/",getProfiles)
router.get("/:id",getProfileByID)
router.put("/",createOrUpdateProfile)




export default router;