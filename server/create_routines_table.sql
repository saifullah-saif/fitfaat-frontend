-- Create routines table
CREATE TABLE IF NOT EXISTS routines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  routine_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  title VARCHAR(100) NOT NULL DEFAULT 'My Routine',
  goal_type VARCHAR(50) NOT NULL DEFAULT 'General Fitness',
  target_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'Not In Use',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE,
  INDEX idx_routines_routine_id (routine_id),
  INDEX idx_routines_user_id (user_id)
);
