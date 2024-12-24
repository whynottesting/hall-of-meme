import { supabase } from "@/integrations/supabase/client";

export const initializeStorage = async () => {
  const { data: bucket, error } = await supabase
    .storage
    .createBucket('space-images', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif']
    });

  if (error && error.message !== 'Bucket already exists') {
    throw error;
  }

  return bucket;
};