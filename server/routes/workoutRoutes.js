const express = require("express");
const db = require("../db.js");

const router = express.Router();

// Create a new workout plan
router.post("/create_workout_plan", (req, res) => {
  console.log("Creating workout plan:", req.body);

  const { name, description, goal_type, difficulty_level, duration_weeks, days_per_week, is_default } = req.body;

  const query = `
    INSERT INTO workout_plans (
      name, description, goal_type, difficulty_level,
      duration_weeks, days_per_week, is_default
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, description, goal_type, difficulty_level, duration_weeks, days_per_week, is_default || false],
    (err, result) => {
      if (err) {
        console.log("Error creating workout plan:", err);
        return res.status(500).json({ error: "Failed to create workout plan" });
      }

      console.log("Workout plan created successfully");
      res.status(201).json({
        success: true,
        workout_plan_id: result.insertId,
        message: "Workout plan created successfully"
      });
    }
  );
});

// Create user workout plan
router.post("/create_user_workout_plan", (req, res) => {
  console.log("Creating user workout plan:", req.body);

  const { user_id, workout_plan_id, start_date, end_date, is_active } = req.body;

  const query = `
    INSERT INTO user_workout_plans (
      user_id, workout_plan_id, start_date, end_date, is_active
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, workout_plan_id, start_date, end_date || null, is_active || true],
    (err, result) => {
      if (err) {
        console.log("Error creating user workout plan:", err);
        return res.status(500).json({ error: "Failed to create user workout plan" });
      }

      console.log("User workout plan created successfully");
      res.status(201).json({
        success: true,
        user_workout_plan_id: result.insertId,
        message: "User workout plan created successfully"
      });
    }
  );
});

// Add exercise to workout plan
router.post("/add_exercise_to_plan", (req, res) => {
  console.log("Adding exercise to workout plan:", req.body);

  const { workout_plan_id, exercise_id, sets, reps, duration, day_of_week } = req.body;

  const query = `
    INSERT INTO workout_plan_exercises (
      workout_plan_id, exercise_id, sets, reps, duration, day_of_week
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [workout_plan_id, exercise_id, sets, reps, duration, day_of_week],
    (err, result) => {
      if (err) {
        console.log("Error adding exercise to workout plan:", err);
        return res.status(500).json({ error: "Failed to add exercise to workout plan" });
      }

      console.log("Exercise added to workout plan successfully");
      res.status(201).json({
        success: true,
        workout_plan_exercise_id: result.insertId,
        message: "Exercise added to workout plan successfully"
      });
    }
  );
});

// Log a workout
router.post("/log_workout", (req, res) => {
  console.log("Logging workout:", req.body);

  const { user_id, exercise_id, log_date, is_completed, calories_burned, notes, rating } = req.body;

  const query = `
    INSERT INTO user_workout_logs (
      user_id, exercise_id, log_date, is_completed,
      calories_burned, notes, rating
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [user_id, exercise_id, log_date, is_completed || false, calories_burned || 0, notes || "", rating || 0],
    (err, result) => {
      if (err) {
        console.log("Error logging workout:", err);
        return res.status(500).json({ error: "Failed to log workout" });
      }

      console.log("Workout logged successfully");
      res.status(201).json({
        success: true,
        log_id: result.insertId,
        message: "Workout logged successfully"
      });
    }
  );
});

// Reset workout logs for a user
router.delete("/reset_workout_logs/:userId", (req, res) => {
  const userId = req.params.userId;

  // Delete all workout logs for this user
  const deleteLogsQuery = `
    DELETE FROM user_workout_logs
    WHERE user_id = ?
  `;

  db.query(deleteLogsQuery, [userId], (err, result) => {
    if (err) {
      console.log("Error resetting workout logs:", err);
      return res.status(500).json({ error: "Failed to reset workout logs" });
    }

    console.log(`Deleted ${result.affectedRows} workout logs for user ${userId}`);
    res.json({
      success: true,
      message: "Workout logs reset successfully",
      logs_deleted: result.affectedRows
    });
  });
});

