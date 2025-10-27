// app/utils/spotifyAuth.ts
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';

const SPOTIFY_TOKEN_KEY = 'spotifyToken';
const SPOTIFY_REFRESH_TOKEN_KEY = 'spotifyRefreshToken';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotifyTokenExpiry';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Authenticate with Spotify and store tokens
 */
export const authenticateSpotify = async (): Promise<string | null> => {
  try {
    const session = await Spotify.Authenticate.authenticateAsync({
      scopes: [
        "user-read-currently-playing",
        "user-read-playback-state",
        "user-modify-playback-state",
        "app-remote-control",
        "streaming",
      ],
    });

    if (!session?.accessToken) {
      throw new Error("No access token received");
    }

    // Store token and expiry time (default 1 hour if not provided)
    const expiresAt = Date.now() + (session.expiresIn || 3600) * 1000;
    
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, session.accessToken);
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY, expiresAt.toString());
    
    if (session.refreshToken) {
      await SecureStore.setItemAsync(SPOTIFY_REFRESH_TOKEN_KEY, session.refreshToken);
    }

    console.log('✅ Spotify authentication successful');
    return session.accessToken;
  } catch (error) {
    console.error('Spotify authentication error:', error);
    return null;
  }
};

/**
 * Get stored Spotify token
 */
export const getStoredSpotifyToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SPOTIFY_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiryStr = await SecureStore.getItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    
    const expiry = parseInt(expiryStr, 10);
    // Consider expired if less than 5 minutes remaining
    return Date.now() >= (expiry - 5 * 60 * 1000);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

/**
 * Check if user has authenticated with Spotify
 */
export const hasSpotifyAuth = async (): Promise<boolean> => {
  const token = await getStoredSpotifyToken();
  if (!token) return false;
  
  const expired = await isTokenExpired();
  return !expired;
};

/**
 * Get a valid Spotify token, refreshing if necessary
 */
export const getValidSpotifyToken = async (): Promise<string | null> => {
  const token = await getStoredSpotifyToken();
  
  if (!token) {
    console.log('No stored token, need to authenticate');
    return null;
  }
  
  const expired = await isTokenExpired();
  
  if (!expired) {
    return token;
  }
  
  // Token is expired, try to refresh
  console.log('Token expired, refreshing...');
  return await authenticateSpotify();
};

/**
 * Clear stored Spotify tokens
 */
export const clearSpotifyTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SPOTIFY_REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY);
    console.log('✅ Spotify tokens cleared');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};