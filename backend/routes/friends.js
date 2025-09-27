const express = require("express");
const { supabase } = require("../constants/supabase");
const router = express.Router();


//Adding friends to table
router.post("/", async (req, res) => {
    try {

        // Authenticate user (testing only)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'highskies8@gmail.com',
            password: 'Riggsbra000!'
        });

        const { user_id, friend_id } = req.body;

        if (!user_id || !friend_id) {
            return res.status(400).json({ error: "user_id and friend_id required" });
        }

        if (String(user_id) === String(friend_id)) {
            return res.status(400).json({ error: "Cannot friend yourself" });
        }

        // Lightweight duplicate checks (works if your RLS allows it)
        const p1 = supabase.from("friends").select("id").match({ user_id, friend_id });
        const p2 = supabase.from("friends").select("id").match({ user_id: friend_id, friend_id: user_id });
        const [r1, r2] = await Promise.all([p1, p2]);
        const { data: e1, error: err1 } = r1;
        const { data: e2, error: err2 } = r2;

        if (err1 || err2) {
            // Log it but continue: selects can fail/return empty due to RLS; DB constraint below will still protect us.
            console.warn("duplicate-check select error:", err1 || err2);
        }

        if ((e1 && e1.length) || (e2 && e2.length)) {
            return res.status(409).json({ error: "Friendship already exists" });
        }

        // Attempt to insert both directions. The DB unique constraint will stop duplicates even in race conditions.
        const { data: inserted, error: insertErr } = await supabase
            .from("friends")
            .insert([
                { user_id, friend_id },
                { user_id: friend_id, friend_id: user_id }
            ])
            .select();

        if (insertErr) {
            // Detect duplicate-key / unique constraint failure
            const msg = String(insertErr.message || "").toLowerCase();
            if (msg.includes("duplicate") || msg.includes("unique") || (insertErr.code && insertErr.code === "23505")) {
                return res.status(409).json({ error: "Friendship already exists" });
            }
            console.error("insert error:", insertErr);
            return res.status(400).json({ error: insertErr.message });
        }

        return res.status(201).json(inserted);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
});

// GET friends by user ID
router.get("/:user_id", async (req, res) => {
    try {

        // Authenticate user (testing only)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'highskies8@gmail.com',
            password: 'Riggsbra000!'
        });

        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ error: "user_id required" });
        }

        const { data: friendData, error: friendErr } = await supabase
            .from("friends")
            .select("friend_id, created_at")
            .eq("user_id", user_id);

        if (friendErr) {
            return res.status(400).json({ error: friendErr.message });
        }

        res.status(200).json(friendData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// DELETE /friends
// Body: { "user_id": "1", "friend_id": "2" }
router.delete("/", async (req, res) => {
    try {

        // Authenticate user (testing only)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'highskies8@gmail.com',
            password: 'Riggsbra000!'
        });

        const { user_id, friend_id } = req.body;

        if (!user_id || !friend_id) {
            return res.status(400).json({ error: "user_id and friend_id required" });
        }

        // Delete both directions
        const { data: friendData, error: friendErr } = await supabase
            .from("friends")
            .delete()
            .or(`and(user_id.eq.${user_id},friend_id.eq.${friend_id}),and(user_id.eq.${friend_id},friend_id.eq.${user_id})`);

        if (friendErr) {
            return res.status(400).json({ error: friendErr.message });
        }

        res.status(200).json({ message: "Friendship deleted successfully", deleted: friendData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
