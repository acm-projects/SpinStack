const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();


//CREATING STACK FOR THE FIRST TIME ONLY!!
router.post('/', async (req, res) => {

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'highskies8@gmail.com',
        password: 'Riggsbra000!'
    });

    try {
        const { user_id, title, description, cover_url, visibility, firstMomentId } = req.body;

        if (!user_id || !title || !firstMomentId) {
            return res.status(400).json({
                error: "user_id, title, and firstMomentId are required"
            });
        }

        // 1. Create the stack
        console.log('Creating stack...');
        const { data: stack, error: stackError } = await supabase
            .from('stacks')
            .insert([{ user_id, title, description, cover_url, visibility }])
            .select()
            .single();

        if (stackError) {
            console.error('Stack insert error:', stackError);
            return res.status(500).json({ error: "Stack insert failed", details: stackError });
        }
        console.log('Stack created:', stack);

        // 2. Verify the moment exists
        console.log('Verifying first moment exists...');
        const { data: moment, error: momentError } = await supabase
            .from('moments')
            .select('*')
            .eq('id', firstMomentId)
            .single();

        if (momentError || !moment) {
            console.error('Moment fetch error:', momentError);
            return res.status(400).json({ error: "First moment not found", details: momentError });
        }
        console.log('Moment exists:', moment);

        // 3. Link moment to stack at position 1
        console.log('Linking moment to stack...');
        const { error: linkError } = await supabase
            .from('moments_in_stacks')
            .insert([{ stack_id: stack.id, moment_id: firstMomentId, position: 1 }]);

        if (linkError) {
            console.error('Link insert error:', linkError);
            return res.status(500).json({ error: "Failed to link moment to stack", details: linkError });
        }
        console.log('Moment linked successfully');

        // 4. Return the stack with the first moment
        res.status(201).json({
            ...stack,
            moments: [moment]
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: "Unexpected server error", details: err.message });
    }
});

// POST /api/stacks/:id/moments → add a moment to an ALREADY EXISTING stack 
router.post('/:id/moments', async (req, res) => {

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'highskies8@gmail.com',
        password: 'Riggsbra000!'
    });

    try {
        const stackId = req.params.id;
        const { momentId } = req.body;

        if (!momentId) {
            return res.status(400).json({ error: "momentId is required" });
        }

        // 1. Check that the stack exists
        const { data: stack, error: stackError } = await supabase
            .from('stacks')
            .select('*')
            .eq('id', stackId)
            .single();

        if (stackError || !stack) {
            return res.status(404).json({ error: "Stack not found", details: stackError });
        }

        // 2. Check that the moment exists
        const { data: moment, error: momentError } = await supabase
            .from('moments')
            .select('*')
            .eq('id', momentId)
            .single();

        if (momentError || !moment) {
            return res.status(404).json({ error: "Moment not found", details: momentError });
        }

        // 3. Count existing moments in the stack
        const { data: existingMoments, error: countError } = await supabase
            .from('moments_in_stacks')
            .select('id')
            .eq('stack_id', stackId);

        if (countError) throw countError;

        if (existingMoments.length >= 5) {
            return res.status(400).json({ error: "Stack cannot have more than 5 moments" });
        }

        // 4. Insert new moment into the stack
        const { error: linkError } = await supabase
            .from('moments_in_stacks')
            .insert([{
                stack_id: stackId,
                moment_id: momentId,
                position: existingMoments.length + 1
            }]);

        if (linkError) throw linkError;

        res.status(201).json({
            message: "Moment added to stack successfully",
            stackId,
            momentId,
            position: existingMoments.length + 1
        });

    } catch (err) {
        console.error('Error adding moment to stack:', err);
        res.status(500).json({ error: "Failed to add moment to stack", details: err.message });
    }
});

module.exports = router;