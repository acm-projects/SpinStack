const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../constants/supabase"); // Use admin client for privileged access

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
 * GROUP_MEMBERS CRUD ROUTES
 */

// CREATE - add user to a group
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id, user_id } = req.body;
    if (!group_id || !user_id) {
        return res.status(400).json({ error: "group_id and user_id are required" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .insert([{ group_id, user_id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - get all group members or filter by group_id
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id } = req.query;

    try {
        let query = supabaseAdmin.from("group_members").select("*");

        if (group_id) query = query.eq("group_id", group_id);

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - get specific member by group_id and user_id
router.get("/:group_id/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id, user_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .select("*")
            .eq("group_id", group_id)
            .eq("user_id", user_id)
            .single();

        if (error) return res.status(404).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE - change group membership (move a user to another group)
router.put("/:group_id/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id, user_id } = req.params;
    const { new_group_id, new_user_id } = req.body;

    try {
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .update({
                group_id: new_group_id || group_id,
                user_id: new_user_id || user_id,
            })
            .eq("group_id", group_id)
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - remove user from a group
router.delete("/:group_id/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id, user_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("group_members")
            .delete()
            .eq("group_id", group_id)
            .eq("user_id", user_id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: "Member removed from group", member: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
