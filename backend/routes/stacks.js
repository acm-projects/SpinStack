const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();


//CREATING STACK FOR THE FIRST TIME ONLY!!
router.post('/', async (req, res) => {



    try {
        const { user_id, title, description, cover_url, visibility, firstMomentId } = req.body;

        // Authenticate user (testing only)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'email',
            password: 'pw'
        });

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
        email: 'your email',
        password: 'your password'
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

//Get ALL stacks
router.get('/', async (req, res) => {
    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {
        const { data: stackData, error: stackErr } = await supabase
            .from('stacks')
            .select('*');

        if (stackErr) throw stackErr;

        res.json(stackData)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stacks', details: err.message });
    }
});

//Get Stack by ID
router.get('/stack/:id', async (req, res) => {
    const { id } = req.params;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {

        const { data: stackData, error: stackErr } = await supabase
            .from('stacks')
            .select('*')
            .eq('id', id)
            .single();

        if (stackErr) throw stackErr;
        if (!stackData) return res.status(404).json({ error: 'Stack not found' });

        res.json(stackData);

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stack', details: err.message });
    }
});

//Get all stacks by user ID
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {

        const { data: stackData, err: stackErr } = await supabase
            .from('stacks')
            .select('*')
            .eq('user_id', user_id);

        if (stackErr) throw stackErr;
        res.json(stackData);

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user stacks', details: err.message });
    }
});

// GET stack with its moments
router.get('/moments/:id', async (req, res) => {
    const { id } = req.params;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {

        // 1. Fetch stack
        const { data: stackData, error: stackError } = await supabase
            .from('stacks')
            .select('*')
            .eq('id', id)
            .single();

        if (stackError) throw stackError;
        if (!stackData) return res.status(404).json({ error: 'Stack not found' });

        // 2. Fetch all moments linked to this stack
        const { data: moments, error: momentsError } = await supabase
            .from('moments_in_stacks')
            .select(`
            moment_id,
            moments (*)
            `)
            .eq('stack_id', id);

        if (momentsError) throw momentsError;

        // 3. Combine into one response
        res.json({
            ...stackData,
            moments: moments.map(row => row.moments) // flatten so client just sees moments[]
        });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stack with moments', details: err.message });
    }
});

// Update a stack by ID
router.put('/:stack_id', async (req, res) => {
    const { stack_id } = req.params;
    const updates = req.body; // Whatever fields you send in Postman

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {
        const { data: stackData, error: stackError } = await supabase
            .from('stacks')
            .update(updates)   // Apply changes
            .eq('id', stack_id) // Match the stack
            .select();          // Return updated row(s)

        if (stackError) throw stackError;

        res.json(stackData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update stack', details: err.message });
    }
});

// Delete a stack by ID
router.delete('/:stack_id', async (req, res) => {
    const { stack_id } = req.params;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {
        // First, optionally delete all entries in the join table (moments_in_stacks)
        const { error: joinError } = await supabase
            .from('moments_in_stacks')
            .delete()
            .eq('stack_id', stack_id);

        if (joinError) throw joinError;

        // Then delete the stack itself
        const { data: stackData, error: stackError } = await supabase
            .from('stacks')
            .delete()
            .eq('id', stack_id)
            .select(); // return deleted row

        if (stackError) throw stackError;

        if (!stackData || stackData.length === 0) {
            return res.status(404).json({ error: 'Stack not found' });
        }

        res.json({ message: 'Stack deleted successfully', stack: stackData[0] });

    } catch (err) {
        res.status(500).json({ error: 'Failed to delete stack', details: err.message });
    }
});




module.exports = router;