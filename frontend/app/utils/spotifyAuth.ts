// app/utils/spotifyAuth.ts - Updated with Spotify user ID support
import * as Spotify from "@wwdrew/expo-spotify-sdk";
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

const SPOTIFY_TOKEN_KEY = 'spotifyToken';
const SPOTIFY_REFRESH_TOKEN_KEY = 'spotifyRefreshToken';
const SPOTIFY_TOKEN_EXPIRY_KEY = 'spotifyTokenExpiry';

const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL;

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Get Spotify user ID from the API
 */
export const getSpotifyUserId = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get Spotify user ID:', response.status);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error getting Spotify user ID:', error);
    return null;
  }
};

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

    // Calculate expiry time (default 1 hour if not provided)
    const expiresIn = session.expiresIn || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Store tokens securely
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, session.accessToken);
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY, expiresAt.toString());

    if (session.refreshToken) {
      await SecureStore.setItemAsync(SPOTIFY_REFRESH_TOKEN_KEY, session.refreshToken);
      console.log('✅ Stored refresh token');
    } else {
      console.warn('⚠️ No refresh token received from Spotify');
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
 * Get stored refresh token
 */
export const getStoredRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(SPOTIFY_REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Check if token is expired or will expire soon
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
 * Refresh the Spotify access token using the refresh token
 */
export const refreshSpotifyToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getStoredRefreshToken();

    if (!refreshToken) {
      console.warn('⚠️ No refresh token available, need to re-authenticate');
      return null;
    }

    console.log('🔄 Refreshing Spotify token...');

    const response = await fetch(`${NGROK_URL}/api/spotify/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Token refresh failed:', error);
      throw new Error(error.error || 'Failed to refresh token');
    }

    const data = await response.json();

    // Calculate new expiry time
    const expiresIn = data.expires_in || 3600;
    const expiresAt = Date.now() + expiresIn * 1000;

    // Store new tokens
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(SPOTIFY_TOKEN_EXPIRY_KEY, expiresAt.toString());

    // Update refresh token if a new one was provided
    if (data.refresh_token && data.refresh_token !== refreshToken) {
      await SecureStore.setItemAsync(SPOTIFY_REFRESH_TOKEN_KEY, data.refresh_token);
      console.log('✅ Updated refresh token');
    }

    console.log('✅ Token refreshed successfully');
    return data.access_token;
  } catch (error: any) {
    console.error('Error refreshing token:', error);
    Alert.alert(
      'Session Expired',
      'Please reconnect your Spotify account',
      [{ text: 'OK' }]
    );
    return null;
  }
};

/**
 * Check if user has authenticated with Spotify
 */
export const hasSpotifyAuth = async (): Promise<boolean> => {
  const token = await getStoredSpotifyToken();
  if (!token) return false;

  const expired = await isTokenExpired();
  if (expired) {
    // Try to refresh the token
    const newToken = await refreshSpotifyToken();
    return newToken !== null;
  }

  return true;
};

/**
 * Get a valid Spotify token, refreshing if necessary
 * This is the main function you should use throughout your app
 */
export const getValidSpotifyToken = async (): Promise<string | null> => {
  const token = await getStoredSpotifyToken();

  if (!token) {
    console.log('❌ No stored token, need to authenticate');
    return null;
  }

  const expired = await isTokenExpired();

  if (!expired) {
    console.log('✅ Token is valid');
    return token;
  }

  // Token is expired, try to refresh
  console.log('⏰ Token expired, refreshing...');
  return await refreshSpotifyToken();
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

/**
 * Playback control functions with automatic token refresh
 */
const API_BASE = "https://api.spotify.com/v1";

const spotifyApi = async (path: string, init?: RequestInit, retryCount = 0): Promise<Response> => {
  const token = await getValidSpotifyToken();
  
  if (!token) {
    throw new Error('No valid Spotify token available');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  // If we get a 401 (unauthorized), try to refresh token once
  if (res.status === 401 && retryCount === 0) {
    console.log('🔄 Got 401, attempting token refresh...');
    const newToken = await refreshSpotifyToken();
    
    if (newToken) {
      // Retry the request with the new token
      return spotifyApi(path, init, retryCount + 1);
    }
  }

  return res;
};

export const playTrack = async (
  trackId: string,
  startMs: number = 0
): Promise<boolean> => {
  try {
    const trackUri = `spotify:track:${trackId}`;
    const res = await spotifyApi("/me/player/play", {
      method: "PUT",
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: startMs,
      }),
    });

    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Error playing track:", error);
    return false;
  }
};

export const pauseTrack = async (): Promise<boolean> => {
  try {
    const res = await spotifyApi("/me/player/pause", {
      method: "PUT",
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Error pausing track:", error);
    return false;
  }
};

export const seekToPosition = async (positionMs: number): Promise<boolean> => {
  try {
    const res = await spotifyApi(`/me/player/seek?position_ms=${positionMs}`, {
      method: "PUT",
    });
    return res.ok || res.status === 204;
  } catch (error) {
    console.error("Error seeking:", error);
    return false;
  }
};

export const getPlaybackState = async (): Promise<any | null> => {
  try {
    const res = await spotifyApi("/me/player");
    if (res.status === 204) return null; // No active playback
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error getting playback state:", error);
    return null;
  }
};