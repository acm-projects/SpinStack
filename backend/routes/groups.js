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
 * GROUPS CRUD ROUTES
 */

// CREATE a group
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { name, max_members } = req.body;
    if (!name || !max_members) {
        return res.status(400).json({ error: "Name and max_members are required" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("groups")
            .insert([{ name, max_members, owner_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ group: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ all groups
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin.from("groups").select("*");
        if (error) throw error;
        res.json({ groups: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ a single group by ID
router.get("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("groups")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) throw error;
        res.json({ group: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE a group
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { name, max_members } = req.body;
    if (!name && !max_members) {
        return res.status(400).json({ error: "At least one field (name or max_members) is required" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (max_members) updates.max_members = max_members;

    try {
        const { data, error } = await supabaseAdmin
            .from("groups")
            .update(updates)
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ group: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a group
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("groups")
            .delete()
            .eq("id", req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: "Group deleted successfully", group: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
