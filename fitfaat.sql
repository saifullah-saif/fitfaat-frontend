-- Users and Authentication
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  date_of_birth DATE,
  gender ENUM('Male', 'Female'),
  profile_picture VARCHAR(255),
  bio VARCHAR(100),
  location VARCHAR(100),
  role ENUM('User', 'Admin') DEFAULT 'User',
  interests VARCHAR(255),
  quiz_status ENUM('Taken', 'Pending') DEFAULT 'Pending'
);

-- User Health Profiles
CREATE TABLE health_profiles (
  health_profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  height DECIMAL(5,2), -- in cm
  weight DECIMAL(5,2), -- in kg
  target_weight DECIMAL(5,2), -- in kg
  activity_level ENUM('Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'),
  goal_type ENUM('Weight Loss', 'Weight Gain', 'Maintenance', 'Muscle Building', 'Overall Fitness'),
  daily_calorie_target INT,
  dietary_preferences ENUM('Vegan', 'Vegeterian', 'Mixed', 'Non-Veg'),
  allergies VARCHAR(255),
  medical_conditions VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Diet Plans and Food Tracking
CREATE TABLE meal_types (
  meal_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE food_items (
  food_id INT AUTO_INCREMENT PRIMARY KEY,
  meal_type_id INT NOT NULL ,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  calories_per_100g DECIMAL(6,2) NOT NULL,
  protein_per_100g DECIMAL(6,2),
  carbs_per_100g DECIMAL(6,2),
  fat_per_100g DECIMAL(6,2),
  fiber_per_100g DECIMAL(6,2),
  sugar_per_100g DECIMAL(6,2),
  serving_size DECIMAL(6,2),
  serving_unit VARCHAR(20),
  food_category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meal_type_id) REFERENCES meal_types(meal_type_id) ON DELETE CASCADE
);

CREATE TABLE diet_plans (
  diet_plan_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  daily_calorie_range VARCHAR(20),
  plan_type VARCHAR(11) CHECK (plan_type IN ('Weight Loss', 'Weight Gain', 'Maintenance', 'Custom')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_diet_plans (
  user_diet_plan_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  diet_plan_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(diet_plan_id) ON DELETE CASCADE
);

CREATE TABLE planned_meals (
  planned_meal_id INT AUTO_INCREMENT PRIMARY KEY,
  user_diet_plan_id INT NOT NULL,
  meal_type_id INT NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_diet_plan_id) REFERENCES user_diet_plans(user_diet_plan_id) ON DELETE CASCADE,
  FOREIGN KEY (meal_type_id) REFERENCES meal_types(meal_type_id) ON DELETE CASCADE
);

-- Workout Plans and Tracking
CREATE TABLE exercise_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE exercises (
  exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  difficulty_level VARCHAR(12) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  equipment_needed TEXT,
  muscle_group VARCHAR(100),
  video_tutorial_url VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES exercise_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE workout_plans (
  workout_plan_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  goal_type VARCHAR(16) CHECK (goal_type IN ('Weight Loss', 'Muscle Building', 'Endurance', 'Flexibility', 'General Fitness')),
  difficulty_level VARCHAR(12) CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration_weeks INTEGER,
  days_per_week INTEGER,
  is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE user_workout_plans (
  user_workout_plan_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id),
  workout_plan_id INT NOT NULL REFERENCES workout_plans(workout_plan_id),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (workout_plan_id)  REFERENCES workout_plans(workout_plan_id) ON DELETE CASCADE
);

CREATE TABLE user_workout_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  log_date DATE NOT NULL,
  is_completed BOOLEAN,
  calories_burned INTEGER,
  notes TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id)  REFERENCES exercises(exercise_id) ON DELETE CASCADE

);

-- Add junction table for workout plans and exercises
CREATE TABLE workout_plan_exercises (
  workout_plan_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  workout_plan_id INT NOT NULL,
  exercise_id INT NOT NULL,
  sets INT NOT NULL DEFAULT 3,
  reps VARCHAR(10) NOT NULL DEFAULT '8-12',
  duration VARCHAR(10),
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(workout_plan_id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE
);

-- Goals and Progress Tracking
CREATE TABLE user_goals (
  goal_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  goal_type ENUM('Weight', 'Body Measurements', 'Workout', 'Dietary', 'Custom'),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  target_value DECIMAL(8,2),
  unit VARCHAR(20),
  start_date DATE NOT NULL,
  target_date DATE,
  status ENUM('Not Started', 'In Progress', 'Completed', 'Abandoned') DEFAULT 'Not Started',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE user_measurements (
  measurement_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  measurement_date DATE NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass DECIMAL(5,2),
  bmi DECIMAL(4,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Community and Social Features
CREATE TABLE fitness_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  creator_user_id INT NOT NULL,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE group_members (
  group_member_id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role ENUM('Member', 'Moderator', 'Admin') DEFAULT 'Member',
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Approved', 'Rejected', 'Banned') DEFAULT 'Pending',
  UNIQUE (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES fitness_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  group_id INT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_pinned BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (group_id) REFERENCES fitness_groups(group_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_mod ENUM('Approved', 'Rejected') DEFAULT 'Approved';
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_mod ENUM('Approved', 'Rejected') DEFAULT 'Approved';
  UNIQUE (user_id, post_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE user_connections (
  connection_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,               
  connected_user_id INT NOT NULL,    
  user_a INT NOT NULL,               
  user_b INT NOT NULL,               
  status ENUM('Pending', 'Accepted', 'Rejected', 'Blocked') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (connected_user_id) REFERENCES users(user_id) ON DELETE CASCADE
  );

CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
  
);

-- User rankings
CREATE TABLE user_rankings (
  ranking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  rank_title VARCHAR(50),
  week_number INTEGER,
  year INTEGER,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE

);

-- Nearby Gyms
CREATE TABLE gyms (
  gym_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  website VARCHAR(255),
  operating_hours TEXT,
  logo_url VARCHAR(255)
);

-- Product Shop Management
CREATE TABLE product_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  image_url VARCHAR(255),
  FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE CASCADE
);

CREATE TABLE product_images (
  image_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE carts (
  cart_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE wishlists (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'My Wishlist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
  
);

CREATE TABLE wishlist_items (
  wishlist_item_id INT AUTO_INCREMENT PRIMARY KEY,
  wishlist_id INT NOT NULL,
  product_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (wishlist_id, product_id),
  FOREIGN KEY (wishlist_id) REFERENCES wishlists(wishlist_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded') DEFAULT 'Pending',
  shipping_address TEXT NOT NULL,
  billing_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  shipping_method VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tracking_number VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE product_ratings (
  rating_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <=5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Administrative Features
CREATE TABLE admin_notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_accepted ENUM('Pending', 'Accepted', 'Rejected'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

<<<<<<< HEAD
INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES 
    ('Burpees', 'A high-intensity full-body exercise for endurance and strength.', 1, 'Advanced', 'None', 'Full Body', 'https://www.youtube.com/watch?v=G2hv_NYhM-A', NULL, NOW(), NOW()),

    ('Pull-Ups', 'A compound exercise targeting the upper back and biceps.', 2, 'Advanced', 'Pull-up Bar', 'Back, Biceps', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', NULL, NOW(), NOW()),

    ('Squat Jumps', 'Explosive lower-body exercise to enhance power and conditioning.', 3, 'Intermediate', 'None', 'Legs', 'https://www.youtube.com/watch?v=CVaEhXotL7I', NULL, NOW(), NOW()),

    ('Russian Twists', 'A core-strengthening move focusing on rotational movement.', 4, 'Beginner', 'None', 'Core', 'https://www.youtube.com/watch?v=2TwgXLcdZYE', NULL, NOW(), NOW()),

    ('Plank', 'A fundamental core stability exercise.', 5, 'Intermediate', 'None', 'Core', 'https://www.youtube.com/watch?v=pSHjTRCQxIw', NULL, NOW(), NOW()),

    ('Deadlifts', 'A staple compound exercise engaging multiple muscle groups.', 2, 'Advanced', 'Barbell, Weights', 'Legs, Back', 'https://www.youtube.com/watch?v=op9kVnSso6Q', NULL, NOW(), NOW()),

    ('Battle Ropes', 'A dynamic upper-body conditioning exercise.', 3, 'Advanced', 'Battle Ropes', 'Arms, Shoulders', 'https://www.youtube.com/watch?v=veIYglsSphI', NULL, NOW(), NOW()),

    ('Lunges', 'A unilateral lower-body movement that improves balance and strength.', 4, 'Beginner', 'None', 'Legs', 'https://www.youtube.com/watch?v=QOVaHwm-Q6U', NULL, NOW(), NOW()),

    ('Yoga Sun Salutation', 'A sequence of movements promoting flexibility and relaxation.', 5, 'Beginner', 'Yoga Mat', 'Full Body', 'https://www.youtube.com/watch?v=apT-A9G9H-M', NULL, NOW(), NOW());


INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES (
    'Jumping Jacks', 'A full-body warm-up exercise that increases heart rate.', 1, 'Beginner',
    'None', 'Full Body', 'https://www.youtube.com/watch?v=c4DAnQ6DtF8',
    NULL, NOW(), NOW()
);

INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES (
    'Dumbbell Chest Press', 'Targets the pectorals, triceps, and shoulders for hypertrophy.', 2, 'Intermediate',
    'Dumbbells, Bench', 'Chest', 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    NULL, NOW(), NOW()
);

INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES (
    'Sprint Intervals', 'High-speed running intervals to improve endurance and burn fat.', 3, 'Advanced',
    'Running Shoes', 'Legs', 'https://www.youtube.com/watch?v=mDBjzx_Yv8A',
    NULL, NOW(), NOW()
);

INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES (
    'Bird Dogs', 'Core-stabilizing move that also engages glutes and shoulders.', 4, 'Beginner',
    'Yoga Mat (optional)', 'Core', 'https://www.youtube.com/watch?v=wiFNA3sqjCA',
    NULL, NOW(), NOW()
);

INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES (
    'Child's Pose', 'Restorative yoga pose for back and hip relief.', 5, 'Intermediate',
    'Yoga Mat', 'Full Body', 'https://www.youtube.com/watch?v=5jwr1IhvQBs',
    NULL, NOW(), NOW()
);

INSERT INTO exercises (
    name, description, category_id, difficulty_level,
    equipment_needed, muscle_group, video_tutorial_url,
    image_url, created_at, updated_at
) VALUES 
    ('Push-Ups', 'A foundational bodyweight exercise for upper body strength.', 1, 'Beginner', 'None', 'Chest, Triceps, Shoulders', 'https://www.youtube.com/watch?v=_l3ySVKYVJ8', NULL, NULL, NULL),
    ('Chin-Ups', 'Targets the biceps and back using a supinated grip.', 2, 'Advanced', 'Pull-up Bar', 'Biceps, Back', 'https://www.youtube.com/watch?v=b-ztMQPG4NU', NULL, NULL, NULL),
    ('Mountain Climbers', 'A high-intensity cardio exercise that also engages the core.', 3, 'Intermediate', 'None', 'Core, Full Body', 'https://www.youtube.com/watch?v=nmwgirgXLYM', NULL, NULL, NULL),
    ('Bodyweight Squats', 'Strengthens the lower body without equipment.', 3, 'Beginner', 'None', 'Quads, Glutes, Hamstrings', 'https://www.youtube.com/watch?v=aclHkVaku9U', NULL, NULL, NULL),
    ('Jumping Jacks', 'A full-body warm-up exercise that raises heart rate.', 3, 'Beginner', 'None', 'Full Body', 'https://www.youtube.com/watch?v=c4DAnQ6DtF8', NULL, NULL, NULL),
    ('Sit-Ups', 'Targets the abdominal muscles.', 4, 'Beginner', 'None', 'Core', 'https://www.youtube.com/watch?v=1fbU_MkV7NE', NULL, NULL, NULL),
    ('Step-Ups', 'Builds leg strength using an elevated surface.', 3, 'Beginner', 'Step/Bench', 'Legs, Glutes', 'https://www.youtube.com/watch?v=dQqApCGd5Ss', NULL, NULL, NULL),
    ('Wall Sit', 'An isometric lower-body endurance exercise.', 4, 'Intermediate', 'Wall', 'Quads, Glutes', 'https://www.youtube.com/watch?v=y-wV4Venusw', NULL, NULL, NULL),
    ('Superman Exercise', 'Strengthens the lower back and improves posture.', 4, 'Beginner', 'None', 'Lower Back', 'https://www.youtube.com/watch?v=z6PJMT2y8GQ', NULL, NULL, NULL),
    ('High Knees', 'A dynamic cardio movement that boosts agility.', 3, 'Intermediate', 'None', 'Legs, Core', 'https://www.youtube.com/watch?v=OAJ_J3EZkdY', NULL, NULL, NULL);


=======
-- 
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    calories INT NOT NULL
);



CREATE TABLE feedback (
feedback_id INT AUTO_INCREMENT PRIMARY KEY, 
user_id INT NOT NULL, 
message TEXT NOT NULL,
time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE );
>>>>>>> 1e6bb005e8357ffd19af83d7b1cb28dc895e3fd6

-- Create indexes for performance improvements
CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_user_diet_plans_user_id ON user_diet_plans(user_id);
CREATE INDEX idx_user_workout_plans_user_id ON user_workout_plans(user_id);
CREATE INDEX idx_user_workout_logs_user_id ON user_workout_logs(user_id);
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_measurements_user_id ON user_measurements(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_group_id ON posts(group_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_user_connections_user_id ON user_connections(user_id);
CREATE INDEX idx_user_connections_connected_user_id ON user_connections(connected_user_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_user_rankings_user_id ON user_rankings(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX idx_admin_notifications_user_id ON admin_notifications(user_id);

