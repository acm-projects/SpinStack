const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../constants/supabase");

// Helper function to verify token
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

// Get Spotify token using client credentials
async function getSpotifyToken() {
    try {
        const clientId = process.env.SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error("Spotify credentials not configured in .env");
        }

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Spotify token error:", error);
            throw new Error("Failed to get Spotify token");
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("getSpotifyToken error:", error);
        throw error;
    }
}

/**
 * SEARCH ROUTES
 */

// SEARCH - Search for tracks, albums, artists, or playlists
router.get("/search", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { q, type = "track,album,artist,playlist", limit = 20 } = req.query;

    if (!q) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    try {
        const spotifyToken = await getSpotifyToken();

        const params = new URLSearchParams({
            q: q.toString(),
            type: type.toString(),
            limit: limit.toString(),
        });

        const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Spotify API error:", error);
            return res.status(response.status).json({ 
                error: error.error?.message || "Spotify API error" 
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET track details by ID
router.get("/track/:id", async (req, res) => {
    console.log("are we failing right")
    const user = await verifyToken(req, res);
    console.log("this is the user");
    console.log(user);
    if (!user) return;

    try {
        const spotifyToken = await getSpotifyToken();

        const response = await fetch(`https://api.spotify.com/v1/tracks/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || "Spotify API error" 
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Get track error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET album details by ID
router.get("/album/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const spotifyToken = await getSpotifyToken();

        const response = await fetch(`https://api.spotify.com/v1/albums/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || "Spotify API error" 
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Get album error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET artist details by ID
router.get("/artist/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const spotifyToken = await getSpotifyToken();

        const response = await fetch(`https://api.spotify.com/v1/artists/${req.params.id}`, {
            headers: {
                Authorization: `Bearer ${spotifyToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json({ 
                error: error.error?.message || "Spotify API error" 
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Get artist error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;