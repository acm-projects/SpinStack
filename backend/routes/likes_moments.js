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

/**
 * LIKES_MOMENTS CRUD ROUTES
 */

// CREATE - like a moment
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.body;
    if (!moment_id) {
        return res.status(400).json({ error: "moment_id is required" });
    }

    try {
        // Check if moment exists and get its owner
        const { data: moment, error: momentError } = await supabaseAdmin
            .from("moments")
            .select("id, user_id")
            .eq("id", moment_id)
            .single();

        if (momentError || !moment) {
            return res.status(404).json({ error: "Moment not found" });
        }

        // Prevent duplicate likes
        const { data: existingLike, error: checkError } = await supabaseAdmin
            .from("likes_moments")
            .select("id")
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") throw checkError;
        if (existingLike) {
            return res.status(409).json({ error: "Moment already liked by this user" });
        }

        // Create the like
        const { data, error } = await supabaseAdmin
            .from("likes_moments")
            .insert([{ user_id: user.id, moment_id }])
            .select()
            .single();

        if (error) throw error;

        // Create a notification for the moment owner
        await supabaseAdmin.from("notifications").insert([
            {
                user_id: moment.user_id,          // receiver = owner of the moment
                sender_id: user.id,               // sender = liker
                type: "like",
                content: `${user.username || "Someone"} liked your moment!`,
                is_read: false,
            },
        ]);

        // Return success
        res.status(201).json(data);
    } catch (err) {
        console.error("❌ Error in /likes_moments:", err);
        res.status(500).json({ error: err.message });
    }
});

// READ - get all likes for a moment
router.get("/moment/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_moments")
            .select("id, user_id, created_at")
            .eq("moment_id", moment_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - get all moments liked by a user
router.get("/user/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_moments")
            .select("id, moment_id, created_at")
            .eq("user_id", user_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - check if user liked a specific moment
router.get("/check/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_moments")
            .select("id")
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({ liked: !!data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - unlike a moment
router.delete("/:moment_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { moment_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_moments")
            .delete()
            .eq("user_id", user.id)
            .eq("moment_id", moment_id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Like not found" });
        }

        res.json({ message: "Moment unliked successfully", deleted: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;