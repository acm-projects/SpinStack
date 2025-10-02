const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();


// CREATE a shelf (with the first stack linked)
router.post('/', async (req, res) => {
    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {
        const { user_id, title, cover_url, visibility, firstStackId } = req.body;

        if (!user_id || !title || !firstStackId) {
            return res.status(400).json({
                error: "user_id, title, and firstStackId are required"
            });
        }

        // 1. Create the shelf
        const { data: shelf, error: shelfError } = await supabase
            .from('shelves')
            .insert([{ user_id, title, cover_url, visibility }])
            .select()
            .single();

        if (shelfError) return res.status(500).json({ error: "Shelf insert failed", details: shelfError });

        // 2. Verify the first stack exists
        const { data: stack, error: stackError } = await supabase
            .from('stacks')
            .select('*')
            .eq('id', firstStackId)
            .single();

        if (stackError || !stack) {
            return res.status(400).json({ error: "First stack not found", details: stackError });
        }

        // 3. Link stack to shelf at position 1
        const { error: linkError } = await supabase
            .from('stacks_in_shelves')
            .insert([{ shelf_id: shelf.id, stack_id: firstStackId, position: 1 }]);

        if (linkError) return res.status(500).json({ error: "Failed to link stack to shelf", details: linkError });

        // 4. Return the shelf with the first stack
        res.status(201).json({
            ...shelf,
            stacks: [stack]
        });

    } catch (err) {
        res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});


// ADD a stack to an existing shelf
router.post('/:id/stacks', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const shelfId = req.params.id;
    const { stackId } = req.body;

    if (!stackId) {
        return res.status(400).json({ error: "stackId is required" });
    }

    try {
        // 1. Check that the shelf exists
        const { data: shelf, error: shelfError } = await supabase
            .from('shelves')
            .select('*')
            .eq('id', shelfId)
            .single();

        if (shelfError || !shelf) return res.status(404).json({ error: "Shelf not found", details: shelfError });

        // 2. Check that the stack exists
        const { data: stack, error: stackError } = await supabase
            .from('stacks')
            .select('*')
            .eq('id', stackId)
            .single();

        if (stackError || !stack) return res.status(404).json({ error: "Stack not found", details: stackError });

        // 3. Count existing stacks in the shelf
        const { data: existingStacks, error: countError } = await supabase
            .from('stacks_in_shelves')
            .select('id')
            .eq('shelf_id', shelfId);

        if (countError) throw countError;

        // Example business rule: max 10 stacks per shelf
        if (existingStacks.length >= 10) {
            return res.status(400).json({ error: "Shelf cannot have more than 10 stacks" });
        }

        // 4. Insert new stack into shelf
        const { error: linkError } = await supabase
            .from('stacks_in_shelves')
            .insert([{
                shelf_id: shelfId,
                stack_id: stackId,
                position: existingStacks.length + 1
            }]);

        if (linkError) throw linkError;

        res.status(201).json({
            message: "Stack added to shelf successfully",
            shelfId,
            stackId,
            position: existingStacks.length + 1
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to add stack to shelf", details: err.message });
    }
});


// GET all shelves
router.get('/', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    try {
        const { data: shelves, error } = await supabase
            .from('shelves')
            .select('*');

        if (error) throw error;

        res.json(shelves);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shelves', details: err.message });
    }
});


// GET shelf by ID
router.get('/:id', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const { id } = req.params;

    try {
        const { data: shelf, error } = await supabase
            .from('shelves')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!shelf) return res.status(404).json({ error: 'Shelf not found' });

        res.json(shelf);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shelf', details: err.message });
    }
});


// GET shelves by user ID
router.get('/user/:user_id', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const { user_id } = req.params;

    try {
        const { data: shelves, error } = await supabase
            .from('shelves')
            .select('*')
            .eq('user_id', user_id);

        if (error) throw error;

        res.json(shelves);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user shelves', details: err.message });
    }
});


// GET shelf with its stacks
router.get('/:id/stacks', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const { id } = req.params;

    try {
        // 1. Fetch shelf
        const { data: shelf, error: shelfError } = await supabase
            .from('shelves')
            .select('*')
            .eq('id', id)
            .single();

        if (shelfError) throw shelfError;
        if (!shelf) return res.status(404).json({ error: 'Shelf not found' });

        // 2. Fetch stacks in the shelf
        const { data: stacks, error: stacksError } = await supabase
            .from('stacks_in_shelves')
            .select(`
                stack_id,
                stacks (*)
            `)
            .eq('shelf_id', id);

        if (stacksError) throw stacksError;

        // 3. Combine into one response
        res.json({
            ...shelf,
            stacks: stacks.map(row => row.stacks)
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch shelf with stacks', details: err.message });
    }
});


// UPDATE a shelf by ID
router.put('/:id', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data: shelf, error } = await supabase
            .from('shelves')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;

        res.json(shelf);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update shelf', details: err.message });
    }
});


// DELETE a shelf by ID
router.delete('/:id', async (req, res) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });
    const { id } = req.params;

    try {
        // Delete from join table first
        const { error: joinError } = await supabase
            .from('stacks_in_shelves')
            .delete()
            .eq('shelf_id', id);

        if (joinError) throw joinError;

        // Delete the shelf itself
        const { data: shelf, error } = await supabase
            .from('shelves')
            .delete()
            .eq('id', id)
            .select();

        if (error) throw error;

        if (!shelf || shelf.length === 0) {
            return res.status(404).json({ error: 'Shelf not found' });
        }

        res.json({ message: 'Shelf deleted successfully', shelf: shelf[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete shelf', details: err.message });
    }
});


module.exports = router;