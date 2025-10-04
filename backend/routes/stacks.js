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

// CREATE a stack (with the first moment linked)
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { title, description, cover_url, visibility, firstMomentId } = req.body;
    if (!title || !firstMomentId) {
        return res.status(400).json({ error: "title and firstMomentId are required" });
    }

    try {
        // 1. Create the stack
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .insert([{ user_id: user.id, title, description, cover_url, visibility }])
            .select()
            .single();
        if (stackError) throw stackError;

        // 2. Verify the first moment exists
        const { data: moment, error: momentError } = await supabaseAdmin
            .from("moments")
            .select("*")
            .eq("id", firstMomentId)
            .single();
        if (momentError || !moment) return res.status(400).json({ error: "First moment not found", details: momentError });

        // 3. Link moment to stack at position 1
        const { error: linkError } = await supabaseAdmin
            .from("moments_in_stacks")
            .insert([{ stack_id: stack.id, moment_id: firstMomentId, position: 1 }]);
        if (linkError) throw linkError;

        // 4. Return stack with first moment
        res.status(201).json({ ...stack, moments: [moment] });

    } catch (err) {
        res.status(500).json({ error: "Failed to create stack", details: err.message });
    }
});

// ADD a moment to an existing stack
router.post("/:id/moments", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const stackId = req.params.id;
    const { momentId } = req.body;
    if (!momentId) return res.status(400).json({ error: "momentId is required" });

    try {
        // 1. Check stack exists
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .select("*")
            .eq("id", stackId)
            .single();
        if (stackError || !stack) return res.status(404).json({ error: "Stack not found", details: stackError });

        // 2. Check moment exists
        const { data: moment, error: momentError } = await supabaseAdmin
            .from("moments")
            .select("*")
            .eq("id", momentId)
            .single();
        if (momentError || !moment) return res.status(404).json({ error: "Moment not found", details: momentError });

        // 3. Count existing moments
        const { data: existingMoments, error: countError } = await supabaseAdmin
            .from("moments_in_stacks")
            .select("id")
            .eq("stack_id", stackId);
        if (countError) throw countError;

        if (existingMoments.length >= 5)
            return res.status(400).json({ error: "Stack cannot have more than 5 moments" });

        // 4. Insert new moment
        const { error: linkError } = await supabaseAdmin
            .from("moments_in_stacks")
            .insert([{ stack_id: stackId, moment_id: momentId, position: existingMoments.length + 1 }]);
        if (linkError) throw linkError;

        res.status(201).json({ message: "Moment added to stack successfully", stackId, momentId, position: existingMoments.length + 1 });

    } catch (err) {
        res.status(500).json({ error: "Failed to add moment to stack", details: err.message });
    }
});

// GET all stacks for this user
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data: stacks, error } = await supabaseAdmin
            .from("stacks")
            .select("*")
            .eq("user_id", user.id);
        if (error) throw error;

        res.json(stacks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stacks", details: err.message });
    }
});

// GET stack by ID with moments
router.get("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const stackId = req.params.id;

    try {
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .select("*")
            .eq("id", stackId)
            .single();
        if (stackError || !stack) return res.status(404).json({ error: "Stack not found", details: stackError });

        const { data: moments, error: momentsError } = await supabaseAdmin
            .from("moments_in_stacks")
            .select("moment_id, moments(*)")
            .eq("stack_id", stackId);
        if (momentsError) throw momentsError;

        res.json({ ...stack, moments: moments.map(row => row.moments) });

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stack", details: err.message });
    }
});

// UPDATE stack by ID
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const stackId = req.params.id;
    const updates = req.body;

    try {
        const { data: updatedStack, error } = await supabaseAdmin
            .from("stacks")
            .update(updates)
            .eq("id", stackId)
            .eq("user_id", user.id)
            .select();
        if (error) throw error;

        res.json(updatedStack);
    } catch (err) {
        res.status(500).json({ error: "Failed to update stack", details: err.message });
    }
});

// DELETE stack by ID
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const stackId = req.params.id;

    try {
        // Delete from join table first
        const { error: joinError } = await supabaseAdmin
            .from("moments_in_stacks")
            .delete()
            .eq("stack_id", stackId);
        if (joinError) throw joinError;

        // Delete stack
        const { data: stack, error } = await supabaseAdmin
            .from("stacks")
            .delete()
            .eq("id", stackId)
            .eq("user_id", user.id)
            .select();
        if (error) throw error;
        if (!stack || stack.length === 0) return res.status(404).json({ error: "Stack not found" });

        res.json({ message: "Stack deleted successfully", stack: stack[0] });

    } catch (err) {
        res.status(500).json({ error: "Failed to delete stack", details: err.message });
    }
});

module.exports = router;
