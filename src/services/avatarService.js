import { supabase } from '../supabaseClient';

/**
 * Save or update user avatar data
 */
export async function saveAvatarData(imageUrl, glbUrl, voiceId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Check if avatar already exists
    const { data: existing } = await supabase
      .from('user_avatars')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Update existing avatar
      const { data, error } = await supabase
        .from('user_avatars')
        .update({
          image_url: imageUrl,
          glb_url: glbUrl,
          voice_id: voiceId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Avatar updated in database');
      return data;
    } else {
      // Insert new avatar
      const { data, error } = await supabase
        .from('user_avatars')
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          glb_url: glbUrl,
          voice_id: voiceId,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Avatar saved to database');
      return data;
    }
  } catch (error) {
    console.error('Error saving avatar:', error);
    throw error;
  }
}

/**
 * Get user avatar data
 */
export async function getAvatarData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No avatar found - this is okay
        return null;
      }
      throw error;
    }

    console.log('✅ Avatar loaded from database');
    return {
      imageUrl: data.image_url,
      glbUrl: data.glb_url,
      voiceId: data.voice_id,
    };
  } catch (error) {
    console.error('Error loading avatar:', error);
    return null;
  }
}

/**
 * Delete user avatar data
 */
export async function deleteAvatarData() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { error } = await supabase
      .from('user_avatars')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    
    console.log('✅ Avatar deleted from database');
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}
