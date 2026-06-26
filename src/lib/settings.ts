import { supabase } from './supabase';
import { StoreSetting } from '@/types';

export async function getStoreSettings(): Promise<StoreSetting | null> {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching store settings:', error);
    return null;
  }
  
  return data;
}

export async function updateQrisImage(file: File | null): Promise<string | null> {
  // Get current setting to find existing image
  let currentSetting = await getStoreSettings();
  
  // Upload new image if provided
  let newImageUrl = null;
  if (file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `qris-${Date.now()}.${fileExt}`;
    const filePath = `qris/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
      
    newImageUrl = publicUrl;
  }
  
  // If no setting exists, create one, otherwise update
  if (!currentSetting) {
    const { error } = await supabase
      .from('store_settings')
      .insert([{ qris_image_url: newImageUrl }]);
      
    if (error) throw new Error(error.message);
  } else {
    // If we're updating and there's a new image (or removing image), we should delete old image
    if (currentSetting.qris_image_url && file !== undefined) {
      try {
        const oldPath = currentSetting.qris_image_url.split('/product-images/')[1];
        if (oldPath) {
          await supabase.storage.from('product-images').remove([oldPath]);
        }
      } catch (e) {
        console.error('Failed to delete old QRIS image', e);
      }
    }
    
    // update
    if (file !== undefined) {
      const { error } = await supabase
        .from('store_settings')
        .update({ qris_image_url: newImageUrl, updated_at: new Date().toISOString() })
        .eq('id', currentSetting.id);
        
      if (error) throw new Error(error.message);
    }
  }
  
  return newImageUrl;
}
