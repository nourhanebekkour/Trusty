import minioClient from '#Config/minio.js';
import prisma from '#Config/prismaClient.js';
import process from '#Config/env.js';

const env = process.env.NODE_ENV || 'development';
const prefix = env === 'production' ? 'prod' : env === 'test' ? 'test' : 'dev';

// Buckets configuration
export const BUCKETS = {
  PUBLIC: process.env.MINIO_PUBLIC_BUCKET || `${prefix}-public`,
  PRIVATE: process.env.MINIO_PRIVATE_BUCKET || `${prefix}-private`
};

// S'assurer que les buckets existent
const ensureBucketsExist = async () => {
  try {
    for (const bucket of Object.values(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`Bucket "${bucket}" créé avec succès.`);
        
        if (bucket === BUCKETS.PUBLIC) {
          const policy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
            ],
          };
          await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
          console.log(`Politique publique appliquée au bucket "${bucket}".`);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la vérification/création des buckets MinIO:', error);
  }
};

ensureBucketsExist();

const getBucketByCategory = (category) => {
  const publicCategories = ['ICONE', 'AVATAR', 'BADGE', 'LOGO', 'PUBLIC'];
  return publicCategories.includes(category.toUpperCase()) ? BUCKETS.PUBLIC : BUCKETS.PRIVATE;
};

/**
 * Upload d'un fichier vers MinIO et enregistrement dans la base de données
 */
export const uploadAndSaveFile = async (file, userId, category, relationData = {}) => {
  ensureBucketsExist();
  const bucket = getBucketByCategory(category);
  const timestamp = Date.now();
  const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
  const fileName = `${category.toLowerCase()}/${timestamp}-${sanitizedOriginalName}`;
  
  await minioClient.putObject(
    bucket,
    fileName,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  const data = {
    nom_original: file.originalname,
    nom_stockage: fileName,
    categorie: category.toUpperCase(),
    chemin_minio: `${bucket}/${fileName}`,
    type_mime: file.mimetype,
    taille_octets: file.size,
    id_uploader: userId,
    ...relationData // ex: { id_projet: '...' }
  };

  const fileRecord = await prisma.fichier.create({ data });

  return {
    ...fileRecord,
    url: await getFileUrl(fileRecord.id_fichier)
  };
};

/**
 * Récupère une URL présignée ou publique
 */
export const getFileUrl = async (fileIdentifier) => {
  if (!fileIdentifier) return null;

  // Si c'est déjà une URL (ex: avatar externe), on la retourne
  if (typeof fileIdentifier === 'string' && (fileIdentifier.startsWith('http://') || fileIdentifier.startsWith('https://'))) {
    return fileIdentifier;
  }

  const file = await prisma.fichier.findFirst({
    where: {
      OR: [
        { id_fichier: fileIdentifier },
        { nom_stockage: fileIdentifier }
      ]
    }
  });

  if (!file) return null;

  const parts = file.chemin_minio.split('/');
  const bucket = parts[0];
  const fileName = parts.slice(1).join('/');

  try {
    if (bucket === BUCKETS.PUBLIC) {
      return await minioClient.presignedGetObject(bucket, fileName, 7 * 24 * 60 * 60);
    } else {
      return await minioClient.presignedGetObject(bucket, fileName, 1 * 60 * 60);
    }
  } catch (error) {
    console.error(`Erreur lors de la génération de l'URL pour ${fileName}:`, error);
    return null;
  }
};

/**
 * Helper pour attacher des URLs aux fichiers d'une entité
 * @param {Object} entity - L'objet (ex: Projet, Stage)
 * @param {string|string[]} fields - Le ou les champs contenant un fichier ou une liste de fichiers
 */
export const enrichEntityWithFileUrls = async (entity, fields) => {
    if (!entity) return entity;
    const fieldList = Array.isArray(fields) ? fields : [fields];

    for (const field of fieldList) {
        if (entity[field]) {
            if (Array.isArray(entity[field])) {
                entity[field] = await Promise.all(entity[field].map(async (file) => ({
                    ...file,
                    url: await getFileUrl(file.nom_stockage)
                })));
            } else {
                entity[field].url = await getFileUrl(entity[field].nom_stockage);
            }
        }
    }
    return entity;
};

/**
 * Helper pour attacher des URLs à une liste d'entités
 */
export const enrichEntitiesWithFileUrls = async (entities, fields) => {
    if (!entities || !Array.isArray(entities)) return entities;
    return await Promise.all(entities.map(entity => enrichEntityWithFileUrls(entity, fields)));
};

export const getFileStream = async (fileIdentifier) => {
  const file = await prisma.fichier.findFirst({
    where: {
      OR: [
        { id_fichier: fileIdentifier },
        { nom_stockage: fileIdentifier }
      ]
    }
  });

  if (!file) throw new Error('Fichier non trouvé');

  const parts = file.chemin_minio.split('/');
  const bucket = parts[0];
  const fileName = parts.slice(1).join('/');

  return await minioClient.getObject(bucket, fileName);
};

export const deleteFile = async (identifier) => {
  const file = await prisma.fichier.findFirst({
    where: {
      OR: [
        { id_fichier: identifier },
        { nom_stockage: identifier }
      ]
    }
  });

  if (file) {
    const parts = file.chemin_minio.split('/');
    const bucket = parts[0];
    const fileName = parts.slice(1).join('/');

    await minioClient.removeObject(bucket, fileName);
    await prisma.fichier.delete({ where: { id_fichier: file.id_fichier } });
  }
};

export const getFileInfo = async (identifier) => {
    return await prisma.fichier.findFirst({
      where: {
        OR: [
          { id_fichier: identifier },
          { nom_stockage: identifier }
        ]
      }
    });
  };
