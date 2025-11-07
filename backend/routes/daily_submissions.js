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

// Helper function to verify user is in group
async function verifyGroupMembership(userId, groupId) {
    const { data, error } = await supabaseAdmin
        .from("group_members")
        .select("id")
        .eq("user_id", userId)
        .eq("group_id", groupId)
        .maybeSingle();

    return !error && data !== null;
}

/**
 * SUBMIT a moment for a daily prompt
 * POST /api/daily_submissions
 * Body: { daily_id, moment_id, rating (optional) }
 */
router.post("/", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { daily_id, moment_id, rating } = req.body;

    if (!daily_id || !moment_id) {
        return res.status(400).json({ error: "daily_id and moment_id are required" });
    }

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    try {
        // Get the group_id from the daily
        const { data: daily, error: dailyError } = await supabaseAdmin
            .from("dailies")
            .select("group_id")
            .eq("id", daily_id)
            .single();

        if (dailyError || !daily) {
            return res.status(404).json({ error: "Daily not found" });
        }

        // Verify user is in the group
        const isMember = await verifyGroupMembership(user.id, daily.group_id);
        if (!isMember) {
            return res.status(403).json({ error: "You must be a member of this group to submit a moment" });
        }

        // Verify the moment exists and belongs to the user
        const { data: moment, error: momentError } = await supabaseAdmin
            .from("moments")
            .select("id")
            .eq("id", moment_id)
            .eq("user_id", user.id)
            .single();

        if (momentError || !moment) {
            return res.status(404).json({ error: "Moment not found or does not belong to you" });
        }

        // Insert or update the submission
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .upsert({
                daily_id,
                user_id: user.id,
                moment_id,
                rating: rating || null
            }, {
                onConflict: 'daily_id,user_id'
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ 
            message: "Moment submitted successfully",
            submission: data 
        });
    } catch (err) {
        console.error("Submit moment error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * UPDATE rating for a submitted moment
 * PUT /api/daily_submissions/:id/rating
 * Body: { rating }
 */
router.put("/:id/rating", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    const { rating } = req.body;
    const submissionId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "rating must be between 1 and 5" });
    }

    try {
        // Verify the submission belongs to the user
        const { data: existing, error: checkError } = await supabaseAdmin
            .from("daily_submissions")
            .select("id")
            .eq("id", submissionId)
            .eq("user_id", user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ error: "Submission not found or does not belong to you" });
        }

        // Update the rating
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .update({ rating })
            .eq("id", submissionId)
            .select()
            .single();

        if (error) throw error;

        res.json({ 
            message: "Rating updated successfully",
            submission: data 
        });
    } catch (err) {
        console.error("Update rating error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET all submissions for a daily prompt
 * GET /api/daily_submissions/daily/:daily_id
 */
router.get("/daily/:daily_id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        // Get the group_id from the daily
        const { data: daily, error: dailyError } = await supabaseAdmin
            .from("dailies")
            .select("group_id")
            .eq("id", req.params.daily_id)
            .single();

        if (dailyError || !daily) {
            return res.status(404).json({ error: "Daily not found" });
        }

        // Verify user is in the group
        const isMember = await verifyGroupMembership(user.id, daily.group_id);
        if (!isMember) {
            return res.status(403).json({ error: "You must be a member of this group to view submissions" });
        }

        // Get all submissions with user and moment details
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .select(`
                *,
                users!daily_submissions_user_id_fkey (
                    id,
                    username,
                    pfp_url
                ),
                moments!daily_submissions_moment_id_fkey (
                    id,
                    title,
                    song_url,
                    start_time,
                    duration,
                    cover_url,
                    description
                )
            `)
            .eq("daily_id", req.params.daily_id)
            .order("submitted_at", { ascending: false });

        if (error) throw error;

        res.json({ submissions: data || [] });
    } catch (err) {
        console.error("Get submissions error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET user's submission for a specific daily
 * GET /api/daily_submissions/daily/:daily_id/my-submission
 */
router.get("/daily/:daily_id/my-submission", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .select(`
                *,
                moments!daily_submissions_moment_id_fkey (
                    id,
                    title,
                    song_url,
                    start_time,
                    duration,
                    cover_url,
                    description
                )
            `)
            .eq("daily_id", req.params.daily_id)
            .eq("user_id", user.id)
            .maybeSingle();

        if (error) throw error;

        res.json({ submission: data });
    } catch (err) {
        console.error("Get my submission error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE a submission (remove moment from daily)
 * DELETE /api/daily_submissions/:id
 */
router.delete("/:id", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", user.id)
            .select()
            .single();

        if (error) throw error;

        res.json({ 
            message: "Submission deleted successfully",
            deleted: data 
        });
    } catch (err) {
        console.error("Delete submission error:", err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET all submissions by a user across all groups
 * GET /api/daily_submissions/user/me
 */
router.get("/user/me", async (req, res) => {
    const user = await verifyToken(req, res);
    if (!user) return;

    try {
        const { data, error } = await supabaseAdmin
            .from("daily_submissions")
            .select(`
                *,
                dailies!daily_submissions_daily_id_fkey (
                    id,
                    prompt,
                    date,
                    group_id,
                    groups!dailies_group_id_fkey (
                        id,
                        name
                    )
                ),
                moments!daily_submissions_moment_id_fkey (
                    id,
                    title,
                    song_url,
                    cover_url,
                    description
                )
            `)
            .eq("user_id", user.id)
            .order("submitted_at", { ascending: false });

        if (error) throw error;

        res.json({ submissions: data || [] });
    } catch (err) {
        console.error("Get user submissions error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;