// Fetch user workout logs
router.get("/fetch_user_workout_logs", (req, res) => {
  const userId = req.query.user_id;
  console.log(`Fetching workout logs for user ID: ${userId}`);

  const query = `
    SELECT uwl.*, e.name as exercise_name
    FROM user_workout_logs uwl
    JOIN exercises e ON uwl.exercise_id = e.exercise_id
    WHERE uwl.user_id = ?
    ORDER BY uwl.log_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log(`Error fetching workout logs for user ${userId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log(`Returning ${results.length} workout logs for user ${userId}`);
    res.json(results);
  });
});

// Fetch user workout plans
router.get("/fetch_user_workout_plans", (req, res) => {
  const userId = req.query.user_id;
  console.log(`Fetching workout plans for user ID: ${userId}`);

  const query = `
    SELECT uwp.*, wp.*
    FROM user_workout_plans uwp
    JOIN workout_plans wp ON uwp.workout_plan_id = wp.workout_plan_id
    WHERE uwp.user_id = ?
    ORDER BY uwp.is_active DESC, uwp.start_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log(`Error fetching workout plans for user ${userId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log(`Returning ${results.length} workout plans for user ${userId}`);
    res.json(results);
  });
});

// Complete a workout log
router.put("/complete_workout_log/:logId", (req, res) => {
  const logId = req.params.logId;
  const { calories_burned, notes, rating } = req.body;

  console.log(`Marking workout log ${logId} as completed:`, req.body);

  const query = `
    UPDATE user_workout_logs
    SET is_completed = true,
        calories_burned = ?,
        notes = ?,
        rating = ?
    WHERE log_id = ?
  `;

  db.query(
    query,
    [calories_burned || 0, notes || "", rating || 0, logId],
    (err, result) => {
      if (err) {
        console.log(`Error completing workout log ${logId}:`, err);
        return res.status(500).json({ error: "Failed to complete workout log" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Workout log not found" });
      }

      console.log(`Workout log ${logId} marked as completed`);
      res.json({ success: true, message: "Workout log completed successfully" });
    }
  );
});

// Fetch user rankings
router.get("/fetch_user_rankings/:userId", (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT * FROM user_rankings
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log("Error fetching user rankings:", err);
      return res.status(500).json({ error: "Failed to fetch user rankings" });
    }

    if (results.length === 0) {
      return res.json({
        points: 0,
        level: 1,
        rank_title: 'Rookie'
      });
    }

    res.json(results[0]);
  });
});

