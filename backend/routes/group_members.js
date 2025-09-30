
const express = require("express");
const router = express.Router();
const { supabase } = require("../constants/supabase"); // adjust path if needed


// CREATE - add user to a group
router.post("/", async (req, res) => {
    const { group_id, user_id } = req.body;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email: "highskies8@gmail.com",
        password: "Riggsbra000!", // replace with test password
    });

    const { data, error } = await supabase
        .from("group_members")
        .insert([{ group_id, user_id }])
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
});

// READ - get all group members or filter by group_id
router.get("/", async (req, res) => {
    const { group_id } = req.query;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email: "highskies8@gmail.com",
        password: "Riggsbra000!", // replace with test password
    });

    let query = supabase.from("group_members").select("*");

    if (group_id) query = query.eq("group_id", group_id);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// READ - get specific member by group_id and user_id
router.get("/:group_id/:user_id", async (req, res) => {
    const { group_id, user_id } = req.params;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email: "highskies8@gmail.com",
        password: "Riggsbra000!", // replace with test password
    });

    const { data, error } = await supabase
        .from("group_members")
        .select("*")
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .single();

    if (error) return res.status(404).json({ error: error.message });
    res.json(data);
});

// UPDATE - change group membership (rare, but possible)
// e.g. move a user to another group
router.put("/:group_id/:user_id", async (req, res) => {
    const { group_id, user_id } = req.params;
    const { new_group_id, new_user_id } = req.body;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email: "highskies8@gmail.com",
        password: "Riggsbra000!", // replace with test password
    });

    const { data, error } = await supabase
        .from("group_members")
        .update({
            group_id: new_group_id || group_id,
            user_id: new_user_id || user_id,
        })
        .eq("group_id", group_id)
        .eq("user_id", user_id)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

// DELETE - remove user from a group
router.delete("/:group_id/:user_id", async (req, res) => {
    const { group_id, user_id } = req.params;

    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
        email: "highskies8@gmail.com",
        password: "Riggsbra000!", // replace with test password
    });

    const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", group_id)
        .eq("user_id", user_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Member removed from group" });
});

module.exports = router;
