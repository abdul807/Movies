import { supabase, getCurrentUser } from './supabase';

export interface Entry {
  id: number;
  title: string;
  type: 'MOVIE' | 'SERIES';
  status: 'COMPLETED' | 'WATCHING' | 'PLAN_TO_WATCH' | 'DROPPED';
  rating: number | null;
  genre: string | null;
  notes: string | null;
  poster_url: string | null;
  user_id: string;
  created_at: string;
}

// Get all entries for current user
export async function getEntries() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching entries:', error);
    throw error;
  }
}

// Add entry with image
export async function addEntry(entry: any, imageFile?: File) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    let posterUrl = null;

    if (imageFile) {
      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('entry-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('entry-images')
        .getPublicUrl(fileName);

      posterUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        title: entry.title,
        type: entry.type,
        status: entry.status,
        rating: entry.rating || null,
        genre: entry.genre || null,
        notes: entry.notes || null,
        poster_url: posterUrl,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding entry:', error);
    throw error;
  }
}

// Update entry
export async function updateEntry(id: number, entry: any, imageFile?: File) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    let posterUrl = entry.poster_url;

    if (imageFile) {
      if (entry.poster_url) {
        const oldFileName = entry.poster_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('entry-images').remove([oldFileName]);
        }
      }

      const fileName = `${user.id}/${Date.now()}-${imageFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('entry-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('entry-images')
        .getPublicUrl(fileName);

      posterUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('entries')
      .update({
        title: entry.title,
        type: entry.type,
        status: entry.status,
        rating: entry.rating || null,
        genre: entry.genre || null,
        notes: entry.notes || null,
        poster_url: posterUrl,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating entry:', error);
    throw error;
  }
}

// Delete entry
export async function deleteEntry(id: number) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data: entry, error: fetchError } = await supabase
      .from('entries')
      .select('poster_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    if (entry?.poster_url) {
      const fileName = entry.poster_url.split('/').pop();
      if (fileName) {
        await supabase.storage.from('entry-images').remove([fileName]);
      }
    }

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting entry:', error);
    throw error;
  }
}

// Get stats for current user
export async function getStats() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data: entries, error } = await supabase
      .from('entries')
      .select('type, rating, genre')
      .eq('user_id', user.id);

    if (error) throw error;

    const totalMovies = entries?.filter(e => e.type === 'MOVIE').length || 0;
    const totalSeries = entries?.filter(e => e.type === 'SERIES').length || 0;

    const genreCounts: Record<string, number> = {};
    entries?.forEach(e => {
      if (e.genre) {
        genreCounts[e.genre] = (genreCounts[e.genre] || 0) + 1;
      }
    });
    
    let favoriteGenre = null;
    let maxCount = 0;
    for (const [genre, count] of Object.entries(genreCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = genre;
      }
    }

    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const rated = entries?.filter(e => e.rating !== null) || [];
    const averageRating = rated.length > 0
      ? rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length
      : null;

    return {
      totalMovies,
      totalSeries,
      favoriteGenre,
      averageRating: averageRating ? Number(averageRating.toFixed(1)) : null,
      genreCounts,
      topGenres,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}
// Get unique genres for current user
export async function getUniqueGenres() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('entries')
      .select('genre')
      .eq('user_id', user.id)
      .not('genre', 'is', null);

    if (error) throw error;

    const uniqueGenres = [...new Set(data?.map(item => item.genre).filter(Boolean))];
    return uniqueGenres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}