// Update user rankings
router.post("/update_user_rankings", (req, res) => {
  console.log("Updating user rankings:", req.body);

  const { user_id, points, level, rank_title } = req.body;

  // First check if user already has a ranking
  const checkQuery = `
    SELECT ranking_id FROM user_rankings
    WHERE user_id = ?
  `;

  db.query(checkQuery, [user_id], (err, results) => {
    if (err) {
      console.log("Error checking user rankings:", err);
      return res.status(500).json({ error: "Failed to check user rankings" });
    }

    if (results.length > 0) {
      // Calculate level based on specific point thresholds
      let level;
      if (points < 100) level = 1;
      else if (points < 300) level = 2;
      else if (points < 500) level = 3;
      else if (points < 800) level = 4;
      else if (points < 1200) level = 5;
      else if (points < 1800) level = 6;
      else if (points < 2500) level = 7;
      else if (points < 3500) level = 8;
      else if (points < 5000) level = 9;
      else level = 10;

      // Update existing ranking
      const updateQuery = `
        UPDATE user_rankings
        SET points = ?,
            level = ?,
            rank_title = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `;

      // Determine rank based on level
      let calculatedRank;
      if (level === 1) calculatedRank = 'Rookie';
      else if (level <= 3) calculatedRank = 'Contender';
      else if (level <= 5) calculatedRank = 'Challenger';
      else if (level <= 7) calculatedRank = 'Veteran';
      else calculatedRank = 'Overachiever';

      db.query(updateQuery, [points, level, calculatedRank, user_id], (err, result) => {
        if (err) {
          console.log("Error updating user rankings:", err);
          return res.status(500).json({ error: "Failed to update user rankings" });
        }

        console.log("User rankings updated successfully");
        res.json({
          success: true,
          message: "User rankings updated successfully"
        });
      });
    } else {
      // Calculate level based on specific point thresholds
      let level;
      if (points < 100) level = 1;
      else if (points < 300) level = 2;
      else if (points < 500) level = 3;
      else if (points < 800) level = 4;
      else if (points < 1200) level = 5;
      else if (points < 1800) level = 6;
      else if (points < 2500) level = 7;
      else if (points < 3500) level = 8;
      else if (points < 5000) level = 9;
      else level = 10;

      // Determine rank based on level
      let calculatedRank;
      if (level === 1) calculatedRank = 'Rookie';
      else if (level <= 3) calculatedRank = 'Contender';
      else if (level <= 5) calculatedRank = 'Challenger';
      else if (level <= 7) calculatedRank = 'Veteran';
      else calculatedRank = 'Overachiever';

      // Create new ranking
      const insertQuery = `
        INSERT INTO user_rankings (
          user_id, points, level, rank_title, week_number, year, is_current
        )
        VALUES (?, ?, ?, ?, WEEK(CURRENT_DATE), YEAR(CURRENT_DATE), true)
      `;

      db.query(insertQuery, [user_id, points, level, calculatedRank], (err, result) => {
        if (err) {
          console.log("Error creating user rankings:", err);
          return res.status(500).json({ error: "Failed to create user rankings" });
        }

        console.log("User rankings created successfully");
        res.status(201).json({
          success: true,
          ranking_id: result.insertId,
          message: "User rankings created successfully"
        });
      });
    }
  });
});

