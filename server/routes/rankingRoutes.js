const express = require("express");
const db = require("../db.js");

const router = express.Router();

// Helper function to return fallback data on error
const returnFallbackData = (res, err, fallbackData = []) => {
  console.error("Database error:", err);
  return res.status(200).json(fallbackData); // Return fallback data instead of error to prevent UI issues
};

// Fetch all rankings (default to current week)
router.get("/rankings/fetch_rankings", (_req, res) => {
  console.log("Fetching all rankings");
  const query = `
    SELECT
      ur.user_id,
      ur.points,
      ur.level,
      ur.rank_title,
      ur.week_number,
      ur.year,
      ur.is_current,
      ur.created_at,
      ur.updated_at,
      u.first_name,
      u.last_name,
      u.username,
      u.profile_picture
    FROM user_rankings ur
    JOIN users u ON ur.user_id = u.user_id
    WHERE ur.is_current = true
    ORDER BY ur.points DESC
    LIMIT 20
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching rankings:", err);
      return returnFallbackData(res, err, []);
    }

    // If no results, try to get any rankings regardless of is_current flag
    if (results.length === 0) {
      const fallbackQuery = `
        SELECT
          ur.user_id,
          ur.points,
          ur.level,
          ur.rank_title,
          ur.week_number,
          ur.year,
          ur.is_current,
          ur.created_at,
          ur.updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        ORDER BY ur.points DESC
        LIMIT 20
      `;

      db.query(fallbackQuery, (fallbackErr, fallbackResults) => {
        if (fallbackErr) {
          console.log("Error fetching fallback rankings:", fallbackErr);
          return returnFallbackData(res, fallbackErr, []);
        }

        // Add rank position to each result
        const rankedResults = fallbackResults.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        res.json(rankedResults);
      });
      return;
    }

    // Add rank position to each result
    const rankedResults = results.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json(rankedResults);
  });
});

// Fetch rankings by period (weekly, monthly, all-time)
router.get("/rankings/fetch_rankings_by_period", (req, res) => {
  const { period } = req.query;
  console.log(`Fetching rankings by period: ${period}`);
  let query;

  switch (period) {
    case 'weekly':
      // Get current week rankings
      query = `
        SELECT
          ur.user_id,
          ur.points,
          ur.level,
          ur.rank_title,
          ur.week_number,
          ur.year,
          ur.is_current,
          ur.created_at,
          ur.updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        WHERE ur.week_number = WEEK(CURRENT_DATE)
        AND ur.year = YEAR(CURRENT_DATE)
        ORDER BY ur.points DESC
        LIMIT 20
      `;
      break;
    case 'monthly':
      // Get current month rankings
      query = `
        SELECT
          ur.user_id,
          SUM(ur.points) as points,
          MAX(ur.level) as level,
          MAX(ur.rank_title) as rank_title,
          MAX(ur.week_number) as week_number,
          ur.year,
          MAX(ur.is_current) as is_current,
          MAX(ur.created_at) as created_at,
          MAX(ur.updated_at) as updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        WHERE MONTH(ur.created_at) = MONTH(CURRENT_DATE)
        AND YEAR(ur.created_at) = YEAR(CURRENT_DATE)
        GROUP BY ur.user_id, ur.year, u.first_name, u.last_name, u.username, u.profile_picture
        ORDER BY points DESC
        LIMIT 20
      `;
      break;
    case 'alltime':
      // Get all-time rankings
      query = `
        SELECT
          ur.user_id,
          SUM(ur.points) as points,
          MAX(ur.level) as level,
          MAX(ur.rank_title) as rank_title,
          MAX(ur.week_number) as week_number,
          MAX(ur.year) as year,
          MAX(ur.is_current) as is_current,
          MAX(ur.created_at) as created_at,
          MAX(ur.updated_at) as updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        GROUP BY ur.user_id, u.first_name, u.last_name, u.username, u.profile_picture
        ORDER BY points DESC
        LIMIT 20
      `;
      break;
    default:
      // Default to weekly
      query = `
        SELECT
          ur.user_id,
          ur.points,
          ur.level,
          ur.rank_title,
          ur.week_number,
          ur.year,
          ur.is_current,
          ur.created_at,
          ur.updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        WHERE ur.week_number = WEEK(CURRENT_DATE)
        AND ur.year = YEAR(CURRENT_DATE)
        ORDER BY ur.points DESC
        LIMIT 20
      `;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.log(`Error fetching ${period} rankings:`, err);
      return returnFallbackData(res, err, []);
    }

    // If no results found, try a fallback query without date filters
    if (results.length === 0) {
      const fallbackQuery = `
        SELECT
          ur.user_id,
          ur.points,
          ur.level,
          ur.rank_title,
          ur.week_number,
          ur.year,
          ur.is_current,
          ur.created_at,
          ur.updated_at,
          u.first_name,
          u.last_name,
          u.username,
          u.profile_picture
        FROM user_rankings ur
        JOIN users u ON ur.user_id = u.user_id
        ORDER BY ur.points DESC
        LIMIT 20
      `;

      db.query(fallbackQuery, (fallbackErr, fallbackResults) => {
        if (fallbackErr) {
          console.log("Error fetching fallback rankings:", fallbackErr);
          return returnFallbackData(res, fallbackErr, []);
        }

        // Add rank position to each result
        const rankedResults = fallbackResults.map((user, index) => ({
          ...user,
          rank: index + 1
        }));

        res.json(rankedResults);
      });
      return;
    }

    // Add rank position to each result
    const rankedResults = results.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json(rankedResults);
  });
});

// Fetch user achievements
router.get("/rankings/fetch_user_achievements/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching achievements for user ID: ${userId}`);

  // This is a placeholder query - in a real app, you would have an achievements table
  // For now, we'll generate some achievements based on user data
  const query = `
    SELECT
      u.user_id,
      u.username,
      COALESCE(ur.points, 0) as points,
      COALESCE(ur.level, 1) as level,
      COALESCE(ur.rank_title, 'Beginner') as rank_title,
      COUNT(DISTINCT wl.log_id) as total_workouts,
      COUNT(DISTINCT DATE(wl.log_date)) as workout_days
    FROM users u
    LEFT JOIN user_rankings ur ON u.user_id = ur.user_id AND ur.is_current = true
    LEFT JOIN user_workout_logs wl ON u.user_id = wl.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id, u.username, ur.points, ur.level, ur.rank_title
  `;

  const defaultAchievements = ["FitFaat Member", "Fitness Enthusiast"];

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log("Error fetching user achievements:", err);
      // Return default achievements instead of error
      return returnFallbackData(res, err, defaultAchievements);
    }

    if (results.length === 0) {
      // Return default achievements for users with no data
      return res.json(defaultAchievements);
    }

    const userData = results[0];
    const achievements = [];

    // Generate achievements based on user data
    if (userData.total_workouts >= 10) {
      achievements.push("10+ Workouts Completed");
    }

    if (userData.workout_days >= 7) {
      achievements.push("7+ Days Active");
    }

    if (userData.level >= 3) {
      achievements.push("Reached Level 3+");
    }

    if (userData.points >= 500) {
      achievements.push("500+ Points Earned");
    }

    // Add rank-based achievements
    if (userData.rank_title) {
      achievements.push(`${userData.rank_title} Rank`);
    }

    // Add some default achievements if the list is empty
    if (achievements.length === 0) {
      if (userData.level === 1) {
        achievements.push("Fitness Journey Started");
      }
      achievements.push("FitFaat Member");
    }

    res.json(achievements);
  });
});

