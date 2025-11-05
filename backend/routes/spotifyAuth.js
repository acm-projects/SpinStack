// routes/spotifyAuth.js - Create this new file
const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../constants/supabase");

// Spotify credentials from .env
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Helper function to verify token (optional for these routes)
async function verifyToken(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: Missing token" });
        return null;
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return null;
    }

    return user;
}

/**
 * Exchange authorization code for tokens (initial authentication)
 * POST /api/spotify/auth/token
 * Body: { code: string }
 */
router.post("/token", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: "Authorization code required" });
    }

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: "spinstack://", // Must match your Spotify app settings
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Spotify token error:", error);
            return res.status(response.status).json({ 
                error: error.error_description || "Failed to get tokens" 
            });
        }

        const data = await response.json();
        
        // Return tokens to client
        res.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in, // Usually 3600 seconds (1 hour)
            token_type: data.token_type,
        });
    } catch (err) {
        console.error("Token exchange error:", err);
        res.status(500).json({ error: "Failed to exchange authorization code" });
    }
});

/**
 * Refresh an expired access token using refresh token
 * POST /api/spotify/auth/refresh
 * Body: { refresh_token: string }
 */
router.post("/refresh", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    console.log('🔄 Refreshing Spotify token...');

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refresh_token,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Spotify refresh error:", error);
            return res.status(response.status).json({ 
                error: error.error_description || "Failed to refresh token" 
            });
        }

        const data = await response.json();
        
        console.log('✅ Token refreshed successfully');
        
        // Return new access token (and possibly new refresh token)
        res.json({
            access_token: data.access_token,
            refresh_token: data.refresh_token || refresh_token, // Spotify may return new refresh token
            expires_in: data.expires_in,
            token_type: data.token_type,
        });
    } catch (err) {
        console.error("Token refresh error:", err);
        res.status(500).json({ error: "Failed to refresh access token" });
    }
});

/**
 * Validate if a token is still valid (optional but useful)
 * GET /api/spotify/auth/validate?access_token=...
 */
router.get("/validate", async (req, res) => {
    const { access_token } = req.query;

    if (!access_token) {
        return res.status(400).json({ error: "Access token required" });
    }

    try {
        // Try to get user's profile to validate token
        const response = await fetch("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (response.ok) {
            const userData = await response.json();
            res.json({ 
                valid: true, 
                message: "Token is valid",
                user: userData.display_name 
            });
        } else {
            res.json({ valid: false, message: "Token is expired or invalid" });
        }
    } catch (err) {
        console.error("Token validation error:", err);
        res.status(500).json({ error: "Failed to validate token" });
    }
});

module.exports = router;