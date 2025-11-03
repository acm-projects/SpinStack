const express = require("express");
const { supabaseAdmin } = require("../constants/supabase");
const router = express.Router();

// Helper to verify the user from Bearer token
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

// POST /api/story_moments
router.post("/", async (req, res) => {
    // Verify user token
    const user = await verifyToken(req, res);
    if (!user) return;

    const { title, song_url, start_time, duration, cover_url, visibility, description } = req.body;

    console.log("Token user ID:", user.id);

    try {
        const { data, error } = await supabaseAdmin
            .from("story_moments")
            .insert([{
                user_id: user.id,
                title,
                song_url,
                start_time: start_time ?? null,
                duration: duration ?? null,
                cover_url: cover_url ?? null,
                visibility: visibility === true || visibility === "true",
                description
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// GET /api/story_moments
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("story_moments")
            .select(`
        id,
        user_id,
        title,
        song_url,
        start_time,
        duration,
        cover_url,
        visibility,
        description,
        created_at,
        users!story_moments_user_id_fkey(id, username, pfp_url)
      `)
            .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Error fetching stories:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});

// GET /api/story_moments/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("story_moments")
            .select(`
        id,
        title,
        song_url,
        start_time,
        duration,
        cover_url,
        description,
        users!story_moments_user_id_fkey(id, username, pfp_url)
      `)
            .eq("id", id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        console.error("Error fetching story:", err);
        res.status(500).json({ error: "Database error", details: err.message });
    }
});


module.exports = router;
