import { supabase } from "../config/supabase";


export async function signInWithGitHub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to retrieve session:", error.message);
    throw new Error("Unable to fetch session data.");
  }

  return data;
}