// Fetch exercises for a specific workout plan
router.get("/fetch_workout_plan_exercises/:workoutPlanId", (req, res) => {
  const workoutPlanId = req.params.workoutPlanId;
  console.log(`Fetching exercises for workout plan ID: ${workoutPlanId}`);

  const query = `
    SELECT wpe.*, e.name, e.description, e.category_id, e.difficulty_level,
           e.equipment_needed, e.muscle_group, e.video_tutorial_url, e.image_url,
           ec.name as category_name
    FROM workout_plan_exercises wpe
    JOIN exercises e ON wpe.exercise_id = e.exercise_id
    LEFT JOIN exercise_categories ec ON e.category_id = ec.category_id
    WHERE wpe.workout_plan_id = ?
    ORDER BY FIELD(wpe.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
  `;

  db.query(query, [workoutPlanId], (err, results) => {
    if (err) {
      console.log(`Error fetching exercises for workout plan ${workoutPlanId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log(`Returning ${results.length} exercises for workout plan ${workoutPlanId}`);
    res.json(results);
  });
});

// Create a new workout goal (always creates a new entry)
router.post("/create_workout_goal", (req, res) => {
  console.log("Creating new workout goal:", req.body);

  const { user_id, goal_type, title, description, start_date, target_date, status } = req.body;

  // Create new goal
  const insertQuery = `
    INSERT INTO user_goals (
      user_id, goal_type, title, description, start_date, target_date, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(insertQuery, [
    user_id,
    goal_type,
    title,
    description,
    start_date || new Date().toISOString().split('T')[0],
    target_date || null,
    status || 'Not In Use'
  ], (err, result) => {
    if (err) {
      console.log("Error creating workout goal:", err);
      return res.status(500).json({ error: "Failed to create workout goal" });
    }

    console.log("New workout goal created successfully");
    res.status(201).json({
      success: true,
      goal_id: result.insertId,
      message: "Workout goal created successfully"
    });
  });
});

// Save user workout goal (updates existing or creates new if not found)
router.post("/save_workout_goal", (req, res) => {
  console.log("Saving workout goal:", req.body);

  const { user_id, goal_type, title, description, start_date, target_date, status } = req.body;

  if (req.body.goal_id) {
    // If goal_id is provided, update that specific goal
    const updateQuery = `
      UPDATE user_goals
      SET title = ?,
          description = ?,
          target_date = ?,
          updated_at = NOW(),
          status = ?
      WHERE goal_id = ?
    `;

    db.query(updateQuery, [
      title,
      description,
      target_date || null,
      status || 'In Progress',
      req.body.goal_id
    ], (err, result) => {
      if (err) {
        console.log("Error updating workout goal:", err);
        return res.status(500).json({ error: "Failed to update workout goal" });
      }

      console.log("Workout goal updated successfully");
      res.json({
        success: true,
        goal_id: req.body.goal_id,
        message: "Workout goal updated successfully"
      });
    });
  } else {
    // First check if the user already has a goal of this type
    const checkQuery = `
      SELECT goal_id FROM user_goals
      WHERE user_id = ? AND goal_type = ? AND status <> 'Completed'
    `;

    db.query(checkQuery, [user_id, goal_type], (err, results) => {
      if (err) {
        console.log("Error checking existing goals:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
        // Update existing goal if no goal_id was provided but one exists
        const updateQuery = `
          UPDATE user_goals
          SET title = ?,
              description = ?,
              target_date = ?,
              updated_at = NOW(),
              status = ?
          WHERE goal_id = ?
        `;

        db.query(updateQuery, [
          title,
          description,
          target_date || null,
          status || 'In Progress',
          results[0].goal_id
        ], (err, result) => {
          if (err) {
            console.log("Error updating workout goal:", err);
            return res.status(500).json({ error: "Failed to update workout goal" });
          }

          console.log("Workout goal updated successfully");
          res.json({
            success: true,
            goal_id: results[0].goal_id,
            message: "Workout goal updated successfully"
          });
        });
      } else {
        // Create new goal
        const insertQuery = `
          INSERT INTO user_goals (
            user_id, goal_type, title, description, start_date, target_date, status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
          user_id,
          goal_type,
          title,
          description,
          start_date || new Date().toISOString().split('T')[0],
          target_date || null,
          status || 'In Progress'
        ], (err, result) => {
          if (err) {
            console.log("Error creating workout goal:", err);
            return res.status(500).json({ error: "Failed to create workout goal" });
          }

          console.log("Workout goal created successfully");
          res.status(201).json({
            success: true,
            goal_id: result.insertId,
            message: "Workout goal created successfully"
          });
        });
      }
    });
  }
});

// Fetch user workout goals
router.get("/fetch_workout_goals", (req, res) => {
  const userId = req.query.user_id;
  console.log(`Fetching workout goals for user ID: ${userId}`);

  const query = `
    SELECT * FROM user_goals
    WHERE user_id = ? AND goal_type = 'Workout'
    ORDER BY start_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.log(`Error fetching workout goals for user ${userId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log(`Returning ${results.length} workout goals for user ${userId}`);
    res.json(results);
  });
});

// Fetch all workout plans
router.get("/fetch_all_workout_plans", (_, res) => {
  console.log("Fetching all workout plans");

  const query = `
    SELECT * FROM workout_plans
    ORDER BY name ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching workout plans:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    console.log(`Returning ${results.length} workout plans`);
    res.json(results);
  });
});

// Update user's active workout plan
router.post("/update_user_active_plan", (req, res) => {
  console.log("Updating user's active workout plan:", req.body);

  const { user_id, workout_plan_id } = req.body;

  if (!user_id || !workout_plan_id) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // First, set all existing plans for this user to inactive
  const deactivateQuery = `
    UPDATE user_workout_plans
    SET is_active = false
    WHERE user_id = ?
  `;

  db.query(deactivateQuery, [user_id], (err) => {
    if (err) {
      console.log("Error deactivating existing workout plans:", err);
      return res.status(500).json({ error: "Failed to update workout plan" });
    }

    // Check if the user already has this workout plan
    const checkQuery = `
      SELECT user_workout_plan_id FROM user_workout_plans
      WHERE user_id = ? AND workout_plan_id = ?
    `;

    db.query(checkQuery, [user_id, workout_plan_id], (err, results) => {
      if (err) {
        console.log("Error checking existing workout plan:", err);
        return res.status(500).json({ error: "Failed to update workout plan" });
      }

      if (results.length > 0) {
        // Update existing plan to active
        const updateQuery = `
          UPDATE user_workout_plans
          SET is_active = true, start_date = CURRENT_DATE()
          WHERE user_workout_plan_id = ?
        `;

        db.query(updateQuery, [results[0].user_workout_plan_id], (err, updateResult) => {
          if (err) {
            console.log("Error updating existing workout plan:", err);
            return res.status(500).json({ error: "Failed to update workout plan" });
          }

          console.log("Existing workout plan updated successfully");
          res.json({
            success: true,
            user_workout_plan_id: results[0].user_workout_plan_id,
            message: "Workout plan updated successfully"
          });
        });
      } else {
        // Create new user workout plan
        const insertQuery = `
          INSERT INTO user_workout_plans (
            user_id, workout_plan_id, start_date, is_active
          )
          VALUES (?, ?, CURRENT_DATE(), true)
        `;

        db.query(insertQuery, [user_id, workout_plan_id], (err, insertResult) => {
          if (err) {
            console.log("Error creating new workout plan:", err);
            return res.status(500).json({ error: "Failed to create workout plan" });
          }

          console.log("New workout plan created successfully");
          res.status(201).json({
            success: true,
            user_workout_plan_id: insertResult.insertId,
            message: "Workout plan created successfully"
          });
        });
      }
    });
  });
});

// Activate a routine
router.post("/activate_routine", (req, res) => {
  console.log("Activating routine:", req.body);

  const { routine_id, user_id } = req.body;

  if (!routine_id || !user_id) {
    return res.status(400).json({ error: "Both routine_id and user_id are required" });
  }

  // Start a transaction to ensure all updates are atomic
  db.beginTransaction(err => {
    if (err) {
      console.log("Error starting transaction:", err);
      return res.status(500).json({ error: "Failed to activate routine" });
    }

    // First, deactivate all routines for this user
    const deactivateQuery = `
      UPDATE routines
      SET is_active = 0
      WHERE user_id = ?
    `;

    db.query(deactivateQuery, [user_id], (err, result) => {
      if (err) {
        console.log("Error deactivating routines:", err);
        return db.rollback(() => {
          res.status(500).json({ error: "Failed to deactivate other routines" });
        });
      }

      console.log(`Deactivated ${result.affectedRows} routines for user ${user_id}`);

      // Then, activate the specified routine
      const activateQuery = `
        UPDATE routines
        SET is_active = 1
        WHERE routine_id = ? AND user_id = ?
      `;

      db.query(activateQuery, [routine_id, user_id], (err, result) => {
        if (err) {
          console.log("Error activating routine:", err);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to activate routine" });
          });
        }

        if (result.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ error: "Routine not found" });
          });
        }

        // Commit the transaction
        db.commit(err => {
          if (err) {
            console.log("Error committing transaction:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to activate routine" });
            });
          }

          console.log(`Activated routine ${routine_id} for user ${user_id}`);
          res.json({
            success: true,
            message: "Routine activated successfully"
          });
        });
      });
    });
  });
});

