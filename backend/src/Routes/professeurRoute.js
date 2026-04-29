import express from 'express';

import { 
    
    
  createOrUpdateProfile,
    deleteProfesseur,
    getProfileByID,
    getProfiles
  } from '../controllers/professeurController.js';
const router = express.Router();
router.get("/",getProfiles)
router.get("/:id",getProfileByID)
router.put("/",createOrUpdateProfile)
router.delete("/:id", deleteProfesseur)



export default router;