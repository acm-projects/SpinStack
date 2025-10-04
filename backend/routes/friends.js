const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../constants/supabase"); // use admin client

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
 * FRIENDS CRUD ROUTES
 */

// CREATE friendship (bi-directional)
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) {
        return res.status(400).json({ error: "user_id and friend_id are required" });
    }
    if (String(user_id) === String(friend_id)) {
        return res.status(400).json({ error: "Cannot friend yourself" });
    }

    try {
        // Check for existing friendship in either direction
        const p1 = supabaseAdmin.from("friends").select("id").match({ user_id, friend_id });
        const p2 = supabaseAdmin.from("friends").select("id").match({ user_id: friend_id, friend_id: user_id });
        const [r1, r2] = await Promise.all([p1, p2]);
        const { data: e1 } = r1;
        const { data: e2 } = r2;

        if ((e1 && e1.length) || (e2 && e2.length)) {
            return res.status(409).json({ error: "Friendship already exists" });
        }

        // Insert both directions
        const { data: inserted, error: insertErr } = await supabaseAdmin
            .from("friends")
            .insert([
                { user_id, friend_id },
                { user_id: friend_id, friend_id: user_id }
            ])
            .select();

        if (insertErr) throw insertErr;

        res.status(201).json(inserted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ friends by user ID
router.get("/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id } = req.params;
    if (!user_id) return res.status(400).json({ error: "user_id required" });

    try {
        const { data, error } = await supabaseAdmin
            .from("friends")
            .select("friend_id, created_at")
            .eq("user_id", user_id);

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE friendship (bi-directional)
router.delete("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id, friend_id } = req.body;
    if (!user_id || !friend_id) return res.status(400).json({ error: "user_id and friend_id required" });

    try {
        const { data, error } = await supabaseAdmin
            .from("friends")
            .delete()
            .or(`and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`)
            .select();

        if (error) throw error;
        res.json({ message: "Friendship deleted successfully", deleted: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