// Update goal status (keeping for backward compatibility)
router.post("/update_goal_status", (req, res) => {
  console.log("Updating goal status:", req.body);

  // We can update a specific goal by goal_id, or all goals of a certain type for a user
  const { goal_id, user_id, goal_type, status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required" });
  }

  let query;
  let params;

  if (goal_id) {
    // Update a specific goal
    query = `
      UPDATE user_goals
      SET status = ?,
          updated_at = NOW()
      WHERE goal_id = ?
    `;
    params = [status, goal_id];
  } else if (user_id && goal_type) {
    // Update all goals of a certain type for a user
    query = `
      UPDATE user_goals
      SET status = ?,
          updated_at = NOW()
      WHERE user_id = ? AND goal_type = ?
    `;
    params = [status, user_id, goal_type];
  } else {
    return res.status(400).json({ error: "Either goal_id or both user_id and goal_type are required" });
  }

  db.query(query, params, (err, result) => {
    if (err) {
      console.log("Error updating goal status:", err);
      return res.status(500).json({ error: "Failed to update goal status" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "No goals found matching the criteria" });
    }

    console.log(`Updated ${result.affectedRows} goal(s) to status: ${status}`);
    res.json({
      success: true,
      message: `Updated ${result.affectedRows} goal(s) to status: ${status}`,
      affected_rows: result.affectedRows
    });
  });
});

