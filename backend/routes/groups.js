const express = require("express");
const { supabase } = require("../constants/supabase");
const { supabaseAdmin } = require("../constants/supabase");
const router = express.Router();


// CREATE a group (with backend testing auth)
router.post("/", async (req, res) => {
    const { name, max_members } = req.body;

    if (!name || !max_members) {
        return res.status(400).json({ error: "Name and max_members are required" });
    }

    try {
        const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
            email: "highskies8@gmail.com",
            password: "Riggsbra000!", // replace with test password
        });

        // Insert into groups table
        const { data, error } = await supabase
            .from("groups")
            .insert([{ name, max_members }])
            .select();

        if (error) throw error;

        res.status(201).json({ group: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- READ all groups ---
router.get("/", async (req, res) => {
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "email",
            password: "pw"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { data, error } = await supabase.from("groups").select("*");
        if (error) throw error;
        res.json({ groups: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- READ one group by ID ---
router.get("/:id", async (req, res) => {
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "email",
            password: "pw"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { data, error } = await supabase
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

// --- UPDATE group ---
router.put("/:id", async (req, res) => {
    const { name, max_members } = req.body;

    if (!name && !max_members) {
        return res.status(400).json({ error: "At least one field (name or max_members) is required" });
    }

    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "email",
            password: "pw"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const updates = {};
        if (name) updates.name = name;
        if (max_members) updates.max_members = max_members;

        const { data, error } = await supabase
            .from("groups")
            .update(updates)
            .eq("id", req.params.id)
            .select();

        if (error) throw error;
        res.json({ group: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- DELETE group ---
router.delete("/:id", async (req, res) => {
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "email",
            password: "pw"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { error } = await supabase.from("groups").delete().eq("id", req.params.id);
        if (error) throw error;

        res.json({ message: "Group deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;