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
 * DAILIES CRUD ROUTES
 */

// CREATE daily
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { group_id, prompt, date } = req.body;
    if (!group_id || !prompt) {
        return res.status(400).json({ error: "group_id and prompt are required" });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("dailies")
            .insert([{ group_id, prompt, date: date || new Date().toISOString().split("T")[0] }])
            .select();

        if (error) throw error;
        res.status(201).json({ daily: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ all dailies
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin.from("dailies").select("*");
        if (error) throw error;
        res.json({ dailies: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ one daily by ID
router.get("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("dailies")
            .select("*")
            .eq("id", req.params.id)
            .single();

        if (error) throw error;
        res.json({ daily: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ dailies by group ID
router.get("/group/:group_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("dailies")
            .select("*")
            .eq("group_id", req.params.group_id)
            .order("date", { ascending: false });

        if (error) throw error;
        res.json({ dailies: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE daily
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { prompt, date } = req.body;
    if (!prompt && !date) {
        return res.status(400).json({ error: "At least one field (prompt or date) is required" });
    }

    try {
        const updates = {};
        if (prompt) updates.prompt = prompt;
        if (date) updates.date = date;

        const { data, error } = await supabaseAdmin
            .from("dailies")
            .update(updates)
            .eq("id", req.params.id)
            .select();

        if (error) throw error;
        res.json({ daily: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE daily
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin.from("dailies").delete().eq("id", req.params.id).select();
        if (error) throw error;

        res.json({ message: "Daily deleted successfully", deleted: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