// Fetch available goal types for routines
router.get("/fetch_goal_types", (_, res) => {
  console.log("Fetching available goal types");

  const query = `
    SELECT DISTINCT goal_type FROM workout_plans
    ORDER BY goal_type ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.log("Error fetching goal types:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Extract goal types from results
    const goalTypes = results.map(result => result.goal_type);

    console.log(`Returning ${goalTypes.length} goal types:`, goalTypes);
    res.json(goalTypes);
  });
});

// Save routine to routines table
router.post("/save_routine", (req, res) => {
  console.log("Saving routine to routines table:", req.body);

  const { user_id, title, goal_type, target_date, status, exercises } = req.body;

  if (!user_id || !exercises || !Array.isArray(exercises)) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Validate goal_type against allowed values
  const allowedGoalTypes = ['Weight Loss', 'Muscle Building', 'Endurance', 'Flexibility', 'General Fitness'];
  const validGoalType = allowedGoalTypes.includes(goal_type) ? goal_type : 'General Fitness';

  // Limit to 5 exercises
  const limitedExercises = exercises.slice(0, 5);

  // Start a transaction to ensure all updates are atomic
  db.beginTransaction(err => {
    if (err) {
      console.log("Error starting transaction:", err);
      return res.status(500).json({ error: "Failed to save routine" });
    }

    // If setting as active, first deactivate all other routines for this user
    if (status === 'Active') {
      const deactivateQuery = `
        UPDATE routines
        SET is_active = 0
        WHERE user_id = ?
      `;

      db.query(deactivateQuery, [user_id], (err, result) => {
        if (err) {
          console.log("Error deactivating routines:", err);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to deactivate other routines" });
          });
        }

        console.log(`Deactivated ${result.affectedRows} routines for user ${user_id}`);

        // Continue with saving the new routine
        saveNewRoutine();
      });
    } else {
      // If not setting as active, just save the new routine
      saveNewRoutine();
    }

    // Function to save the new routine
    function saveNewRoutine() {
      // Prepare the query with dynamic parameters based on number of exercises
      let query = `
        INSERT INTO routines (
          user_id, title, goal_type, target_date, is_active
      `;

      // Add id_X and id_X_desc fields based on number of exercises
      for (let i = 1; i <= limitedExercises.length; i++) {
        query += `, id_${i}, id_${i}_desc`;
      }

      query += `) VALUES (?, ?, ?, ?, ?`;

      // Add placeholders for id_X and id_X_desc values
      for (let i = 1; i <= limitedExercises.length; i++) {
        query += `, ?, ?`;
      }

      query += `)`;

      // Prepare parameters array
      const params = [
        user_id,
        title || 'My Routine',
        validGoalType,
        target_date || null,
        status === 'Active' ? 1 : 0
      ];

      // Add exercise IDs and descriptions to parameters
      for (let i = 0; i < limitedExercises.length; i++) {
        const exercise = limitedExercises[i];
        params.push(exercise.exercise_id);

        // Create a description with sets, reps, and duration if available
        const description = JSON.stringify({
          sets: exercise.sets || 3,
          reps: exercise.reps || '8-12',
          duration: exercise.duration || '30 sec'
        });

        params.push(description);
      }

      console.log("Executing query with params:", params);

      // Execute the query
      db.query(query, params, (err, result) => {
        if (err) {
          console.log("Error saving routine:", err);
          return db.rollback(() => {
            res.status(500).json({ error: "Failed to save routine: " + err.message });
          });
        }

        // Commit the transaction
        db.commit(err => {
          if (err) {
            console.log("Error committing transaction:", err);
            return db.rollback(() => {
              res.status(500).json({ error: "Failed to save routine" });
            });
          }

          console.log("Routine saved successfully");
          res.status(201).json({
            success: true,
            routine_id: result.insertId,
            message: "Routine saved successfully"
          });
        });
      });
    }
  });
});

// Fetch user routines from routines table
router.get("/fetch_user_routines/:userId", (req, res) => {
  const userId = req.params.userId;
  console.log(`Fetching routines for user ID: ${userId}`);

  // First, get all routines for this user
  const routinesQuery = `
    SELECT
      r.routine_id,
      r.user_id,
      r.title,
      r.goal_type,
      r.target_date,
      r.is_active,
      r.created_at,
      r.id_1, r.id_1_desc,
      r.id_2, r.id_2_desc,
      r.id_3, r.id_3_desc,
      r.id_4, r.id_4_desc,
      r.id_5, r.id_5_desc
    FROM routines r
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(routinesQuery, [userId], (err, routines) => {
    if (err) {
      console.log(`Error fetching routines for user ${userId}:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (routines.length === 0) {
      console.log(`No routines found for user ${userId}`);
      return res.json([]);
    }

    // Get all exercise IDs from all routines
    const exerciseIds = new Set();
    routines.forEach(routine => {
      for (let i = 1; i <= 5; i++) {
        const exerciseId = routine[`id_${i}`];
        if (exerciseId) {
          exerciseIds.add(exerciseId);
        }
      }
    });

    // If no exercise IDs found, return the routines as is
    if (exerciseIds.size === 0) {
      const formattedResults = routines.map(routine => ({
        goal_id: routine.routine_id,
        routine_id: routine.routine_id,
        user_id: routine.user_id,
        title: routine.title,
        goal_type: routine.goal_type,
        target_date: routine.target_date,
        status: routine.is_active === 1 ? 'Active' : 'Not In Use',
        created_at: routine.created_at,
        exercise_count: 0,
        description: '[]'
      }));

      console.log(`Returning ${formattedResults.length} routines for user ${userId} (no exercises)`);
      return res.json(formattedResults);
    }

    // Fetch details for all exercise IDs
    const exerciseIdsArray = Array.from(exerciseIds);
    const placeholders = exerciseIdsArray.map(() => '?').join(',');

    const exercisesQuery = `
      SELECT
        e.exercise_id,
        e.name,
        e.description,
        e.difficulty_level,
        e.equipment_needed,
        e.muscle_group,
        ec.name as category_name
      FROM exercises e
      LEFT JOIN exercise_categories ec ON e.category_id = ec.category_id
      WHERE e.exercise_id IN (${placeholders})
    `;

    db.query(exercisesQuery, exerciseIdsArray, (err, exercises) => {
      if (err) {
        console.log(`Error fetching exercise details:`, err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Create a map of exercise details by ID for quick lookup
      const exerciseMap = {};
      exercises.forEach(exercise => {
        exerciseMap[exercise.exercise_id] = exercise;
      });

      // Process the results to format the exercises
      const formattedResults = routines.map(routine => {
        try {
          // Create an array to hold exercise details
          const exerciseDetails = [];
          const exerciseNames = [];

          // Add exercises from id_1 to id_5 if they exist
          for (let i = 1; i <= 5; i++) {
            const exerciseId = routine[`id_${i}`];
            const exerciseDesc = routine[`id_${i}_desc`];

            if (exerciseId && exerciseMap[exerciseId]) {
              const exercise = exerciseMap[exerciseId];
              exerciseNames.push(exercise.name);

              // Parse the JSON description if it exists
              let exerciseSettings = {};
              try {
                if (exerciseDesc) {
                  exerciseSettings = JSON.parse(exerciseDesc);
                }
              } catch (e) {
                console.error(`Error parsing exercise description for ID ${exerciseId}:`, e);
              }

              // Combine exercise details with settings
              exerciseDetails.push({
                exercise_id: exerciseId,
                name: exercise.name,
                description: exercise.description,
                difficulty_level: exercise.difficulty_level,
                equipment_needed: exercise.equipment_needed,
                muscle_group: exercise.muscle_group,
                category_name: exercise.category_name,
                sets: exerciseSettings.sets || 3,
                reps: exerciseSettings.reps || '8-12',
                duration: exerciseSettings.duration || '30 sec'
              });
            }
          }

          // Count non-null exercise IDs that have valid exercise details
          const exerciseCount = exerciseDetails.length;

          // Format the result
          return {
            goal_id: routine.routine_id, // Use routine_id as goal_id for compatibility
            routine_id: routine.routine_id,
            user_id: routine.user_id,
            title: routine.title,
            goal_type: routine.goal_type,
            target_date: routine.target_date,
            status: routine.is_active === 1 ? 'Active' : 'Not In Use',
            created_at: routine.created_at,
            exercise_count: exerciseCount,
            description: JSON.stringify(exerciseDetails), // Store exercises as JSON string in description
            exercise_names: exerciseNames.join(', ')
          };
        } catch (e) {
          console.error("Error processing routine:", e);
          return routine;
        }
      });

      console.log(`Returning ${formattedResults.length} routines for user ${userId}`);
      res.json(formattedResults);
    });
  });
});

// Update an existing routine
router.post("/update_routine", (req, res) => {
  console.log("Updating routine:", req.body);

  const { routine_id, user_id, title, goal_type, target_date } = req.body;

  if (!routine_id || !user_id) {
    return res.status(400).json({ error: "Both routine_id and user_id are required" });
  }

  // Validate goal_type against allowed values
  const allowedGoalTypes = ['Weight Loss', 'Muscle Building', 'Endurance', 'Flexibility', 'General Fitness'];
  const validGoalType = allowedGoalTypes.includes(goal_type) ? goal_type : 'General Fitness';

  // Update the routine
  const query = `
    UPDATE routines
    SET title = ?,
        goal_type = ?,
        target_date = ?
    WHERE routine_id = ? AND user_id = ?
  `;

  db.query(
    query,
    [
      title || 'My Routine',
      validGoalType,
      target_date || null,
      routine_id,
      user_id
    ],
    (err, result) => {
      if (err) {
        console.log("Error updating routine:", err);
        return res.status(500).json({ error: "Failed to update routine: " + err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Routine not found" });
      }

      console.log(`Updated routine ${routine_id} for user ${user_id}`);
      res.json({
        success: true,
        message: "Routine updated successfully"
      });
    }
  );
});

// Delete a routine
router.delete("/delete_routine/:routineId/:userId", (req, res) => {
  const routineId = req.params.routineId;
  const userId = req.params.userId;

  console.log(`Deleting routine ${routineId} for user ${userId}`);

  // Delete the routine
  const query = `
    DELETE FROM routines
    WHERE routine_id = ? AND user_id = ?
  `;

  db.query(query, [routineId, userId], (err, result) => {
    if (err) {
      console.log("Error deleting routine:", err);
      return res.status(500).json({ error: "Failed to delete routine: " + err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Routine not found or you don't have permission to delete it" });
    }

    console.log(`Deleted routine ${routineId} for user ${userId}`);
    res.json({
      success: true,
      message: "Routine deleted successfully"
    });
  });
});

module.exports = router;