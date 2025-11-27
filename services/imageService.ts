import { supabase } from './supabaseClient';

const BUCKET_NAME = 'images';

/**
 * Upload une image vers Supabase Storage
 * @param file - Le fichier à uploader
 * @param folder - Le dossier (campaigns, characters)
 * @returns L'URL publique de l'image ou null en cas d'erreur
 */
export const uploadImage = async (
  file: File,
  folder: 'campaigns' | 'characters' = 'campaigns'
): Promise<string | null> => {
  try {
    // Générer un nom unique pour éviter les collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload le fichier
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erreur upload:', uploadError);
      return null;
    }

    // Récupérer l'URL publique
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Erreur upload image:', error);
    return null;
  }
};

/**
 * Supprime une image de Supabase Storage
 * @param imageUrl - L'URL publique de l'image
 * @returns true si supprimé avec succès
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraire le chemin du fichier depuis l'URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
    
    if (pathParts.length !== 2) {
      console.error('URL image invalide:', imageUrl);
      return false;
    }

    const filePath = decodeURIComponent(pathParts[1]);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erreur suppression:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression image:', error);
    return false;
  }
};

/**
 * Vérifie si une URL est une image Supabase (pour savoir si on doit la supprimer)
 */
export const isSupabaseImage = (imageUrl: string): boolean => {
  return imageUrl.includes('supabase.co/storage');
};
