const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../constants/supabase");

// Helper: verify JWT and return user
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
 * LIKES_STORIES CRUD ROUTES
 */

// CREATE - like a story
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.body;
    if (!moment_id) return res.status(400).json({ error: "moment_id is required" });

    try {
        // Check if story exists and get owner
        const { data: story, error: storyError } = await supabaseAdmin
            .from("story_moments")
            .select("id, user_id")
            .eq("id", moment_id)
            .single();

        if (storyError || !story) return res.status(404).json({ error: "Story not found" });

        // Prevent duplicate likes
        const { data: existingLike, error: checkError } = await supabaseAdmin
            .from("likes_stories")
            .select("id")
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") throw checkError;
        if (existingLike) return res.status(409).json({ error: "Story already liked by this user" });

        // Create the like
        const { data, error } = await supabaseAdmin
            .from("likes_stories")
            .insert([{ user_id: user.id, moment_id }])
            .select()
            .single();

        if (error) throw error;

        // Create notification for the story owner
        await supabaseAdmin.from("notifications").insert([{
            user_id: story.user_id,
            sender_id: user.id,
            type: "like_story",
            content: `${user.username || "Someone"} liked your story!`,
            is_read: false,
        }]);

        res.status(201).json(data);
    } catch (err) {
        console.error("Error in /likes_stories:", err);
        res.status(500).json({ error: err.message });
    }
});

// READ - all likes for a story
router.get("/story/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stories")
            .select("id, user_id, created_at")
            .eq("moment_id", moment_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - all stories liked by a user
router.get("/user/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stories")
            .select("id, moment_id, created_at")
            .eq("user_id", user_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - check if current user liked a story
router.get("/check/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stories")
            .select("id")
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;
        res.json({ liked: !!data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - unlike a story
router.delete("/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stories")
            .delete()
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: "Like not found" });

        res.json({ message: "Story unliked successfully", deleted: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
