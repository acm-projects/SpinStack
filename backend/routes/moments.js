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

// CREATE a moment
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { title, song_url, start_time, duration, cover_url, visibility, description } = req.body;

    console.log("Token user ID:", user.id);

    try {
        const { data, error } = await supabaseAdmin
            .from("moments")
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

// GET all moments
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin.from("moments").select("*");
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET a moment by ID
router.get("/moment/:id", async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("moments")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a moment
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const updates = { ...req.body };

    try {
        const { data, error } = await supabaseAdmin
            .from("moments")
            .update(updates)
            .eq("id", req.params.id)
            .eq("user_id", user.id) // only allow owner to update
            .select()
            .maybeSingle();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a moment
router.delete("/moment/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("moments")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", user.id) // only allow owner to delete
            .select();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
