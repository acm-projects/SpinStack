const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();


// CREATE a daily (with backend testing auth)
router.post("/", async (req, res) => {
    const { group_id, prompt, date } = req.body;

    if (!group_id || !prompt) {
        return res.status(400).json({ error: "group_id and prompt are required" });
    }

    try {
        const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!", // replace with test password
        });

        // Insert into dailies table
        const { data, error } = await supabase
            .from("dailies")
            .insert([{ group_id, prompt, date: date || new Date().toISOString().split('T')[0] }])
            .select();

        if (error) throw error;

        res.status(201).json({ daily: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ all dailies
router.get("/", async (req, res) => {
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { data, error } = await supabase.from("dailies").select("*");
        if (error) throw error;
        res.json({ dailies: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ one daily by ID
router.get("/:id", async (req, res) => {
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { data, error } = await supabase
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
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { data, error } = await supabase
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
    const { prompt, date } = req.body;

    if (!prompt && !date) {
        return res.status(400).json({ error: "At least one field (prompt or date) is required" });
    }

    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const updates = {};
        if (prompt) updates.prompt = prompt;
        if (date) updates.date = date;

        const { data, error } = await supabase
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
    try {
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: "bradleynguyen81@gmail.com",
            password: "Goon123!"
        });
        if (authError) return res.status(401).json({ error: "Authentication failed" });

        const { error } = await supabase.from("dailies").delete().eq("id", req.params.id);
        if (error) throw error;

        res.json({ message: "Daily deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;