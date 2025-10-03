const express = require("express");
const { supabaseAdmin } = require("../constants/supabase");
const router = express.Router();

// Helper to verify token
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
 * USERS CRUD ROUTES
 */

// READ all users (only admin or authorized)
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin.from("users").select("*");
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ a single user by ID
router.get("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("users")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a user by ID (only self or admin)
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { username, email, pfp_url, bio } = req.body;

    // Optional: restrict updates to self
    if (user.id !== req.params.id) {
        return res.status(403).json({ error: "Forbidden: Cannot update other users" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("users")
            .update({
                username,
                email,
                pfp_url: pfp_url ?? null,
                bio: bio ?? null,
            })
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a user by ID (only self or admin)
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    // Optional: restrict deletion to self
    if (user.id !== req.params.id) {
        return res.status(403).json({ error: "Forbidden: Cannot delete other users" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("users")
            .delete()
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: "User deleted", deleted: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
