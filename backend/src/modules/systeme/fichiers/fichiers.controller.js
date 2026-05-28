import * as minioService from '#Services/minio.service.js';
import sendResponse from '#Utils/response.handler.js';

/**
 * Upload d'un fichier générique
 */
export const uploadFile = async (req, res) => {
  // #swagger.tags = ['Fichiers']
  // #swagger.summary = 'Upload un fichier générique'
  // #swagger.consumes = ['multipart/form-data']
  /* #swagger.parameters['fichier'] = {
      in: 'formData',
      type: 'file',
      required: true,
      description: 'Le fichier à uploader'
  } */
  /* #swagger.parameters['category'] = {
      in: 'formData',
      type: 'string',
      description: 'Catégorie du fichier (ex: GENERIC, AVATAR, RAPPORT)',
      default: 'GENERIC'
  } */
  /* #swagger.parameters['id_projet'] = {
      in: 'formData',
      type: 'string',
      description: 'ID du projet associé (optionnel)'
  } */
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, "Aucun fichier fourni");
    }

    const userId = req.user.id;
    const category = req.body.category || 'GENERIC';
    const relationData = {};
    
    if (req.body.id_projet) relationData.id_projet = req.body.id_projet;

    const fileRecord = await minioService.uploadAndSaveFile(req.file, userId, category, relationData);

    sendResponse(res, 201, true, "Fichier uploadé avec succès", fileRecord);
  } catch (error) {
    sendResponse(res, 500, false, "Erreur lors de l'upload du fichier", null, error.message);
  }
};

/**
 * Récupère l'URL d'un fichier et redirige
 */
export const getFileUrl = async (req, res) => {
  // #swagger.tags = ['Fichiers']
  // #swagger.summary = 'Récupérer l URL d un fichier (redirection)'
  /* #swagger.parameters['fileName'] = {
      in: 'path',
      description: 'Nom du fichier ou ID'
  } */
  try {
    const { fileName } = req.params;
    const fileInfo = await minioService.getFileInfo(fileName);

    if (!fileInfo) {
      return sendResponse(res, 404, false, "Fichier non trouvé");
    }

    const url = await minioService.getFileUrl(fileInfo.nom_stockage);
    if (!url) return sendResponse(res, 404, false, "URL non générable");
    
    res.redirect(url);
  } catch (error) {
    sendResponse(res, 500, false, "Erreur lors de la récupération de l'URL", null, error.message);
  }
};

/**
 * Affiche le fichier en le streamant
 */
export const viewFile = async (req, res) => {
  // #swagger.tags = ['Fichiers']
  // #swagger.summary = 'Visualiser un fichier (streaming)'
  /* #swagger.parameters['fileName'] = {
      in: 'path',
      description: 'Nom du fichier ou ID'
  } */
  try {
    const { fileName } = req.params;
    const fileInfo = await minioService.getFileInfo(fileName);

    if (!fileInfo) {
      return sendResponse(res, 404, false, "Fichier non trouvé");
    }

    const stream = await minioService.getFileStream(fileInfo.nom_stockage);
    res.setHeader('Content-Type', fileInfo.type_mime);
    stream.pipe(res);
  } catch (error) {
    sendResponse(res, 500, false, "Erreur lors de la visualisation du fichier", null, error.message);
  }
};

/**
 * Supprime un fichier
 */
export const deleteFile = async (req, res) => {
  // #swagger.tags = ['Fichiers']
  // #swagger.summary = 'Supprimer un fichier'
  /* #swagger.parameters['id'] = {
      in: 'path',
      description: 'ID du fichier à supprimer'
  } */
  try {
    const { id } = req.params;
    const fileInfo = await minioService.getFileInfo(id);

    if (!fileInfo) {
      return sendResponse(res, 404, false, "Fichier non trouvé");
    }

    if (req.user.role !== 'ADMINISTRATEUR' && fileInfo.id_uploader !== req.user.id) {
      return sendResponse(res, 403, false, "Accès refusé : vous n'êtes pas l'uploader de ce fichier");
    }

    await minioService.deleteFile(id);
    sendResponse(res, 200, true, "Fichier supprimé avec succès");
  } catch (error) {
    sendResponse(res, 500, false, "Erreur lors de la suppression du fichier", null, error.message);
  }
};