// Fetch user weekly progress
router.get("/rankings/fetch_user_progress/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching progress for user ID: ${userId}`);

  const query = `
    SELECT
      u.user_id,
      COALESCE(SUM(CASE
        WHEN wl.log_date >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
        THEN 1 ELSE 0 END), 0) as workouts_this_week,
      COALESCE(COUNT(DISTINCT wl.log_id), 0) as total_workouts,
      COALESCE(ur.points, 0) as points,
      COALESCE(ur.level, 1) as level
    FROM users u
    LEFT JOIN user_rankings ur ON u.user_id = ur.user_id AND ur.is_current = true
    LEFT JOIN user_workout_logs wl ON u.user_id = wl.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id, ur.points, ur.level
  `;

  const defaultProgress = { progress: 50, workouts_this_week: 0, total_workouts: 0 };

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log("Error fetching user progress:", err);
      // Return default progress instead of error
      return returnFallbackData(res, err, defaultProgress);
    }

    if (results.length === 0) {
      // Return default progress for users with no data
      return res.json(defaultProgress);
    }

    const userData = results[0];

    // Calculate progress percentage (this is a simplified example)
    // In a real app, you might have weekly goals and calculate progress against those
    let progressPercentage = 0;

    if (userData.workouts_this_week > 0) {
      // Assuming a goal of 5 workouts per week
      progressPercentage = Math.min(Math.round((userData.workouts_this_week / 5) * 100), 100);
    } else if (userData.points > 0) {
      // If no workouts this week but user has points, show some progress
      progressPercentage = Math.min(Math.round(userData.points / 10), 100);
    } else {
      // Default progress for new users
      progressPercentage = 25;
    }

    res.json({
      progress: progressPercentage,
      workouts_this_week: userData.workouts_this_week,
      total_workouts: userData.total_workouts
    });
  });
});

// Add direct routes to match the API paths used in the frontend
router.get("/fetch_rankings", (_req, res) => {
  // Redirect to the main endpoint
  res.redirect(307, '/api/rankings/rankings/fetch_rankings');
});

router.get("/fetch_rankings_by_period", (req, res) => {
  // Redirect to the main endpoint with query parameters
  const period = req.query.period || 'weekly';
  res.redirect(307, `/api/rankings/rankings/fetch_rankings_by_period?period=${period}`);
});

router.get("/fetch_user_achievements/:userId", (req, res) => {
  // Redirect to the main endpoint
  const userId = req.params.userId;
  res.redirect(307, `/api/rankings/rankings/fetch_user_achievements/${userId}`);
});

router.get("/fetch_user_progress/:userId", (req, res) => {
  // Redirect to the main endpoint
  const userId = req.params.userId;
  res.redirect(307, `/api/rankings/rankings/fetch_user_progress/${userId}`);
});

module.exports = router;