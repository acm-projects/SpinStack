const express = require("express");
const { supabaseAdmin } = require("../constants/supabase"); // Use service role key
const router = express.Router();

// Helper to verify token and get user
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

// CREATE a shelf (with the first stack linked)
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { title, cover_url, visibility, firstStackId } = req.body;
    if (!title || !firstStackId) {
        return res.status(400).json({ error: "title and firstStackId are required" });
    }

    try {
        // 1. Create shelf
        const { data: shelf, error: shelfError } = await supabaseAdmin
            .from("shelves")
            .insert([{ user_id: user.id, title, cover_url, visibility }])
            .select()
            .single();

        if (shelfError) throw shelfError;

        // 2. Verify the first stack exists
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .select("*")
            .eq("id", firstStackId)
            .single();

        if (stackError || !stack) return res.status(400).json({ error: "First stack not found", details: stackError });

        // 3. Link stack to shelf at position 1
        const { error: linkError } = await supabaseAdmin
            .from("stacks_in_shelves")
            .insert([{ shelf_id: shelf.id, stack_id: firstStackId, position: 1 }]);

        if (linkError) throw linkError;

        res.status(201).json({ ...shelf, stacks: [stack] });

    } catch (err) {
        res.status(500).json({ error: "Failed to create shelf", details: err.message });
    }
});

// ADD a stack to an existing shelf
router.post("/:id/stacks", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const shelfId = req.params.id;
    const { stackId } = req.body;
    if (!stackId) return res.status(400).json({ error: "stackId is required" });

    try {
        // 1. Check shelf exists
        const { data: shelf, error: shelfError } = await supabaseAdmin
            .from("shelves")
            .select("*")
            .eq("id", shelfId)
            .single();
        if (shelfError || !shelf) return res.status(404).json({ error: "Shelf not found", details: shelfError });

        // 2. Check stack exists
        const { data: stack, error: stackError } = await supabaseAdmin
            .from("stacks")
            .select("*")
            .eq("id", stackId)
            .single();
        if (stackError || !stack) return res.status(404).json({ error: "Stack not found", details: stackError });

        // 3. Count existing stacks
        const { data: existingStacks, error: countError } = await supabaseAdmin
            .from("stacks_in_shelves")
            .select("id")
            .eq("shelf_id", shelfId);
        if (countError) throw countError;

        if (existingStacks.length >= 10)
            return res.status(400).json({ error: "Shelf cannot have more than 10 stacks" });

        // 4. Insert new stack
        const { error: linkError } = await supabaseAdmin
            .from("stacks_in_shelves")
            .insert([{ shelf_id: shelfId, stack_id: stackId, position: existingStacks.length + 1 }]);
        if (linkError) throw linkError;

        res.status(201).json({ message: "Stack added successfully", shelfId, stackId, position: existingStacks.length + 1 });

    } catch (err) {
        res.status(500).json({ error: "Failed to add stack to shelf", details: err.message });
    }
});

// GET all shelves for this user
router.get("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data: shelves, error } = await supabaseAdmin
            .from("shelves")
            .select("*")
            .eq("user_id", user.id);
        if (error) throw error;

        res.json(shelves);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch shelves", details: err.message });
    }
});

// GET shelf by ID (with its stacks)
router.get("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { id } = req.params;
    try {
        const { data: shelf, error: shelfError } = await supabaseAdmin
            .from("shelves")
            .select("*")
            .eq("id", id)
            .single();
        if (shelfError || !shelf) return res.status(404).json({ error: "Shelf not found", details: shelfError });

        const { data: stacks, error: stacksError } = await supabaseAdmin
            .from("stacks_in_shelves")
            .select("stack_id, stacks(*)")
            .eq("shelf_id", id);
        if (stacksError) throw stacksError;

        res.json({ ...shelf, stacks: stacks.map(row => row.stacks) });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch shelf", details: err.message });
    }
});

// UPDATE shelf
router.put("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: shelf, error } = await supabaseAdmin
            .from("shelves")
            .update(updates)
            .eq("id", id)
            .eq("user_id", user.id)
            .select();
        if (error) throw error;

        res.json(shelf);
    } catch (err) {
        res.status(500).json({ error: "Failed to update shelf", details: err.message });
    }
});

// DELETE shelf
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { id } = req.params;
    try {
        // Delete from join table
        const { error: joinError } = await supabaseAdmin
            .from("stacks_in_shelves")
            .delete()
            .eq("shelf_id", id);
        if (joinError) throw joinError;

        // Delete the shelf
        const { data: shelf, error } = await supabaseAdmin
            .from("shelves")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id)
            .select();
        if (error) throw error;
        if (!shelf || shelf.length === 0) return res.status(404).json({ error: "Shelf not found" });

        res.json({ message: "Shelf deleted successfully", shelf: shelf[0] });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete shelf", details: err.message });
    }
});

module.exports = router;
