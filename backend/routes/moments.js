//Feel free to use this as a template for other supabase tables, 
// CRUD operations may vary in operations used (post, delete, etc..)

const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();

// Example fetch api call from front end
// const { data, error} = await supabase.getUser
// fetch("http://localhost:5000/api/moments/moment/123", {
//   method: "DELETE",
//   headers: {
//     "Authorization": `Bearer ${accessToken}`,
//     "Content-Type": "application/json"
//   }
// });


// Use these lines (in each route) to extract access token for verification of request BEFORE the supabase call
// const authHeader = req.headers.authorization;
// const token = authHeader.split(" ")[1]; // "Bearer <token>" → just the token
//
// const { data: { user }, error } = await supabase.auth.getUser(token);




// CREATE a moment
//Note: Once frontend is made, ensure verification of request
router.post("/", async (req, res) => {
    const {
        user_id,
        title,
        song_url,
        start_time,
        duration,
        cover_url,
        visibility,
    } = req.body;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'email',
        password: 'pw'
    });

    try {

        if (error || !data.session) {
            return res.status(401).json({ error: "Authentication failed" });
        }



        // Insert new moment
        const { data: momentData, error: momentError } = await supabase
            .from("moments")
            .insert([
                {
                    user_id,
                    title,
                    song_url,
                    start_time: start_time ?? null,
                    duration: duration ?? null,
                    cover_url: cover_url ?? null,
                    visibility: visibility ?? true,
                },
            ])
            .select()
            .single("*");

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

// GET all moments
router.get("/", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("moments")
            .select("*"); // get all columns

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//Read ALL moments by User ID
router.get("/user/:id", async (req, res) => {

    try {
        const { data, error } = await supabase
            .from("moments")
            .select("*")
            .eq("user_id", req.params.id)
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Return a specific moment by moment ID
router.get("/moment/:id", async (req, res) => {

    try {
        const { data, error } = await supabase
            .from("moments")
            .select("*")
            .eq("id", req.params.id)
        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

// UPDATE a moment by ID
//Note: Once frontend is made, ensure verification of request
router.put("/:id", async (req, res) => {
    const {
        title,
        song_url,
        start_time,
        duration,
        cover_url,
        visibility,
    } = req.body;

    // Authenticate user (testing only)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {

        // Only include fields that are defined
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (song_url !== undefined) updates.song_url = song_url;
        if (start_time !== undefined) updates.start_time = start_time;
        if (duration !== undefined) updates.duration = duration;
        if (cover_url !== undefined) updates.cover_url = cover_url;
        if (visibility !== undefined) updates.visibility = visibility;

        // If updates object is empty, nothing to do
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No fields provided to update" });
        }
        const { data, error } = await supabase
            .from("moments")
            .update(updates)
            .eq("id", req.params.id)
            .select()
            .maybeSingle();

        if (error) {
            return res
                .status(500)
                .json({ error: "Database error", details: error.message });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//Delete ALL moments by user ID
//Note: Once frontend is made, ensure verification of request
router.delete("/user/:id", async (req, res) => {

    await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });

    try {
        const { data, error } = await supabase
            .from("moments")
            .delete()
            .eq("user_id", req.params.id)
            .select("*")
        if (error) {
            return res
                .status(500)
                .json({ error: "Database error", details: error.message });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
})

//Delete a moment by moment ID
//Note: Once frontend is made, ensure verification of request
router.delete("/moment/:id", async (req, res) => {

    // Authenticate user (testing only)
    await supabase.auth.signInWithPassword({
        email: 'your email',
        password: 'your password'
    });


    try {
        let { data, error } = await supabase
            .from("moments")
            .delete()
            .eq("id", req.params.id)
            .select("*")

        if (error) {
            return res
                .status(500)
                .json({ error: "Database error", details: error.message });
        }
        res.status(200).json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        res.status(500).json({ error: "Server error" });
    }
})




module.exports = router;
