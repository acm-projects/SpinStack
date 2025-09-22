const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();

// CREATE a moment
router.post("/", async (req, res) => {
    const {
        title,
        song_url,
        start_time,
        duration,
        cover_url,
        stack_id,
        visibility,
    } = req.body;

    try {
        // Authenticate user (testing only)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'highskies8@gmail.com',
            password: 'Riggsbra000!'
        });

        if (error || !data.session) {
            return res.status(401).json({ error: "Authentication failed" });
        }

        const user = data.user;

        // Insert new moment
        const { data: momentData, error: momentError } = await supabase
            .from("moments")
            .insert([
                {
                    user_id: user.id,
                    title,
                    song_url,
                    start_time: start_time ?? null,
                    duration: duration ?? null,
                    cover_url: cover_url ?? null,
                    stack_id: stack_id ?? null,
                    visibility: visibility ?? true,
                },
            ])
            .select()
            .single();

        if (momentError) {
            console.error("Supabase insert error:", momentError);
            return res.status(500).json({ error: "Database error", details: momentError.message });
        }

        res.status(201).json(momentData);

    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
