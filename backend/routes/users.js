const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();

/**
 * USERS CRUD ROUTES
 */

// READ all users
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase.from("users").select("*");
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ a single user by ID
router.get("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
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

// UPDATE a user by ID
router.put("/:id", async (req, res) => {
    const { username, email, pfp_url, bio } = req.body;

    try {
        const { data, error } = await supabase
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

// DELETE a user by ID
router.delete("/:id", async (req, res) => {
    try {
        const { data, error } = await supabase
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
