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
 * LIKES_STACKS CRUD ROUTES
 */

// CREATE - like a stack
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { stack_id } = req.body;
    if (!stack_id) {
        return res.status(400).json({ error: "stack_id is required" });
    }

    try {
        // Check if stack exists
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .select("id")
            .eq("id", stack_id)
            .single();

        if (stackError || !stack) {
            return res.status(404).json({ error: "Stack not found" });
        }

        // Check if user already liked this stack
        const { data: existingLike, error: checkError } = await supabaseAdmin
            .from("likes_stacks")
            .select("id")
            .eq("user_id", user.id)
            .eq("stack_id", stack_id)
            .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') throw checkError;

        if (existingLike) {
            return res.status(409).json({ error: "Stack already liked by this user" });
        }

        // Create the like
        const { data, error } = await supabaseAdmin
            .from("likes_stacks")
            .insert([{ user_id: user.id, stack_id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - get all likes for a stack
router.get("/stack/:stack_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { stack_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stacks")
            .select("id, user_id, created_at")
            .eq("stack_id", stack_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - get all stacks liked by a user
router.get("/user/:user_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { user_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stacks")
            .select("id, stack_id, created_at")
            .eq("user_id", user_id);

        if (error) throw error;
        res.json({ likes: data, count: data.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ - check if user liked a specific stack
router.get("/check/:stack_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { stack_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stacks")
            .select("id")
            .eq("user_id", user.id)
            .eq("stack_id", stack_id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({ liked: !!data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE - unlike a stack
router.delete("/:stack_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { stack_id } = req.params;

    try {
        const { data, error } = await supabaseAdmin
            .from("likes_stacks")
            .delete()
            .eq("user_id", user.id)
            .eq("stack_id", stack_id)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({ error: "Like not found" });
        }

        res.json({ message: "Stack unliked successfully", deleted: data[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;