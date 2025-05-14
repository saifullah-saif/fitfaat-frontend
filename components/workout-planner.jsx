"use client"
import axios from "axios"
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Dumbbell, Plus, ChevronRight, Target, Play, Check, X, Save, MapPin, Clock, Phone, Globe, Building, Trash2, RefreshCw, ChevronLeft, Calendar, ListTodo, SkipForward } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import Link from "next/link"


// This component implements a workout planner with:
// 1. Goal selection with recommended exercises
// 2. Routines management
// 3. Exercise library with detailed view

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Animation for checkmark
  const [checkmarkProgress, setCheckmarkProgress] = useState(0);

  // Animation for toast entrance
  useEffect(() => {
    // Start with initializing animation
    const initTimer = setTimeout(() => {
      setIsInitializing(false);
    }, 50);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    // Start checkmark animation
    let animationFrame;
    let start = null;
    const duration = 800; // Increased animation duration for smoother effect

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);

      // Use easeOutQuad for smoother animation
      const eased = 1 - (1 - progress) * (1 - progress);
      setCheckmarkProgress(eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    // Auto-close after 3.5 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 500); // Increased transition duration
    }, 3500);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [onClose]);

  if (!isVisible) return null;

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-white border-gray-200 text-gray-800';
    }
  };

  // Get icon based on message type
  const getIcon = () => {
    if (type === 'success') {
      // Enhanced animated checkmark for success
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 absolute" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="62.83"
              strokeDashoffset={62.83 - (checkmarkProgress * 62.83)}
              transform="rotate(-90 12 12)"
            />
          </svg>
          <svg className="w-5 h-5 absolute" viewBox="0 0 24 24">
          <path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="#10b981"
              strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30"
            strokeDashoffset={30 - (checkmarkProgress * 30)}
          />
        </svg>
        </div>
      );
    } else if (type === 'warning') {
      // Enhanced warning icon with animation
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 absolute animate-pulse" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        </div>
      );
    } else if (type === 'error') {
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 absolute" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="62.83"
              strokeDashoffset={62.83 - (checkmarkProgress * 62.83)}
              transform="rotate(-90 12 12)"
            />
          </svg>
          <X className="w-4 h-4 text-red-500 absolute" />
        </div>
      );
    } else {
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-6 h-6 absolute" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="62.83"
              strokeDashoffset={62.83 - (checkmarkProgress * 62.83)}
              transform="rotate(-90 12 12)"
            />
          </svg>
          <svg className="w-4 h-4 absolute" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <path d="M12 16v-4"></path>
          </svg>
        </div>
      );
    }
  };

  // Determine position based on message type
  // Warning messages at the top, success messages at the bottom
  const getPosition = () => {
    if (type === 'warning') {
      return 'top-4 right-4';
    } else {
      return 'bottom-4 right-4';
    }
  };

  return (
    <div
      className={`fixed ${getPosition()} flex items-center p-4 rounded-lg shadow-lg border z-50 transition-all duration-500 ${getBgColor()}
      ${isExiting ? 'translate-x-4 opacity-0 scale-95' : isInitializing ? 'translate-x-4 opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100'}`}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="mr-2">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, 500);
        }}
        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export function WorkoutPlanner() {
  // State for toast notifications
  const [toasts, setToasts] = useState([]);

  // State for current user
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Function to get the current user ID
  const getCurrentUserId = useCallback(async () => {
    try {
      // Get user data from the authentication endpoint
      const response = await axios.get('http://localhost:5000/auth/me', {
        withCredentials: true // Important to include cookies for JWT authentication
      });

      console.log("Current user response:", response.data);

      // Extract user ID from the response
      if (response.data && response.data.user) {
        // Use user_id or id, whichever is available
        const userId = response.data.user.user_id || response.data.user.id;
        console.log("Using authenticated user ID:", userId);
        return userId;
      } else {
        throw new Error("User data not found in response");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);

      // Try to get user from localStorage as fallback
      try {
        const storedUser = localStorage.getItem("fitfaat_user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.user_id || userData.id;
          console.log("Using user ID from localStorage:", userId);
          return userId;
        }
      } catch (localStorageError) {
        console.error("Error reading from localStorage:", localStorageError);
      }

      // Final fallback to user_id 1 for development
      addToast("Using default user (ID: 1). Please login for personalized experience.", 'warning');
      return 1;
    }
  }, []);

  // Load the current user ID when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await getCurrentUserId();
        console.log("Setting current user ID to:", userId);
        setCurrentUserId(userId);
        setUserLoaded(true);
      } catch (error) {
        console.error("Failed to load user:", error);
        // Still set userLoaded to true so the app can function with fallback
        setUserLoaded(true);
      }
    };

    loadUser();
  }, [getCurrentUserId]);

  // Function to add a toast
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  };

  // Function to remove a toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  const [selectedGoal, setSelectedGoal] = useState("")

  // State for workout goals data from database
  const [workoutGoals, setWorkoutGoals] = useState([])
  const [loadingWorkoutGoals, setLoadingWorkoutGoals] = useState(true)
  const [activeWorkoutPlanId, setActiveWorkoutPlanId] = useState(null)
  const [changingGoal, setChangingGoal] = useState(false)

  // State for all exercises (for the exercise library)
  const [allExercises, setAllExercises] = useState([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showExerciseDetails, setShowExerciseDetails] = useState(false)

  // Fetch exercise categories, exercises, and workout plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingExercises(true)
        setLoadingWorkoutGoals(true)

        // Fetch exercise categories and exercises
        const categoriesResponse = await axios.get('http://localhost:5000/api/exercises/fetch_exercise_categories')
        const exercisesResponse = await axios.get('http://localhost:5000/api/exercises/fetch_exercises')

        // Fetch workout plans
        const workoutPlansResponse = await axios.get('http://localhost:5000/api/workouts/fetch_all_workout_plans')

        // Store all exercises for the exercise library
        setAllExercises(exercisesResponse.data)
        setLoadingExercises(false)

        // Store workout plans as workout goals
        const plans = workoutPlansResponse.data.map(plan => ({
          id: plan.workout_plan_id.toString(),
          name: plan.name,
          description: plan.description,
          goal_type: plan.goal_type,
          difficulty_level: plan.difficulty_level
        }))

        setWorkoutGoals(plans)
        setLoadingWorkoutGoals(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        // Get more detailed error information from axios error
        const errorMessage = err.response
          ? `Error ${err.response.status}: ${err.response.data.error || err.message}`
          : err.message
        console.error(errorMessage)
        setLoadingExercises(false)
        setLoadingWorkoutGoals(false)
        addToast("Failed to load workout data. Please try again.", 'error')
      }
    }

    fetchData()
  }, [])


  // State for routines and workout plans
  const [routines, setRoutines] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState({
    name: "My Custom Workout",
    description: "Personalized workout plan",
    goal_type: "General Fitness",
    difficulty_level: "Beginner",
    duration_weeks: 4,
    days_per_week: 3,
    is_default: false
  });
  const [userWorkoutPlan, setUserWorkoutPlan] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [showWorkoutLogs, setShowWorkoutLogs] = useState(false);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [userPoints, setUserPoints] = useState({ total: 0, level: 1, rank: 'Beginner' });

  // State for exercise library filters
  const [filters, setFilters] = useState({
    difficulty: {
      beginner: false,
      intermediate: false,
      advanced: false
    },
    equipment: {
      withEquipment: false,
      withoutEquipment: false
    },
    muscleGroups: {}
  });

  // State for sorting
  const [sortOption, setSortOption] = useState("none");

  // State for filter dropdown visibility
  const [showFilters, setShowFilters] = useState(false);

  // State for gyms
  const [gyms, setGyms] = useState([]);
  const [loadingGyms, setLoadingGyms] = useState(false);
  const [showGyms, setShowGyms] = useState(false);
  const [hoveredGym, setHoveredGym] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [showGymDetails, setShowGymDetails] = useState(false);

  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [isResettingLogs, setIsResettingLogs] = useState(false);

  // State for save routine dialog
  const [showSaveRoutineDialog, setShowSaveRoutineDialog] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [selectedGoalType, setSelectedGoalType] = useState("");
  const [targetDate, setTargetDate] = useState(null);
  const [savingRoutine, setSavingRoutine] = useState(false);
  const [availableGoalTypes, setAvailableGoalTypes] = useState([]);

  // State for user routines
  const [userRoutines, setUserRoutines] = useState([]);
  const [showUserRoutines, setShowUserRoutines] = useState(false);
  const [loadingUserRoutines, setLoadingUserRoutines] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [editingRoutine, setEditingRoutine] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState(null);

  // State for tracking completed exercises in active routine
  const [completedExercises, setCompletedExercises] = useState([]);
  const [completingActiveExercise, setCompletingActiveExercise] = useState(null);
  const [skippingActiveExercise, setSkippingActiveExercise] = useState(null);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const filterDropdown = document.getElementById('filter-dropdown');
      const filterButton = document.getElementById('filter-button');

      if (
        filterDropdown &&
        !filterDropdown.contains(event.target) &&
        filterButton &&
        !filterButton.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtered exercises based on selected filters
  const [filteredExercises, setFilteredExercises] = useState([]);

  // Extract unique muscle groups from exercises
  const [uniqueMuscleGroups, setUniqueMuscleGroups] = useState([]);

  // Extract muscle groups when exercises load
  useEffect(() => {
    if (allExercises && allExercises.length > 0) {
      // Extract unique muscle groups
      const muscleGroupsSet = new Set();
      allExercises.forEach(exercise => {
        if (exercise.muscle_group) {
          exercise.muscle_group.split(',').forEach(group => {
            muscleGroupsSet.add(group.trim().toLowerCase());
          });
        }
      });
      setUniqueMuscleGroups(Array.from(muscleGroupsSet).sort());

      // Initialize filter state with dynamic keys for muscle groups
      const muscleGroupsInitial = {};
      Array.from(muscleGroupsSet).forEach(group => {
        muscleGroupsInitial[group] = false;
      });

      setFilters(prev => ({
        ...prev,
        muscleGroups: { ...muscleGroupsInitial }
      }));
    }
  }, [allExercises]);



  // Use effect to fetch saved user routines and logs on component mount
  useEffect(() => {
    // Only proceed if user is loaded and we have a valid user ID
    if (userLoaded && currentUserId) {
      console.log("User loaded with ID:", currentUserId, "- fetching user data");

      // Fetch user routines, logs, and saved routines
      fetchUserRoutines();
      fetchWorkoutLogs();
      fetchUserSavedRoutines();

      // Fetch user rankings from database
      const fetchUserRankings = async () => {
        try {
          console.log("Fetching rankings for user ID:", currentUserId);
          const response = await axios.get(`http://localhost:5000/api/workouts/fetch_user_rankings/${currentUserId}`);
          if (response.data) {
            setUserPoints({
              total: response.data.points || 0,
              level: response.data.level || 1,
              rank: response.data.rank_title || 'Rookie'
            });
            console.log("Updated user points:", response.data);
          }
        } catch (error) {
          console.error("Error fetching user rankings:", error);
          // Set default user points if fetch fails
          setUserPoints({ total: 0, level: 1, rank: 'Rookie' });
        }
      };

      fetchUserRankings();

      // Check if we need to reset completed exercises for a new day
      checkAndResetDailyExercises();
    } else if (userLoaded && !currentUserId) {
      console.warn("User loaded but no user ID available - using default values");
      // Set default values when user is loaded but no ID is available
      setUserPoints({ total: 0, level: 1, rank: 'Rookie' });
    }
    // When user ID loads or changes, refetch data
  }, [userLoaded, currentUserId]);

  // Function to check if we need to reset completed exercises for a new day
  const checkAndResetDailyExercises = () => {
    // Get the last reset date from localStorage
    const lastResetDate = localStorage.getItem('lastRoutineResetDate');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // If no reset date or it's a different day, reset completed exercises
    if (!lastResetDate || lastResetDate !== today) {
      console.log('Resetting daily exercises for new day');
      setCompletedExercises([]);
      localStorage.setItem('lastRoutineResetDate', today);
    } else {
      // Load saved completed exercises from localStorage
      try {
        const savedCompletedExercises = localStorage.getItem('completedExercises');
        if (savedCompletedExercises) {
          setCompletedExercises(JSON.parse(savedCompletedExercises));
        }
      } catch (error) {
        console.error('Error loading completed exercises:', error);
        setCompletedExercises([]);
      }
    }
  };

  // Calculate user points from workout logs
  const calculateUserPoints = () => {
    if (!workoutLogs.length) return;

    // Filter only completed logs
    const completedLogs = workoutLogs.filter(log => log.is_completed);

    // Calculate total points from calories_burned field
    const totalPoints = completedLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);

    // Calculate level based on specific point thresholds
    let level;
    if (totalPoints < 100) level = 1;
    else if (totalPoints < 300) level = 2;
    else if (totalPoints < 500) level = 3;
    else if (totalPoints < 800) level = 4;
    else if (totalPoints < 1200) level = 5;
    else if (totalPoints < 1800) level = 6;
    else if (totalPoints < 2500) level = 7;
    else if (totalPoints < 3500) level = 8;
    else if (totalPoints < 5000) level = 9;
    else level = 10;

    // Determine rank based on level
    let rank = 'Beginner';
    if (level <= 2) rank = 'Rookie';
    else if (level <= 4) rank = 'Contender';
    else if (level <= 6) rank = 'Challenger';
    else if (level <= 9) rank = 'Veteran';
    else rank = 'Overachiever';

    // Update user points state
    setUserPoints({ total: totalPoints, level, rank });

    // Update user_rankings table in database
    updateUserRankings(totalPoints, level, rank);
  };

  // Update user rankings in database
  const updateUserRankings = async (points, level, rank) => {
    try {
      await axios.post('http://localhost:5000/api/workouts/update_user_rankings', {
        user_id: currentUserId,
        points,
        level,
        rank_title: rank
      });
    } catch (error) {
      console.error("Error updating user rankings:", error);
    }
  };

  // Reset workout logs and rankings
  const resetWorkoutLogs = async () => {
    try {
      setIsResettingLogs(true);

      // Show confirmation dialog
      setConfirmationMessage("Are you sure you want to reset all your workout logs and rankings? This action cannot be undone.");

      // Set the action to perform if confirmed
      setConfirmationAction(() => async () => {
        try {
          // Delete all workout logs for this user
          await axios.delete(`http://localhost:5000/api/workouts/reset_workout_logs/${currentUserId}`);

          // Reset user rankings
          await axios.post('http://localhost:5000/api/workouts/update_user_rankings', {
            user_id: currentUserId,
            points: 0,
            level: 1,
            rank_title: 'Rookie'
          });

          // Update local state
          setWorkoutLogs([]);
          setUserPoints({ total: 0, level: 1, rank: 'Rookie' });

          // Show success message
          addToast("Your workout logs and rankings have been reset successfully.", 'success');

          // Close the logs dialog
          setShowWorkoutLogs(false);
        } catch (error) {
          console.error("Error resetting workout logs:", error);
          addToast("Failed to reset workout logs. Please try again.", 'error');
        } finally {
          setIsResettingLogs(false);
          setShowConfirmation(false);
        }
      });

      // Show the confirmation dialog
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error preparing to reset logs:", error);
      setIsResettingLogs(false);
    }
  };

  // Fetch user routines from the database
  const fetchUserRoutines = async () => {
    // Skip if user is not loaded yet or no user ID is available
    if (!userLoaded || !currentUserId) {
      console.warn("Cannot fetch user routines: User not loaded or no user ID available");
      return;
    }

    try {
      setLoadingRoutines(true);
      console.log("Fetching workout plans for user ID:", currentUserId);

      // First get the user's active workout plan
      const userPlansResponse = await axios.get('http://localhost:5000/api/workouts/fetch_user_workout_plans', {
        params: { user_id: currentUserId }
      });

      console.log("Fetched user workout plans:", userPlansResponse.data);

      if (userPlansResponse.data.length > 0) {
        // Get the most recent active plan
        const activePlan = userPlansResponse.data.find(plan => plan.is_active) || userPlansResponse.data[0];
        console.log("Active workout plan:", activePlan.name);

        setWorkoutPlan({
          name: activePlan.name,
          description: activePlan.description,
          goal_type: activePlan.goal_type,
          difficulty_level: activePlan.difficulty_level,
          duration_weeks: activePlan.duration_weeks,
          days_per_week: activePlan.days_per_week,
          is_default: activePlan.is_default
        });

        // Set the active workout plan ID
        setActiveWorkoutPlanId(activePlan.workout_plan_id);

        // Set the selected goal to match the active plan
        setSelectedGoal(activePlan.workout_plan_id.toString());

        // Fetch the exercises for this plan
        console.log("Fetching exercises for workout plan ID:", activePlan.workout_plan_id);
        const exercisesResponse = await axios.get(`http://localhost:5000/api/workouts/fetch_workout_plan_exercises/${activePlan.workout_plan_id}`);

        if (exercisesResponse.data.length > 0) {
          console.log("Fetched exercises for workout plan:", exercisesResponse.data.length);

          // Also fetch logs to check if any of these exercises are completed
          const logsResponse = await axios.get('http://localhost:5000/api/workouts/fetch_user_workout_logs', {
            params: { user_id: currentUserId }
          });

          const completedExerciseLogs = logsResponse.data.filter(log => log.is_completed);
          console.log("Found completed exercise logs:", completedExerciseLogs.length);

          // Format the exercises to match our routine format
          const fetchedRoutines = exercisesResponse.data.map(ex => {
            // Check if this exercise is completed in logs
            const matchingLog = completedExerciseLogs.find(log =>
              log.exercise_id === ex.exercise_id &&
              log.is_completed
            );

            return {
              id: ex.workout_plan_exercise_id,
              exercise: {
                exercise_id: ex.exercise_id,
                name: ex.name,
                description: ex.description,
                difficulty_level: ex.difficulty_level,
                muscle_group: ex.muscle_group,
                category_name: ex.category_name
              },
              sets: ex.sets,
              reps: ex.reps,
              duration: ex.duration,
              day_of_week: ex.day_of_week,
              is_completed: matchingLog ? true : false,
              log_id: matchingLog ? matchingLog.log_id : null,
              isEdited: false,        // Routines from database are already set
              isConfirmed: true       // Consider them confirmed
            };
          });

          console.log("Setting routines with fetched data:", fetchedRoutines.length);
          setRoutines(fetchedRoutines);
        } else {
          console.log("No exercises found for this workout plan");
          setRoutines([]);
        }
      } else {
        console.log("No workout plans found for this user");
        // Set default workout plan
        setWorkoutPlan({
          name: "My Custom Workout",
          description: "Personalized workout plan",
          goal_type: "General Fitness",
          difficulty_level: "Beginner",
          duration_weeks: 4,
          days_per_week: 3,
          is_default: false
        });
        setRoutines([]);
      }

      setLoadingRoutines(false);
    } catch (error) {
      console.error("Error fetching user routines:", error);
      setLoadingRoutines(false);
      setRoutines([]);
    }
  };

  // At the top of the WorkoutPlanner component, add a state to track loading status
  const [completingRoutine, setCompletingRoutine] = useState(null);
  const [removingRoutine, setRemovingRoutine] = useState(null);

  // Add exercise to routines
  const addExerciseToRoutine = (exercise) => {
    // Check if we already have 5 exercises in the routine
    if (routines.length >= 5) {
      addToast("You can only add up to 5 exercises to a routine. Please remove some exercises first.", 'warning');
      return;
    }

    // Default values based on difficulty level
    let defaultSets = 3;
    let defaultReps = "8-12";
    let defaultDuration = "30 sec";

    if (exercise.difficulty_level === "Beginner") {
      defaultSets = 2;
      defaultReps = "10-15";
      defaultDuration = "20 sec";
    } else if (exercise.difficulty_level === "Advanced") {
      defaultSets = 4;
      defaultReps = "6-10";
      defaultDuration = "45 sec";
    }

    const newRoutine = {
      id: Date.now(),
      exercise: exercise,
      sets: defaultSets,
      reps: defaultReps,
      duration: defaultDuration,
      day_of_week: "Monday", // Default day
      is_completed: false,
      log_id: null,
      isEdited: true,      // New routine needs confirmation
      isConfirmed: false   // Not confirmed yet
    };

    setRoutines([...routines, newRoutine]);

    // Show success toast
    addToast(`Added ${exercise.name} to your routine`, 'success');

    // No longer creating logs when adding to routines
    // Logs will only be created when marking as completed
  };

  // Fetch gyms data
  const fetchGyms = async () => {
    try {
      setLoadingGyms(true);
      const response = await axios.get('http://localhost:5000/api/gyms/fetch_gyms');
      setGyms(response.data);
      setLoadingGyms(false);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      addToast("Failed to fetch nearby gyms. Please try again.", 'error');
      setLoadingGyms(false);
    }
  };

  // Fetch gyms and user routines when component mounts
  useEffect(() => {
    fetchGyms();
    fetchUserSavedRoutines();
  }, []);

  // Fetch workout logs - only show completed workouts in logs
  const fetchWorkoutLogs = async (showLogsDialog = false) => {
    // Skip if user is not loaded yet or no user ID is available
    if (!userLoaded || !currentUserId) {
      console.warn("Cannot fetch workout logs: User not loaded or no user ID available");
      return;
    }

    try {
      console.log("Fetching workout logs for user ID:", currentUserId);
      const response = await axios.get('http://localhost:5000/api/workouts/fetch_user_workout_logs', {
        params: { user_id: currentUserId }
      });

      // Filter to only include completed logs for the logs view
      const logs = response.data;
      console.log(`Fetched ${logs.length} logs from server for user ID ${currentUserId}`);

      // Include both completed and skipped exercises in logs
      // (skipped exercises have is_completed set to false)
      const relevantLogs = logs.filter(log => log.is_completed || log.notes?.toLowerCase().includes('skipped'));
      console.log(`${relevantLogs.length} logs are either completed or skipped`);

      // Sort logs by date (newest first) and then by created_at time or log_id
      relevantLogs.sort((a, b) => {
        // First sort by log_date
        const dateComparison = new Date(b.log_date) - new Date(a.log_date);

        // If dates are the same, sort by created_at time if available
        if (dateComparison === 0) {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          // If no created_at, fall back to log_id (higher = newer)
          return b.log_id - a.log_id;
        }

        return dateComparison;
      });

      setWorkoutLogs(relevantLogs);
      console.log("Updated workout logs state with completed and skipped logs sorted by newest first");

      // Calculate user points after logs are fetched
      setTimeout(() => calculateUserPoints(), 100);

      // If we have routines loaded, update ONLY the specific routine with matching log_id
      if (routines.length > 0) {
        console.log(`Checking ${routines.length} routines for completed status`);
        // Make a shallow copy to avoid direct state mutation
        let updatedRoutines = [...routines];

        routines.forEach((routine, index) => {
          // Find a completed log that matches this specific routine by log_id
          if (routine.log_id) {
            const matchingLog = logs.find(log =>
              log.log_id === routine.log_id &&
              log.is_completed
            );

            if (matchingLog) {
              console.log(`Routine ${routine.id} has a matching completed log ${matchingLog.log_id}`);
              // Update the specific routine in our array
              updatedRoutines[index] = {
                ...routine,
                is_completed: true
              };
            }
          }
        });

        // Only update state if there are actual changes
        if (JSON.stringify(updatedRoutines) !== JSON.stringify(routines)) {
          setRoutines(updatedRoutines);
          console.log("Updated routines with completion status");
        }
      }

      if (showLogsDialog) {
        console.log("Showing logs dialog");
        setShowWorkoutLogs(true);
      }
    } catch (error) {
      console.error("Error fetching workout logs:", error);
      setWorkoutLogs([]); // Set empty array on error
      if (showLogsDialog) {
        addToast("Failed to fetch workout logs. Please try again.", 'error');
      }
    }
  };

  // Update routine sets, reps or duration
  const updateRoutine = (routineId, field, value) => {
    setRoutines(routines.map(routine => {
      if (routine.id === routineId) {
        return {
          ...routine,
          [field]: value,
          isEdited: true  // Mark as edited when any field is changed
        };
      }
      return routine;
    }));
  };

  // Update confirmRoutineSettings function to properly set isConfirmed
  const confirmRoutineSettings = (routineId) => {
    console.log(`Confirming settings for routine ${routineId}`);

    setRoutines(routines.map(routine => {
      if (routine.id === routineId) {
        console.log(`Found routine ${routineId}, marking as confirmed`);

        // Show a toast to indicate the routine is now ready to be marked as completed and removed
        addToast(`"${routine.exercise.name}" is now ready. Click the check mark to complete and remove.`, 'info');

        return {
          ...routine,
          isEdited: false,  // Remove edit flag
          isConfirmed: true  // Mark as confirmed
        };
      }
      return routine;
    }));
  };

  // Complete exercise and add to logs
  const completeExerciseAndAddToLogs = async (routineId) => {
    console.log(`Completing exercise ${routineId} and adding to logs`);

    // Set the current routine as loading
    setCompletingRoutine(routineId);

    try {
      // Find the routine before it might be updated or removed
      const routine = routines.find(r => r.id === routineId);
      if (!routine) {
        console.error(`Routine with ID ${routineId} not found`);
        setCompletingRoutine(null);
        return;
      }

      // Check if routine is confirmed - only confirmed routines can be marked as completed
      if (!routine.isConfirmed) {
        addToast("Please confirm routine settings before marking as completed.", 'warning');
        setCompletingRoutine(null);
        return;
      }

      // Calculate points based on difficulty level
      let pointsEarned = 0;
      if (routine.exercise.difficulty_level === 'Beginner') {
        pointsEarned = 10;
      } else if (routine.exercise.difficulty_level === 'Intermediate') {
        pointsEarned = 20;
      } else if (routine.exercise.difficulty_level === 'Advanced') {
        pointsEarned = 30;
      }

      // Get the current date and time for the log
      const today = new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString();

      // Create a new log entry when marking as completed
      const logResponse = await axios.post('http://localhost:5000/api/workouts/log_workout', {
        user_id: currentUserId, // Use current user ID
        exercise_id: routine.exercise.exercise_id,
        log_date: today,
        is_completed: true, // Mark as completed immediately
        calories_burned: pointsEarned, // Store points in calories_burned field
        notes: `Completed ${routine.sets} sets of ${routine.reps} reps`,
        created_at: currentTimestamp
      });

      if (logResponse.data) {
        // Remove only the completed routine, preserve others
        const updatedRoutines = routines.filter(r => r.id !== routineId);
        setRoutines(updatedRoutines);

        // Show a success toast with points earned
        addToast(`"${routine.exercise.name}" has been completed and added to logs. You earned ${pointsEarned} points!`, 'success');

        // Refresh logs without reloading the page
        fetchWorkoutLogs();

        // Update user points
        calculateUserPoints();

        // Clear loading state
        setCompletingRoutine(null);
      } else {
        setCompletingRoutine(null);
        throw new Error("No data returned from log workout endpoint");
      }
    } catch (error) {
      setCompletingRoutine(null);
      console.error("Error completing exercise:", error);
      addToast("Failed to complete exercise. Please try again.", 'error');
    }
  };

  // Remove exercise from routines and add to logs as skipped
  const removeExerciseFromRoutine = async (routineId) => {
    console.log(`Removing routine ${routineId} from routines list`);

    // Set the current routine as loading
    setRemovingRoutine(routineId);

    // Find the routine before removing it
    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
      console.error(`Routine with ID ${routineId} not found`);
      setRemovingRoutine(null);
      return;
    }

    try {
      // First remove it from the UI for immediate feedback
      const updatedRoutines = routines.filter(r => r.id !== routineId);
      setRoutines(updatedRoutines);

      // Get the current date and time for the log
      const today = new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString();

      // Create a log entry for the skipped exercise
      const logResponse = await axios.post('http://localhost:5000/api/workouts/log_workout', {
        user_id: currentUserId,
        exercise_id: routine.exercise.exercise_id,
        log_date: today,
        is_completed: false, // Mark as not completed
        notes: `Skipped - Removed from routine`,
        created_at: currentTimestamp
      });

      if (logResponse.data) {
        console.log(`Added routine ${routineId} to logs as skipped`);

        // Show success toast
        addToast(`"${routine.exercise.name}" removed and marked as skipped in logs.`, 'info');

        // Refresh logs without reloading the page
        fetchWorkoutLogs();

        // Clear loading state
        setRemovingRoutine(null);
      }
    } catch (error) {
      setRemovingRoutine(null);
      console.error("Error adding skipped exercise to logs:", error);
      // Still show toast since the exercise was removed from routines
      addToast("Exercise removed from routines.", 'info');
    }
  };

  // Save the selected goal to the database
  const saveWorkoutGoal = async (goalId) => {
    if (!goalId || !currentUserId) return;

    try {
      setChangingGoal(true);

      // Find the selected workout plan
      const selectedWorkoutPlan = workoutGoals.find(goal => goal.id === goalId);
      if (!selectedWorkoutPlan) {
        throw new Error("Selected workout plan not found");
      }

      // Update the workout plan in the database
      const response = await axios.post('http://localhost:5000/api/workouts/update_user_active_plan', {
        user_id: currentUserId,
        workout_plan_id: parseInt(goalId)
      });

      if (response.data.success) {
        // Update the active workout plan ID
        setActiveWorkoutPlanId(parseInt(goalId));

        // Update the workout plan state
        setWorkoutPlan({
          name: selectedWorkoutPlan.name,
          description: selectedWorkoutPlan.description,
          goal_type: selectedWorkoutPlan.goal_type,
          difficulty_level: selectedWorkoutPlan.difficulty_level,
          duration_weeks: 4, // Default values
          days_per_week: 3,  // Default values
          is_default: false
        });

        // Show success toast
        addToast(`Workout goal updated to: ${selectedWorkoutPlan.name}`, 'success');

        // Refresh user routines to get the updated plan
        fetchUserRoutines();
      }
    } catch (error) {
      console.error("Error saving workout goal:", error);
      addToast("Failed to save workout goal. Please try again.", 'error');
    } finally {
      setChangingGoal(false);
    }
  };

  // Update workout plan when goal changes (only when changing goal)
  useEffect(() => {
    if (selectedGoal && workoutGoals.length > 0 && changingGoal) {
      const selectedWorkoutPlan = workoutGoals.find(goal => goal.id === selectedGoal);
      if (selectedWorkoutPlan) {
        setWorkoutPlan({
          name: selectedWorkoutPlan.name,
          description: selectedWorkoutPlan.description,
          goal_type: selectedWorkoutPlan.goal_type,
          difficulty_level: selectedWorkoutPlan.difficulty_level,
          duration_weeks: 4, // Default values
          days_per_week: 3,  // Default values
          is_default: false
        });
      }
    }
  }, [selectedGoal, workoutGoals, changingGoal]);

  // Handle filter changes
  const handleFilterChange = (filterType, filterName) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };

      if (filterType === 'difficulty') {
        newFilters.difficulty = {
          ...newFilters.difficulty,
          [filterName]: !newFilters.difficulty[filterName]
        };
      } else if (filterType === 'equipment') {
        newFilters.equipment = {
          ...newFilters.equipment,
          [filterName]: !newFilters.equipment[filterName]
        };
      } else if (filterType === 'muscleGroups') {
        newFilters.muscleGroups = {
          ...newFilters.muscleGroups,
          [filterName]: !newFilters.muscleGroups[filterName]
        };
      }

      return newFilters;
    });
  };

  // Apply filters to exercises
  const applyFilters = useCallback(() => {
    if (!allExercises.length) {
      console.log("No exercises to filter");
      return;
    }

    console.log("Applying filters:", filters);
    console.log("Total exercises before filtering:", allExercises.length);

    let result = [...allExercises];

    // Check if any difficulty filters are active
    const activeDifficultyFilters = Object.entries(filters.difficulty).filter(([_, isActive]) => isActive);
    if (activeDifficultyFilters.length > 0) {
      console.log("Active difficulty filters:", activeDifficultyFilters.map(([name]) => name));

      result = result.filter(exercise => {
        const level = exercise.difficulty_level?.toLowerCase() || '';
        const matches = activeDifficultyFilters.some(([difficulty, _]) => {
          // Exact match for difficulty level
          return level === difficulty.toLowerCase();
        });

        if (matches) {
          console.log(`Exercise ${exercise.name} matches difficulty ${level}`);
        }

        return matches;
      });

      console.log("Exercises after difficulty filter:", result.length);
    }

    // Check if any equipment filters are active
    const activeEquipmentFilters = Object.entries(filters.equipment).filter(([_, isActive]) => isActive);
    if (activeEquipmentFilters.length > 0) {
      console.log("Active equipment filters:", activeEquipmentFilters.map(([name]) => name));

      result = result.filter(exercise => {
        if (!exercise.equipment_needed) {
          return false;
        }

        const equipmentNeeded = exercise.equipment_needed.toLowerCase();
        const hasEquipment = equipmentNeeded !== 'none' && equipmentNeeded !== 'no equipment' && equipmentNeeded !== '';

        const matches = activeEquipmentFilters.some(([equipment, _]) => {
          if (equipment === 'withEquipment') return hasEquipment;
          if (equipment === 'withoutEquipment') return !hasEquipment;
          return false;
        });

        if (matches) {
          console.log(`Exercise ${exercise.name} matches equipment requirement: ${hasEquipment ? 'With Equipment' : 'Without Equipment'}`);
        }

        return matches;
      });

      console.log("Exercises after equipment filter:", result.length);
    }

    // Check if any muscle group filters are active
    if (filters.muscleGroups) {
      const activeMuscleGroupFilters = Object.entries(filters.muscleGroups).filter(([_, isActive]) => isActive);
      if (activeMuscleGroupFilters.length > 0) {
        console.log("Active muscle group filters:", activeMuscleGroupFilters.map(([name]) => name));

        result = result.filter(exercise => {
          if (!exercise.muscle_group) {
            return false;
          }

          const muscleGroups = exercise.muscle_group.toLowerCase();
          const matches = activeMuscleGroupFilters.some(([muscleGroup, _]) => {
            return muscleGroups.includes(muscleGroup.toLowerCase());
          });

          if (matches) {
            console.log(`Exercise ${exercise.name} matches muscle group in: ${exercise.muscle_group}`);
          }

          return matches;
        });

        console.log("Exercises after muscle group filter:", result.length);
      }
    }

    // Always sort alphabetically by name first, then apply other sorting if selected
    result = [...result].sort((a, b) => {
      return (a.name || "").localeCompare(b.name || "");
    });

    // Apply additional sorting if specified
    if (sortOption !== "none") {
      result = [...result].sort((a, b) => {
        switch (sortOption) {
          case "difficulty_asc":
            const difficultyOrder = { "beginner": 1, "intermediate": 2, "advanced": 3 };
            return (difficultyOrder[a.difficulty_level?.toLowerCase()] || 0) -
                   (difficultyOrder[b.difficulty_level?.toLowerCase()] || 0);
          case "difficulty_desc":
            const difficultyOrderDesc = { "beginner": 1, "intermediate": 2, "advanced": 3 };
            return (difficultyOrderDesc[b.difficulty_level?.toLowerCase()] || 0) -
                   (difficultyOrderDesc[a.difficulty_level?.toLowerCase()] || 0);
          case "muscle_group":
            return (a.muscle_group || "").localeCompare(b.muscle_group || "");
          case "equipment":
            return (a.equipment_needed || "").localeCompare(b.equipment_needed || "");
          default:
            return 0;
        }
      });
    }

    console.log("Final filtered exercises:", result.length);
    setFilteredExercises(result);

    // Show toast notification
    addToast(`Found ${result.length} exercises matching your filters`, 'success');
  }, [allExercises, filters, sortOption]);

  // Initialize filtered exercises with all exercises sorted alphabetically
  useEffect(() => {
    console.log("Setting initial filtered exercises:", allExercises.length);
    // Sort exercises alphabetically by name
    const sortedExercises = [...allExercises].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
    setFilteredExercises(sortedExercises);
  }, [allExercises]);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Fetch available goal types from the server
  const fetchGoalTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/workouts/fetch_goal_types');
      console.log("Fetched goal types:", response.data);
      setAvailableGoalTypes(response.data);
    } catch (error) {
      console.error("Error fetching goal types:", error);
      // Use default goal types if fetch fails
      setAvailableGoalTypes(['Weight Loss', 'Muscle Building', 'Endurance', 'Flexibility', 'General Fitness']);
    }
  };

  // Fetch goal types when component mounts
  useEffect(() => {
    fetchGoalTypes();
  }, []);

  // Fetch user saved routines from routines table
  const fetchUserSavedRoutines = async () => {
    // Skip if no user ID is available
    if (!currentUserId) {
      console.warn("Cannot fetch user routines: No user ID available");
      setLoadingUserRoutines(false);
      return;
    }

    try {
      setLoadingUserRoutines(true);
      console.log("Fetching saved routines for user ID:", currentUserId);

      const response = await axios.get(`http://localhost:5000/api/workouts/fetch_user_routines/${currentUserId}`);
      console.log("Fetched user routines:", response.data);

      setUserRoutines(response.data);

      // Find the active routine
      const active = response.data.find(routine => routine.status === 'Active');
      if (active) {
        console.log("Found active routine:", active.title);
        setActiveRoutine(active);
      } else {
        console.log("No active routine found");
        setActiveRoutine(null);
      }

      setLoadingUserRoutines(false);
    } catch (error) {
      console.error("Error fetching user routines:", error);
      addToast("Failed to fetch your saved routines.", 'error');
      setLoadingUserRoutines(false);
      setUserRoutines([]);
      setActiveRoutine(null);
    }
  };

  // Save routine to routines table
  const saveRoutineToGoals = async () => {
    try {
      setSavingRoutine(true);

      if (!routineName) {
        addToast("Please enter a name for your routine.", 'warning');
        setSavingRoutine(false);
        return;
      }

      if (!selectedGoalType) {
        addToast("Please select a goal type for your routine.", 'warning');
        setSavingRoutine(false);
        return;
      }

      if (!targetDate) {
        addToast("Please select a target date for your routine.", 'warning');
        setSavingRoutine(false);
        return;
      }

      if (routines.length === 0) {
        addToast("Please add at least one exercise to your routine.", 'warning');
        setSavingRoutine(false);
        return;
      }

      if (routines.length > 5) {
        addToast("You can only add up to 5 exercises to a routine.", 'warning');
        setSavingRoutine(false);
        return;
      }

      // Prepare exercises data for the API
      const exercisesData = routines.map(r => ({
        exercise_id: r.exercise.exercise_id,
        name: r.exercise.name,
        sets: r.sets,
        reps: r.reps,
        duration: r.duration
      }));

      // Save to the new routines table and set as active
      const response = await axios.post('http://localhost:5000/api/workouts/save_routine', {
        user_id: currentUserId,
        title: routineName,
        goal_type: selectedGoalType,
        target_date: targetDate.toISOString().split('T')[0],
        status: 'Active', // Set as active routine
        exercises: exercisesData
      });

      if (response.data.success) {
        // Close the dialog
        setShowSaveRoutineDialog(false);

        // Reset form fields
        setRoutineName("");
        setSelectedGoalType("");
        setTargetDate(null);

        // Clear the added exercises section
        setRoutines([]);

        // Show success message
        addToast("Routine saved successfully and activated!", 'success');

        // Get the newly created routine ID
        const newRoutineId = response.data.routine_id;

        try {
          // Directly fetch the newly created routine
          const routineResponse = await axios.get(`http://localhost:5000/api/workouts/fetch_user_routines/${currentUserId}`);

          if (routineResponse.data && routineResponse.data.length > 0) {
            // Find the newly created routine
            const newRoutine = routineResponse.data.find(routine => routine.routine_id === newRoutineId);

            // Set it as the active routine
            if (newRoutine) {
              setActiveRoutine(newRoutine);
            }

            // Update userRoutines state
            setUserRoutines(routineResponse.data);
          }
        } catch (error) {
          console.error("Error fetching updated routines:", error);
        }
      }

      setSavingRoutine(false);
    } catch (error) {
      console.error("Error saving routine:", error);
      addToast("Failed to save routine. Please try again.", 'error');
      setSavingRoutine(false);
    }
  };

  // Complete an exercise from the active routine
  const completeActiveExercise = async (exerciseId, exerciseName, difficulty) => {
    try {
      setCompletingActiveExercise(exerciseId);

      // Calculate points based on difficulty level
      let pointsEarned = 0;
      if (difficulty === 'Beginner') {
        pointsEarned = 10;
      } else if (difficulty === 'Intermediate') {
        pointsEarned = 20;
      } else if (difficulty === 'Advanced') {
        pointsEarned = 30;
      }

      // Get the current date and time for the log
      const today = new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString();

      // Create a new log entry
      const logResponse = await axios.post('http://localhost:5000/api/workouts/log_workout', {
        user_id: currentUserId,
        exercise_id: exerciseId,
        log_date: today,
        is_completed: true,
        calories_burned: pointsEarned,
        notes: `Completed from active routine: ${activeRoutine.title}`,
        created_at: currentTimestamp
      });

      if (logResponse.data) {
        // Add to completed exercises
        const updatedCompletedExercises = [...completedExercises, exerciseId];
        setCompletedExercises(updatedCompletedExercises);

        // Save to localStorage
        localStorage.setItem('completedExercises', JSON.stringify(updatedCompletedExercises));

        // Show success toast
        addToast(`"${exerciseName}" completed! You earned ${pointsEarned} points.`, 'success');

        // Refresh logs and update points
        fetchWorkoutLogs();
        calculateUserPoints();
      }
    } catch (error) {
      console.error("Error completing active exercise:", error);
      addToast("Failed to complete exercise. Please try again.", 'error');
    } finally {
      setCompletingActiveExercise(null);
    }
  };

  // Skip an exercise from the active routine
  const skipActiveExercise = async (exerciseId, exerciseName) => {
    try {
      setSkippingActiveExercise(exerciseId);

      // Get the current date and time for the log
      const today = new Date().toISOString().split('T')[0];
      const currentTimestamp = new Date().toISOString();

      // Create a log entry for the skipped exercise
      const logResponse = await axios.post('http://localhost:5000/api/workouts/log_workout', {
        user_id: currentUserId,
        exercise_id: exerciseId,
        log_date: today,
        is_completed: false,
        notes: `Skipped from active routine: ${activeRoutine.title}`,
        created_at: currentTimestamp
      });

      if (logResponse.data) {
        // Add to completed exercises (skipped still counts as "done" for the day)
        const updatedCompletedExercises = [...completedExercises, exerciseId];
        setCompletedExercises(updatedCompletedExercises);

        // Save to localStorage
        localStorage.setItem('completedExercises', JSON.stringify(updatedCompletedExercises));

        // Show info toast
        addToast(`"${exerciseName}" skipped and added to logs.`, 'info');

        // Refresh logs
        fetchWorkoutLogs();
      }
    } catch (error) {
      console.error("Error skipping active exercise:", error);
      addToast("Failed to skip exercise. Please try again.", 'error');
    } finally {
      setSkippingActiveExercise(null);
    }
  };

  // Redo a completed exercise
  const redoExercise = (exerciseId) => {
    // Remove from completed exercises
    const updatedCompletedExercises = completedExercises.filter(id => id !== exerciseId);
    setCompletedExercises(updatedCompletedExercises);

    // Save to localStorage
    localStorage.setItem('completedExercises', JSON.stringify(updatedCompletedExercises));

    // Show info toast
    addToast("Exercise reset. You can complete it again.", 'info');
  };

  // Activate a routine
  const activateRoutine = async (routineId) => {
    try {
      // Use the new activate_routine endpoint to handle activation
      const response = await axios.post('http://localhost:5000/api/workouts/activate_routine', {
        user_id: currentUserId,
        routine_id: routineId
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to activate routine");
      }

      // Find the selected routine
      const selectedRoutine = userRoutines.find(routine => routine.routine_id === routineId);

      // Update the active routine
      setActiveRoutine(selectedRoutine);

      // Reset completed exercises when activating a new routine
      setCompletedExercises([]);
      localStorage.setItem('completedExercises', JSON.stringify([]));

      // Update the status in the UI
      const updatedRoutines = userRoutines.map(routine => ({
        ...routine,
        status: routine.routine_id === routineId ? 'Active' : 'Not In Use'
      }));

      setUserRoutines(updatedRoutines);

      if (selectedRoutine && selectedRoutine.description) {
        try {
          // Parse the exercise details from the description
          const exerciseDetails = JSON.parse(selectedRoutine.description);

          // Clear existing routines
          setRoutines([]);

          // Add exercises to routines
          if (Array.isArray(exerciseDetails)) {
            // Limit to 5 exercises
            const limitedExercises = exerciseDetails.slice(0, 5);

            // Show warning if exercises were truncated
            if (exerciseDetails.length > 5) {
              addToast(`Only the first 5 exercises were loaded from this routine. The routine had ${exerciseDetails.length} exercises, but the maximum allowed is 5.`, 'warning');
            }

            const newRoutines = limitedExercises.map(item => {
              return {
                id: Date.now() + Math.random(), // Ensure unique IDs
                exercise: {
                  name: item.name,
                  exercise_id: item.exercise_id,
                  // Add other exercise properties if available
                  difficulty_level: item.difficulty_level || 'Intermediate',
                  muscle_group: item.muscle_group || 'General',
                },
                sets: item.sets,
                reps: item.reps,
                duration: item.duration,
                day_of_week: "Monday", // Default day
                is_completed: false,
                log_id: null,
                isEdited: false,
                isConfirmed: true // Auto-confirm
              };
            });

            setRoutines(newRoutines);
          } else {
            // If the description is in the old format (just a string of exercise names)
            const exerciseNames = selectedRoutine.description.replace('Routine includes: ', '').split(', ');

            // Limit to 5 exercises
            const limitedExerciseNames = exerciseNames.slice(0, 5);

            // Show warning if exercises were truncated
            if (exerciseNames.length > 5) {
              addToast(`Only the first 5 exercises were loaded from this routine. The routine had ${exerciseNames.length} exercises, but the maximum allowed is 5.`, 'warning');
            }

            // Try to find these exercises in allExercises
            const newRoutines = limitedExerciseNames.map(name => {
              const exercise = allExercises.find(ex => ex.name === name) || {
                name: name,
                exercise_id: null,
                difficulty_level: 'Intermediate',
                muscle_group: 'General'
              };

              return {
                id: Date.now() + Math.random(),
                exercise: exercise,
                sets: 3,
                reps: '8-12',
                duration: '30 sec',
                day_of_week: "Monday",
                is_completed: false,
                log_id: null,
                isEdited: false,
                isConfirmed: true
              };
            });

            setRoutines(newRoutines);
          }
        } catch (error) {
          console.error("Error parsing routine description:", error);
          addToast("Could not load exercises from the routine.", 'error');
        }
      }

      // Refresh user routines
      fetchUserSavedRoutines();

      // Show success message
      addToast("Routine activated successfully!", 'success');
    } catch (error) {
      console.error("Error activating routine:", error);
      addToast("Failed to activate routine. Please try again.", 'error');
    }
  };

  // Save workout plan to database
  const saveWorkoutPlan = async () => {
    // Show the save routine dialog
    setRoutineName(workoutPlan.name || "My Custom Routine");
    setSelectedGoalType(workoutPlan.goal_type || "General Fitness");
    setTargetDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Default to 30 days from now
    setShowSaveRoutineDialog(true);
  };



  // Function to format date for logs with more detailed time periods
  const formatLogDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    }
  };

  // State for workout recommendations
  const [recommendedWorkouts, setRecommendedWorkouts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const recommendationsRef = useRef(null);

  // Generate random workout recommendations based on current goal
  const generateRecommendations = useCallback(() => {
    if (!allExercises.length || !workoutPlan.goal_type) return;

    setLoadingRecommendations(true);

    // Create a mapping between goal types and relevant exercise categories/muscle groups
    const goalToExerciseMapping = {
      "Strength Training": ["strength", "power", "resistance", "weight", "muscle building", "bodybuilding"],
      "Weight Loss": ["cardio", "hiit", "fat burn", "calorie burn", "aerobic"],
      "Muscle Building": ["hypertrophy", "muscle", "bulk", "strength", "resistance"],
      "Endurance": ["endurance", "cardio", "stamina", "aerobic"],
      "Flexibility": ["flexibility", "stretching", "mobility", "yoga"],
      "General Fitness": ["full body", "functional", "conditioning", "circuit"],
      "Cardiovascular": ["cardio", "heart", "aerobic", "running", "cycling"],
      "Core Strength": ["core", "abs", "abdominal", "obliques", "trunk"],
      "Upper Body": ["chest", "arms", "shoulders", "back", "upper body"],
      "Lower Body": ["legs", "quads", "hamstrings", "glutes", "calves", "lower body"]
    };

    // Find relevant keywords for current goal type
    let goalKeywords = [];
    const goalTypeLower = workoutPlan.goal_type.toLowerCase();

    // Find exact match first
    for (const [goalType, keywords] of Object.entries(goalToExerciseMapping)) {
      if (goalType.toLowerCase() === goalTypeLower) {
        goalKeywords = keywords;
        break;
      }
    }

    // If no exact match, find partial matches
    if (goalKeywords.length === 0) {
      for (const [goalType, keywords] of Object.entries(goalToExerciseMapping)) {
        const parts = goalType.toLowerCase().split(" ");
        if (parts.some(part => goalTypeLower.includes(part))) {
          goalKeywords = [...goalKeywords, ...keywords];
        }
      }
    }

    // If still no match, use general fitness keywords as fallback
    if (goalKeywords.length === 0) {
      goalKeywords = goalToExerciseMapping["General Fitness"];
    }

    // Add the goal type itself and its individual words as keywords
    goalKeywords.push(goalTypeLower);
    goalTypeLower.split(" ").forEach(word => {
      if (word.length > 3) goalKeywords.push(word);
    });

    // Remove duplicates
    goalKeywords = [...new Set(goalKeywords)];

    console.log("Goal keywords for filtering:", goalKeywords);

    // Filter exercises that match current goal type
    let matchingExercises = allExercises.filter(ex => {
      // Match exercise category or muscle group with goal keywords
      const categoryMatch = ex.category_name && goalKeywords.some(keyword =>
        ex.category_name.toLowerCase().includes(keyword)
      );
      const muscleMatch = ex.muscle_group && goalKeywords.some(keyword =>
        ex.muscle_group.toLowerCase().includes(keyword)
      );
      const nameMatch = ex.name && goalKeywords.some(keyword =>
        ex.name.toLowerCase().includes(keyword)
      );

      return categoryMatch || muscleMatch || nameMatch;
    });

    // If not enough matching exercises, add some exercises with matching difficulty
    if (matchingExercises.length < 15) {
      const difficultyMatches = allExercises.filter(ex =>
        ex.difficulty_level && ex.difficulty_level.toLowerCase() === workoutPlan.difficulty_level.toLowerCase() &&
        !matchingExercises.includes(ex)
      );

      // Add some difficulty matches, but prioritize the goal matches
      matchingExercises = [...matchingExercises, ...difficultyMatches.slice(0, 15)];
    }

    // If still not enough exercises, use all exercises as fallback
    if (matchingExercises.length < 9) {
      console.log("Not enough matching exercises, using all exercises");
      matchingExercises = [...allExercises];
    }

    console.log(`Found ${matchingExercises.length} exercises matching goal "${workoutPlan.goal_type}"`);

    // Create 3-5 workout plans
    const plans = [];
    const numPlans = Math.floor(Math.random() * 3) + 3; // 3-5 plans

    for (let i = 0; i < numPlans; i++) {
      // For each plan, select 3 random exercises
      const planExercises = [];

      // Ensure we don't pick the same exercise twice in a plan
      const usedIndices = new Set();

      for (let j = 0; j < 3; j++) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * matchingExercises.length);
        } while (usedIndices.has(randomIndex) && usedIndices.size < matchingExercises.length);

        usedIndices.add(randomIndex);
        const exercise = matchingExercises[randomIndex];

        // Generate random sets, reps and duration based on difficulty
        let sets, reps, duration;

        if (exercise.difficulty_level === "Beginner") {
          sets = Math.floor(Math.random() * 2) + 2; // 2-3
          reps = ["8-12", "10-15", "12-15"][Math.floor(Math.random() * 3)];
          duration = ["20 sec", "30 sec"][Math.floor(Math.random() * 2)];
        } else if (exercise.difficulty_level === "Advanced") {
          sets = Math.floor(Math.random() * 2) + 4; // 4-5
          reps = ["5-8", "6-10", "8-12"][Math.floor(Math.random() * 3)];
          duration = ["45 sec", "60 sec", "90 sec"][Math.floor(Math.random() * 3)];
        } else {
          sets = Math.floor(Math.random() * 2) + 3; // 3-4
          reps = ["8-12", "10-15", "12-15"][Math.floor(Math.random() * 3)];
          duration = ["30 sec", "45 sec", "60 sec"][Math.floor(Math.random() * 3)];
        }

        planExercises.push({
          exercise,
          sets,
          reps,
          duration
        });
      }

      // Create a more descriptive plan name based on the exercises
      const muscleGroups = new Set();
      planExercises.forEach(item => {
        if (item.exercise.muscle_group) {
          item.exercise.muscle_group.split(',').forEach(mg =>
            muscleGroups.add(mg.trim())
          );
        }
      });

      let planName;
      if (muscleGroups.size > 0) {
        // Use up to 2 muscle groups in the plan name
        const muscleGroupsList = Array.from(muscleGroups).slice(0, 2);
        planName = `${muscleGroupsList.join(" & ")} ${workoutPlan.goal_type}`;
      } else {
        planName = `${workoutPlan.goal_type} Plan ${i+1}`;
      }

      plans.push({
        id: Date.now() + i,
        name: planName,
        exercises: planExercises,
      });
    }

    setRecommendedWorkouts(plans);
    setLoadingRecommendations(false);
  }, [allExercises, workoutPlan.goal_type, workoutPlan.difficulty_level]);

  // Generate recommendations when exercises load or goal changes
  useEffect(() => {
    if (allExercises.length > 0 && workoutPlan.goal_type) {
      generateRecommendations();
    }
  }, [allExercises, workoutPlan.goal_type, generateRecommendations]);

  // Scroll recommendation carousel
  const scrollRecommendations = (direction) => {
    if (recommendationsRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      recommendationsRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Add a full workout plan to routines
  const addWorkoutPlanToRoutines = (plan) => {
    if (!plan || !plan.exercises || plan.exercises.length === 0) return;

    // Check if adding these exercises would exceed the 5-exercise limit
    if (routines.length + plan.exercises.length > 5) {
      addToast(`Cannot add all exercises from this plan. You can only have a maximum of 5 exercises in your routine. You currently have ${routines.length} exercises.`, 'warning');
      return;
    }

    const newRoutines = plan.exercises.map(item => {
      return {
        id: Date.now() + Math.random(), // Ensure unique IDs
        exercise: item.exercise,
        sets: item.sets,
        reps: item.reps,
        duration: item.duration,
        day_of_week: "Monday", // Default day
        is_completed: false,
        log_id: null,
        isEdited: false,      // Skip edit state
        isConfirmed: true     // Auto-confirm
      };
    });

    setRoutines([...routines, ...newRoutines]);

    // Show success toast
    addToast(`Added ${plan.name} with ${plan.exercises.length} exercises to your routine`, 'success');
  };

  // Pause auto-scrolling when mouse is over the carousel
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const handleMouseEnter = () => setAutoScrollPaused(true);
  const handleMouseLeave = () => setAutoScrollPaused(false);

  // Add auto-scrolling for workout recommendations
  useEffect(() => {
    let autoScrollTimer;

    // Only auto-scroll if we have recommendations, the component is mounted, and not paused
    if (recommendationsRef.current && recommendedWorkouts.length > 0 && !loadingRecommendations && !autoScrollPaused) {
      autoScrollTimer = setInterval(() => {
        if (recommendationsRef.current) {
          const scrollElement = recommendationsRef.current;
          const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth;

          if (scrollElement.scrollLeft >= maxScrollLeft - 20) {
            // If we're near the end, reset to beginning with animation
            scrollElement.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Otherwise scroll by one card width
            scrollElement.scrollBy({ left: 270, behavior: 'smooth' });
          }
        }
      }, 5000); // Scroll every 5 seconds
    }

    // Cleanup on component unmount
    return () => {
      if (autoScrollTimer) {
        clearInterval(autoScrollTimer);
      }
    };
  }, [recommendedWorkouts, loadingRecommendations, autoScrollPaused]);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Workout Planner</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setShowGyms(!showGyms)}
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span>Looking for gyms?</span>
        </Button>
      </div>

      {/* Gyms Section */}
      {showGyms && (
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl">Our Affiliated Gyms</CardTitle>
                <CardDescription>Find a gym near you to start your fitness journey</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowGyms(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingGyms ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : gyms.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No gyms found. Please try again later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gyms.map(gym => (
                  <div
                    key={gym.gym_id}
                    className="border rounded-lg overflow-hidden hover:shadow-md hover:shadow-primary/20 hover:border-primary/30 group"
                  >
                    <div className="flex h-32">
                      {/* Left side - Image */}
                      <div className="w-2/5 bg-muted relative overflow-hidden">
                        {gym.logo_url ? (
                          <img
                            src={gym.logo_url}
                            alt={`${gym.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Building className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100"></div>
                      </div>

                      {/* Right side - Content */}
                      <div className="w-3/5 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base mb-2 line-clamp-1 group-hover:text-primary">{gym.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 group-hover:text-gray-700">{gym.address}</p>
                        </div>

                        <div className="flex justify-start mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 px-3 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary hover:shadow-md hover:shadow-primary/20 relative overflow-hidden group-hover:border-primary"
                            onClick={() => {
                              setSelectedGym(gym);
                              setShowGymDetails(true);
                            }}
                          >
                            <span className="relative z-10">Show Details</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Top section - Goal selection and Routines in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left column - Goal selection and recommended exercises */}
        <Card className="overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-7 w-7 mr-2 text-primary" />
              <CardTitle className="text-2xl font-bold">My Goal</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {/* Circular progress widget for active routine completion */}
                {activeRoutine && (() => {
                  try {
                    // Try to parse the description as JSON to count exercises
                    const exerciseDetails = JSON.parse(activeRoutine.description);
                    if (Array.isArray(exerciseDetails) && exerciseDetails.length > 0) {
                      const totalExercises = exerciseDetails.length;
                      const completedCount = exerciseDetails.filter(ex =>
                        completedExercises.includes(parseInt(ex.exercise_id))
                      ).length;

                      // Calculate percentage
                      const percentage = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

                      // Get color based on user level
                      const color = userPoints.level <= 2 ? 'rgb(22, 163, 74)' : // Rookie - Green
                                   userPoints.level <= 4 ? 'rgb(59, 130, 246)' : // Contender - Blue
                                   userPoints.level <= 6 ? 'rgb(139, 92, 246)' : // Challenger - Purple
                                   userPoints.level <= 9 ? 'rgb(245, 158, 11)' : // Veteran - Amber
                                   'rgb(239, 68, 68)'; // Overachiever - Red

                      return (
                        <div className="relative w-12 h-12 flex items-center justify-center mr-1 group">
                          {/* Background circle */}
                          <div className="absolute inset-0 rounded-full bg-muted/50"></div>

                          {/* Progress circle */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-500">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              strokeWidth="4"
                              stroke={`${color}40`}
                              fill="none"
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              strokeWidth="4"
                              stroke={color}
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
                              className="transition-all duration-700"
                            />
                          </svg>

                          {/* Glow effect */}
                          <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                            style={{
                              boxShadow: `0 0 15px ${color}`,
                              animation: 'pulse 2s infinite'
                            }}
                          ></div>

                          {/* Text in center */}
                          <div className="relative z-10 text-xs font-bold">
                            {completedCount}/{totalExercises}
                          </div>
                        </div>
                      );
                    }
                  } catch (e) {
                    // If parsing fails, don't show counter
                    return null;
                  }
                })()}

                <div
                  className={`relative px-4 py-2 rounded-full text-base font-medium flex items-center group shadow-md transition-all duration-500`}
                  style={{
                    backgroundColor:
                      userPoints.level <= 2 ? 'rgba(22, 163, 74, 0.15)' : // Rookie - Green
                      userPoints.level <= 4 ? 'rgba(59, 130, 246, 0.15)' : // Contender - Blue
                      userPoints.level <= 6 ? 'rgba(139, 92, 246, 0.15)' : // Challenger - Purple
                      userPoints.level <= 9 ? 'rgba(245, 158, 11, 0.15)' : // Veteran - Amber
                      'rgba(239, 68, 68, 0.15)', // Overachiever - Red
                    color:
                      userPoints.level <= 2 ? 'rgb(22, 163, 74)' : // Rookie - Green
                      userPoints.level <= 4 ? 'rgb(59, 130, 246)' : // Contender - Blue
                      userPoints.level <= 6 ? 'rgb(139, 92, 246)' : // Challenger - Purple
                      userPoints.level <= 9 ? 'rgb(245, 158, 11)' : // Veteran - Amber
                      'rgb(239, 68, 68)', // Overachiever - Red
                    borderLeft:
                      userPoints.level <= 2 ? '4px solid rgb(22, 163, 74)' : // Rookie - Green
                      userPoints.level <= 4 ? '4px solid rgb(59, 130, 246)' : // Contender - Blue
                      userPoints.level <= 6 ? '4px solid rgb(139, 92, 246)' : // Challenger - Purple
                      userPoints.level <= 9 ? '4px solid rgb(245, 158, 11)' : // Veteran - Amber
                      '4px solid rgb(239, 68, 68)', // Overachiever - Red
                    boxShadow:
                      userPoints.level <= 2 ? '0 0 15px rgba(22, 163, 74, 0.3)' : // Rookie - Green
                      userPoints.level <= 4 ? '0 0 15px rgba(59, 130, 246, 0.3)' : // Contender - Blue
                      userPoints.level <= 6 ? '0 0 15px rgba(139, 92, 246, 0.3)' : // Challenger - Purple
                      userPoints.level <= 9 ? '0 0 15px rgba(245, 158, 11, 0.3)' : // Veteran - Amber
                      '0 0 15px rgba(239, 68, 68, 0.3)', // Overachiever - Red
                  }}
                >
                  {/* Shining loop animation */}
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shine_10s_linear_infinite] overflow-hidden"
                    style={{
                      backgroundSize: '200% 100%',
                    }}
                  ></div>
                  <div className="relative flex items-center">
                    <span className="mr-2 text-white font-bold">Level {userPoints.level}</span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold text-white shadow-sm transition-all duration-300"
                      style={{
                        backgroundColor:
                          userPoints.level <= 2 ? 'rgba(22, 163, 74, 0.25)' : // Rookie - Green
                          userPoints.level <= 4 ? 'rgba(59, 130, 246, 0.25)' : // Contender - Blue
                          userPoints.level <= 6 ? 'rgba(139, 92, 246, 0.25)' : // Challenger - Purple
                          userPoints.level <= 9 ? 'rgba(245, 158, 11, 0.25)' : // Veteran - Amber
                          'rgba(255, 37, 37, 0.25)', // Overachiever - Red
                        boxShadow:
                          userPoints.level <= 2 ? '0 0 8px rgba(22, 163, 74, 0.4)' : // Rookie - Green
                          userPoints.level <= 4 ? '0 0 8px rgba(59, 130, 246, 0.4)' : // Contender - Blue
                          userPoints.level <= 6 ? '0 0 8px rgba(139, 92, 246, 0.4)' : // Challenger - Purple
                          userPoints.level <= 9 ? '0 0 8px rgba(245, 158, 11, 0.4)' : // Veteran - Amber
                          '0 0 8px rgba(239, 68, 68, 0.4)', // Overachiever - Red
                      }}
                    >
                      {userPoints.rank}
                    </span>
                  </div>
                </div>

                {/* Add keyframes for pulse animation */}
                <style jsx>{`
                  @keyframes pulse {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                    100% { opacity: 0.3; }
                  }
                `}</style>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {loadingWorkoutGoals ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  {activeWorkoutPlanId && !changingGoal ? (
                    // Display current active goal without animation
                    <div className="p-4 bg-muted rounded-md hover:shadow-md transition-all border border-transparent hover:border-primary/20 relative overflow-hidden group">


                      {workoutGoals.map(goal => {
                        if (goal.id === activeWorkoutPlanId.toString()) {
                          return (
                            <div key={goal.id} className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-primary relative inline-block">
                                  <span className="relative z-10">{goal.name}</span>
                                </h2>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setChangingGoal(true)}
                                  className="text-xs hover:bg-primary hover:text-white transition-all hover:scale-105 active:scale-95 shadow-sm hover:shadow relative overflow-hidden group/btn"
                                >
                                  <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                  <span className="relative z-10">Change Goal</span>
                                </Button>
                              </div>
                              <p className="text-sm"><span className="font-medium">Description:</span> {goal.description}</p>
                              <p className="text-sm"><span className="font-medium">Goal Type:</span> {goal.goal_type}</p>
                              <div className="flex items-center">
                                <span className="text-sm font-medium mr-2">Difficulty:</span>
                                <span className="text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105"
                                  style={{
                                    backgroundColor: goal.difficulty_level === 'Beginner' ? 'rgba(22, 101, 52, 0.8)' :
                                                  goal.difficulty_level === 'Intermediate' ? 'rgba(133, 77, 14, 0.8)' :
                                                  goal.difficulty_level === 'Advanced' ? 'rgba(153, 27, 27, 0.8)' : 'rgba(55, 65, 81, 0.8)',
                                    color: 'white'
                                  }}
                                >
                                  {goal.difficulty_level}
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  ) : (
                    // Goal selection UI
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <Select
                        value={selectedGoal}
                        onValueChange={(value) => {
              setSelectedGoal(value);
                        }}
                      >
                        <SelectTrigger className="w-full animate-in fade-in slide-in-from-top-3 duration-300">
                          <SelectValue placeholder="Select a workout plan" />
              </SelectTrigger>
              <SelectContent>
                {workoutGoals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Display selected goal details */}
            {selectedGoal && (
                        <div className="mt-4 p-4 bg-muted rounded-md border border-transparent hover:border-primary/20 relative overflow-hidden">
                {workoutGoals.map(goal => {
                  if (goal.id === selectedGoal) {
                    return (
                                <div key={goal.id} className="space-y-3">
                                  <h2 className="text-xl font-bold text-primary relative inline-block">
                                    <span className="relative z-10">{goal.name}</span>
                                  </h2>
                                  <p className="text-sm"><span className="font-medium">Description:</span> {goal.description}</p>
                                  <p className="text-sm"><span className="font-medium">Goal Type:</span> {goal.goal_type}</p>
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium mr-2">Difficulty:</span>
                                    <span className="text-xs px-2 py-1 rounded-full"
                                      style={{
                                        backgroundColor: goal.difficulty_level === 'Beginner' ? 'rgba(22, 101, 52, 0.8)' :
                                                      goal.difficulty_level === 'Intermediate' ? 'rgba(133, 77, 14, 0.8)' :
                                                      goal.difficulty_level === 'Advanced' ? 'rgba(153, 27, 27, 0.8)' : 'rgba(55, 65, 81, 0.8)',
                                        color: 'white'
                                      }}
                                    >
                                      {goal.difficulty_level}
                                    </span>
                                  </div>
                      </div>
                    );
                  }
                  return null;
                })}

                          <div className="mt-6 flex justify-end">
                            {changingGoal && (
              <Button
                variant="outline"
                                size="sm"
                                onClick={() => setChangingGoal(false)}
                                className="mr-2 hover:bg-muted/80"
              >
                                <span className="relative z-10">Cancel</span>
              </Button>
                            )}
                            <Button
                              onClick={() => saveWorkoutGoal(selectedGoal)}
                              className="bg-primary text-white hover:bg-primary/90"
                              disabled={!selectedGoal}
                            >
                              <span className="relative z-10">{changingGoal ? 'Update Goal' : 'Set as My Goal'}</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Workout Recommendations */}
                {activeWorkoutPlanId && !changingGoal && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold flex items-center">
                        <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                        Workout recommendations for today
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateRecommendations}
                        className="h-8 w-8 p-0 rounded-full text-primary hover:text-primary/80 hover:bg-primary/10 transition-all duration-300 hover:rotate-180"
                        disabled={loadingRecommendations}
                      >
                        {loadingRecommendations ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-primary"></div>
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      </div>

                    {/* Carousel Controls */}
                    <div className="relative">
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => scrollRecommendations('left')}
                      >
                      <Button
                          variant="ghost"
                        size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 shadow-md"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                      </div>

                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => scrollRecommendations('right')}
                      >
                        <Button
                        variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full bg-background/70 backdrop-blur-sm hover:bg-background/90 shadow-md"
                      >
                          <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>

                      {/* Scrollable Carousel */}
                      <div
                        ref={recommendationsRef}
                        className="flex overflow-x-auto pb-4 pt-2 px-1 hide-scrollbar snap-x snap-mandatory space-x-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onWheel={(e) => {
                          // Enable horizontal scrolling with mouse wheel
                          if (recommendationsRef.current) {
                            e.preventDefault();
                            recommendationsRef.current.scrollLeft += e.deltaY;
                          }
                        }}
                      >
                        {loadingRecommendations ? (
                          <div className="flex justify-center items-center min-w-[250px] h-[220px] border rounded-md animate-pulse">
                            <Dumbbell className="h-10 w-10 text-muted-foreground animate-bounce" />
                          </div>
                        ) : recommendedWorkouts.length === 0 ? (
                          <div className="flex justify-center items-center min-w-[250px] h-[220px] border rounded-md">
                            <p className="text-muted-foreground text-sm">No recommendations available</p>
                          </div>
                        ) : (
                          recommendedWorkouts.map((plan, index) => (
                            <div
                              key={plan.id}
                              className="min-w-[250px] border rounded-lg p-3 hover:shadow-lg transition-all duration-300 hover:border-primary/30 snap-start bg-card flex flex-col animate-in fade-in slide-in-from-right-10 group/card relative"
                              style={{
                                animationDelay: `${index * 100}ms`,
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.zIndex = '10';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.zIndex = '1';
                                e.currentTarget.style.boxShadow = '';
                              }}
                            >
                              <div className="text-center mb-2 pb-2 border-b">
                                <h4 className="font-medium text-sm">{plan.name}</h4>
                                <p className="text-xs text-muted-foreground">{plan.exercises.length} exercises</p>
                              </div>

                              <div className="flex-1">
                                <ul className="space-y-2 text-sm">
                                  {plan.exercises.map((item, i) => (
                                    <li key={i} className="text-xs flex items-start">
                                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5 mr-2">
                                        {i + 1}
                                      </div>
                                      <div>
                                        <p className="font-medium line-clamp-1">{item.exercise.name}</p>
                                        <p className="text-muted-foreground flex flex-wrap gap-1">
                                          <span>{item.sets} sets</span>•
                                          <span>{item.reps} reps</span>•
                                          <span>{item.duration}</span>
                                        </p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                </div>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addWorkoutPlanToRoutines(plan)}
                                className="mt-3 w-full hover:bg-primary hover:text-white transition-all duration-300"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Plan
                              </Button>
                </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Styling to hide scrollbar */}
                    <style jsx>{`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                      }
                      @keyframes slide {
                        0% { transform: translateX(0); }
                        50% { transform: translateX(200%); }
                        100% { transform: translateX(400%); }
                      }
                    `}</style>
            </div>
          )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Right column - Routines Card */}
        <Card className="overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Dumbbell className="h-7 w-7 mr-2 text-primary" />
                <CardTitle className="text-2xl font-bold">My Routines</CardTitle>
              </div>

              {activeRoutine && (
                <div className="flex items-center">
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-medium animate-pulse shadow-sm shadow-primary/20 border border-primary/30 flex items-center">
                    <Play className="h-3 w-3 mr-1.5" />
                    Active: {activeRoutine.title}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden" style={{ maxHeight: '450px' }}>
            {/* Main scrollable container */}
            <div className="relative h-full">
              {/* Scrollable content area for both active routine and added exercises */}
              <div className="h-full overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {/* Display active routine exercises */}
                {activeRoutine && (
                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 shadow-md shadow-primary/10">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-base flex items-center">
                        <Play className="h-4 w-4 mr-1.5 text-primary" />
                        Active Routine: {activeRoutine.title}
                        {(() => {
                          try {
                            // Try to parse the description as JSON to count exercises
                            const exerciseDetails = JSON.parse(activeRoutine.description);
                            if (Array.isArray(exerciseDetails) && exerciseDetails.length > 0) {
                              const totalExercises = exerciseDetails.length;
                              const completedCount = exerciseDetails.filter(ex =>
                                completedExercises.includes(parseInt(ex.exercise_id))
                              ).length;

                              return (
                                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                  {completedCount}/{totalExercises}
                                </span>
                              );
                            }
                          } catch (e) {
                            // If parsing fails, don't show counter
                            return null;
                          }
                        })()}
                      </h3>

                      {/* Days remaining */}
                      {activeRoutine.target_date && (
                        <div className="text-xs text-muted-foreground">
                          {(() => {
                            const targetDate = new Date(activeRoutine.target_date);
                            const today = new Date();
                            const diffTime = targetDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays > 0) {
                              return (
                                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                                  {diffDays} days remaining
                                </span>
                              );
                            } else if (diffDays === 0) {
                              return (
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                                  Due today
                                </span>
                              );
                            } else {
                              return (
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                                  Overdue by {Math.abs(diffDays)} days
                                </span>
                              );
                            }
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Active routine exercises list */}
                    <div className="space-y-2 mt-2">
                      {(() => {
                        try {
                          // Try to parse the description as JSON
                          const exerciseDetails = JSON.parse(activeRoutine.description);
                          if (Array.isArray(exerciseDetails) && exerciseDetails.length > 0) {
                            return exerciseDetails.map((exercise, index) => {
                              const isCompleted = completedExercises.includes(parseInt(exercise.exercise_id));

                              return (
                                <div
                                  key={index}
                                  className={`flex justify-between items-center p-2 rounded border
                                    ${isCompleted
                                      ? 'bg-muted/50 border-muted'
                                      : 'bg-background border-border'}`}
                                >
                                  <div className={isCompleted ? 'opacity-60' : ''}>
                                    <p className="font-medium text-sm flex items-center">
                                      {exercise.name}
                                      {isCompleted && (
                                        <Check className="h-3.5 w-3.5 ml-1.5 text-green-600" />
                                      )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {exercise.sets} sets • {exercise.reps} reps • {exercise.duration}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {isCompleted ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => redoExercise(parseInt(exercise.exercise_id))}
                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 w-7 p-0"
                                        title="Redo exercise"
                                      >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                      </Button>
                                    ) : (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => completeActiveExercise(
                                            parseInt(exercise.exercise_id),
                                            exercise.name,
                                            exercise.difficulty_level
                                          )}
                                          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7 p-0"
                                          disabled={completingActiveExercise === parseInt(exercise.exercise_id)}
                                          title="Complete and remove"
                                        >
                                          {completingActiveExercise === parseInt(exercise.exercise_id) ? (
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-green-600"></div>
                                          ) : (
                                            <Check className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => skipActiveExercise(
                                            parseInt(exercise.exercise_id),
                                            exercise.name
                                          )}
                                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-7 w-7 p-0"
                                          disabled={skippingActiveExercise === parseInt(exercise.exercise_id)}
                                          title="Skip"
                                        >
                                          {skippingActiveExercise === parseInt(exercise.exercise_id) ? (
                                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-amber-600"></div>
                                          ) : (
                                            <SkipForward className="h-3.5 w-3.5" />
                                          )}
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            });
                          } else {
                            return <p className="text-sm text-muted-foreground">No exercises in this routine</p>;
                          }
                        } catch (e) {
                          // If it's not JSON, display exercise names if available
                          if (activeRoutine.exercise_names) {
                            return activeRoutine.exercise_names.split(', ').map((name, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-background rounded border">
                                <p className="font-medium text-sm">{name}</p>
                              </div>
                            ));
                          }
                          return <p className="text-sm text-muted-foreground">No exercises in this routine</p>;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Added exercises section */}
                {routines.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center border rounded-md animate-in fade-in slide-in-from-top-5 duration-300">
                    <p className="text-muted-foreground animate-pulse">Add exercises from the Exercise Library to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {routines.map((routine, index) => (
                  <div
                    key={routine.id}
                    className="p-2 border rounded-md transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-right-5"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm transition-all duration-300 hover:translate-x-1 truncate pr-2">
                          {routine.exercise.name}
                          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full transition-all duration-300 ${routine.is_completed ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {routine.is_completed ? 'Completed' : 'Pending'}
                          </span>
                          {routine.isConfirmed && !routine.is_completed && (
                            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                              Ready
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground transition-all duration-300 hover:translate-x-1 truncate">
                          {routine.exercise.difficulty_level} • {routine.exercise.muscle_group}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant={routine.isConfirmed ? "ghost" : "outline"}
                          onClick={async () => {
                            if (!routine.is_completed && routine.isConfirmed) {
                              // Only proceed if routine is confirmed
                              await completeExerciseAndAddToLogs(routine.id);
                            } else if (!routine.isConfirmed) {
                              addToast("Please confirm routine settings before marking as completed.", 'warning');
                            }
                          }}
                          className={`${routine.isConfirmed ? 'text-green-600 hover:text-green-800 hover:bg-green-50' : 'text-gray-400 hover:text-gray-600'} transition-all duration-300 hover:scale-110 h-7 w-7 p-0`}
                          disabled={routine.is_completed || completingRoutine === routine.id}
                          title={routine.isConfirmed ? "Complete and remove" : "Confirm settings first"}
                        >
                          {completingRoutine === routine.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-green-600"></div>
                          ) : (
                            <Check className="h-3.5 w-3.5 transition-transform duration-300 hover:scale-125" />
                          )}
                          <span className="sr-only">Complete and remove</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExerciseFromRoutine(routine.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-300 hover:scale-110 h-7 w-7 p-0"
                          disabled={removingRoutine === routine.id}
                        >
                          {removingRoutine === routine.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-red-600"></div>
                          ) : (
                            <X className="h-3.5 w-3.5 transition-transform duration-300 hover:rotate-90" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {!routine.isConfirmed ? (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 flex items-end gap-1">
                          <div className="w-1/3">
                            <label className="text-xs font-medium block mb-1">Sets</label>
                          <Select
                            value={routine.sets.toString()}
                            onValueChange={(value) => updateRoutine(routine.id, 'sets', parseInt(value))}
                            disabled={routine.is_completed}
                          >
                              <SelectTrigger className="h-7 text-xs py-0 px-2">
                              <SelectValue placeholder="Sets" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(num => (
                                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                          <div className="w-1/3">
                            <label className="text-xs font-medium block mb-1">Reps</label>
                          <Select
                            value={routine.reps}
                            onValueChange={(value) => updateRoutine(routine.id, 'reps', value)}
                            disabled={routine.is_completed}
                          >
                              <SelectTrigger className="h-7 text-xs py-0 px-2">
                              <SelectValue placeholder="Reps" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5-8">5-8</SelectItem>
                              <SelectItem value="8-12">8-12</SelectItem>
                              <SelectItem value="10-15">10-15</SelectItem>
                              <SelectItem value="15-20">15-20</SelectItem>
                              <SelectItem value="20+">20+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                          <div className="w-1/3">
                            <label className="text-xs font-medium block mb-1">Duration</label>
                          <Select
                            value={routine.duration}
                            onValueChange={(value) => updateRoutine(routine.id, 'duration', value)}
                            disabled={routine.is_completed}
                          >
                              <SelectTrigger className="h-7 text-xs py-0 px-2">
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="20 sec">20 sec</SelectItem>
                              <SelectItem value="30 sec">30 sec</SelectItem>
                              <SelectItem value="45 sec">45 sec</SelectItem>
                              <SelectItem value="60 sec">60 sec</SelectItem>
                              <SelectItem value="90 sec">90 sec</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => confirmRoutineSettings(routine.id)}
                          className="bg-primary text-black hover:bg-primary/90 transition-all duration-300 h-7 px-3 shadow-md hover:shadow-lg hover:shadow-primary/20"
                        >
                          <Save className="h-3.5 w-3.5 mr-1" />
                          <span className="text-xs text-black">Confirm</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted">
                            <span className="font-semibold mr-1">Sets:</span> {routine.sets}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted">
                            <span className="font-semibold mr-1">Reps:</span> {routine.reps}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted">
                            <span className="font-semibold mr-1">Duration:</span> {routine.duration}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
              </div>
            </div>
          </CardContent>
          <div className="px-6 py-3 bg-muted flex justify-between mt-auto">
            <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={saveWorkoutPlan}
              disabled={routines.length === 0}
              className={`bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border-primary/20 hover:border-primary/40 ${
                routines.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={routines.length === 0 ? "Add exercises to save a routine" : "Save your routine"}
            >
                <Save className="h-4 w-4 mr-1" />
              Save Routine
            </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUserRoutines(true)}
                className="hover:bg-muted/80"
              >
                <ListTodo className="h-4 w-4 mr-1" />
                All Saved Routines
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchWorkoutLogs(true)}
            >
              Show Logs
            </Button>
          </div>
        </Card>
      </div>

      {/* Bottom section - Exercise Library */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold">Exercise Library</h2>

          {/* Filter Dropdown */}
          <div className="relative">
            <Button
              id="filter-button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 group"
            >
              <span>Filter</span>
              <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''} group-hover:translate-x-0.5`} />
            </Button>

            {showFilters && (
              <div
                id="filter-dropdown"
                className="absolute right-0 top-full mt-2 w-64 p-4 bg-background border rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-5 duration-300"
              >
                <h3 className="text-lg font-semibold mb-3">Filters</h3>


                {/* Difficulty Level Filter */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Difficulty Level</h4>
                  <div className="space-y-2">
                    <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
                      <input
                        type="checkbox"
                        id="beginner"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                        checked={filters.difficulty.beginner}
                        onChange={() => handleFilterChange('difficulty', 'beginner')}
                      />
                      <label htmlFor="beginner" className="ml-2 text-sm transition-all duration-200 hover:font-medium">Beginner</label>
                    </div>
                    <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
                      <input
                        type="checkbox"
                        id="intermediate"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                        checked={filters.difficulty.intermediate}
                        onChange={() => handleFilterChange('difficulty', 'intermediate')}
                      />
                      <label htmlFor="intermediate" className="ml-2 text-sm transition-all duration-200 hover:font-medium">Intermediate</label>
                    </div>
                    <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
                      <input
                        type="checkbox"
                        id="advanced"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                        checked={filters.difficulty.advanced}
                        onChange={() => handleFilterChange('difficulty', 'advanced')}
                      />
                      <label htmlFor="advanced" className="ml-2 text-sm transition-all duration-200 hover:font-medium">Advanced</label>
                    </div>
                  </div>
                </div>

                {/* Equipment Filter */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Equipment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
                      <input
                        type="checkbox"
                        id="with-equipment"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                        checked={filters.equipment.withEquipment}
                        onChange={() => handleFilterChange('equipment', 'withEquipment')}
                      />
                      <label htmlFor="with-equipment" className="ml-2 text-sm transition-all duration-200 hover:font-medium">With Equipment</label>
                    </div>
                    <div className="flex items-center transition-transform duration-200 hover:translate-x-1">
                      <input
                        type="checkbox"
                        id="without-equipment"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                        checked={filters.equipment.withoutEquipment}
                        onChange={() => handleFilterChange('equipment', 'withoutEquipment')}
                      />
                      <label htmlFor="without-equipment" className="ml-2 text-sm transition-all duration-200 hover:font-medium">Without Equipment</label>
                    </div>
                  </div>
                </div>

                {/* Muscle Group Filter */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Muscle Groups</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {uniqueMuscleGroups.map((muscleGroup) => (
                      <div
                        key={muscleGroup}
                        className="flex items-center transition-transform duration-200 hover:translate-x-1"
                      >
                        <input
                          type="checkbox"
                          id={`muscle-${muscleGroup}`}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary transition-all duration-300"
                          checked={filters.muscleGroups && filters.muscleGroups[muscleGroup] || false}
                          onChange={() => handleFilterChange('muscleGroups', muscleGroup)}
                        />
                        <label htmlFor={`muscle-${muscleGroup}`} className="ml-2 text-sm capitalize transition-all duration-200 hover:font-medium">
                          {muscleGroup}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      // Reset all filters
                      const muscleGroupsReset = {};
                      uniqueMuscleGroups.forEach(group => {
                        muscleGroupsReset[group] = false;
                      });

                      setFilters({
                        difficulty: {
                          beginner: false,
                          intermediate: false,
                          advanced: false
                        },
                        equipment: {
                          withEquipment: false,
                          withoutEquipment: false
                        },
                        muscleGroups: muscleGroupsReset
                      });

                      // Reset sorting
                      setSortOption("none");

                      setShowFilters(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button
                    className="flex-1 transition-all duration-300 hover:scale-105"
                    onClick={() => {
                      applyFilters();
                      setShowFilters(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {loadingExercises ? (
              <div className="flex flex-col justify-center items-center h-40">
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
                  <Dumbbell className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-primary animate-pulse" />
                </div>
                <span className="mt-4 font-medium animate-pulse">Loading exercises...</span>
              </div>
            ) : allExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md animate-in fade-in slide-in-from-bottom-5">
                <div className="mb-2">
                  <Dumbbell className="h-10 w-10 text-muted-foreground animate-bounce" />
                </div>
                <p className="text-muted-foreground">No exercises found in the database.</p>
              </div>
            ) : filteredExercises.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 border rounded-md animate-in fade-in slide-in-from-bottom-5">
                <div className="mb-2">
                  <Dumbbell className="h-10 w-10 text-muted-foreground animate-bounce" />
                </div>
                <p className="text-muted-foreground">No exercises match the selected filters.</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px] pr-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {filteredExercises.map((exercise, index) => (
                    <Card
                      key={exercise.exercise_id}
                      className="overflow-hidden border transition-all duration-500 hover:scale-102 hover:shadow-md hover:shadow-primary/20 hover:border-primary/30 group animate-in fade-in slide-in-from-bottom-5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex">
                        {/* Left side - Image */}
                        <div className="w-1/3 relative overflow-hidden">
                          {exercise.image_url ? (
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={exercise.image_url}
                                alt={exercise.name}
                                className="w-full h-full object-cover object-center"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100"></div>
                          </div>
                          ) : (
                            <div className="aspect-square flex items-center justify-center bg-muted">
                              <Dumbbell className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 rounded-full px-2 py-1 text-xs transition-transform duration-300 group-hover:scale-110 bg-black/70 text-white"
                            style={{
                              backgroundColor: exercise.difficulty_level === 'Beginner' ? 'rgba(22, 101, 52, 0.8)' :
                                            exercise.difficulty_level === 'Intermediate' ? 'rgba(133, 77, 14, 0.8)' :
                                            exercise.difficulty_level === 'Advanced' ? 'rgba(153, 27, 27, 0.8)' : 'rgba(55, 65, 81, 0.8)',
                            }}
                          >
                            {exercise.difficulty_level || "Unknown"}
                          </div>
                        </div>

                        {/* Right side - Content */}
                        <div className="w-2/3">
                          <CardHeader className="pb-2 pt-3 px-3">
                            <div>
                              <CardTitle className="text-base transition-all duration-300 group-hover:translate-x-1 h-6 line-clamp-1">{exercise.name}</CardTitle>
                              <CardDescription className="text-xs mt-1 transition-all duration-300 group-hover:translate-x-1">
                                Category: {exercise.category_name || "Uncategorized"}
                              </CardDescription>
                        </div>
                      </CardHeader>
                          <CardContent className="pb-3 px-3">
                        <div className="space-y-2">
                          {exercise.description && (
                                <p className="text-xs line-clamp-2 h-10 transition-all duration-300 group-hover:translate-y-0.5">{exercise.description}</p>
                          )}

                          {exercise.muscle_group && (
                                <div className="flex flex-wrap gap-1 mt-2 h-6">
                                  {exercise.muscle_group.split(',').slice(0, 2).map((muscle, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-muted text-xs px-2 py-0.5 rounded-full transition-all duration-300 hover:scale-105"
                                    >
                                  {muscle.trim()}
                                </span>
                              ))}
                                  {exercise.muscle_group.split(',').length > 2 && (
                                    <span className="text-xs text-muted-foreground">+{exercise.muscle_group.split(',').length - 2} more</span>
                                  )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                        </div>
                      </div>
                      <div className="px-6 py-2 bg-muted flex justify-between gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => addExerciseToRoutine(exercise)}
                          className="bg-primary/80 hover:bg-primary text-black flex-1 transition-all duration-500 hover:scale-105 hover:shadow-md hover:shadow-primary/50 relative overflow-hidden group opacity-80 hover:opacity-100"
                        >
                          <span className="relative z-10 flex items-center">
                            <Plus className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:rotate-90" />
                          Add
                          </span>
                          <span className="absolute inset-0 bg-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedExercise(exercise);
                            setShowExerciseDetails(true);
                          }}
                          className="flex-1 transition-all duration-500 hover:scale-105 hover:border-primary hover:shadow-sm hover:shadow-primary/30 relative overflow-hidden group opacity-70 hover:opacity-100"
                        >
                          <span className="relative z-10">View Details</span>
                          <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Details Dialog */}
      <Dialog open={showExerciseDetails} onOpenChange={setShowExerciseDetails}>
        {selectedExercise && (
          <DialogContent className="max-w-3xl animate-in fade-in duration-500">
            <DialogHeader className="animate-in fade-in duration-700">
              <DialogTitle className="text-xl flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 animate-pulse" />
                {selectedExercise.name}
              </DialogTitle>
              <DialogDescription>
                Category: {selectedExercise.category_name || "Uncategorized"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image and Difficulty Level */}
              <div className="flex gap-4 animate-in fade-in duration-700">
                {selectedExercise.image_url ? (
                  <div className="w-1/4 rounded-md overflow-hidden">
                    <div className="aspect-square">
                      <img
                        src={selectedExercise.image_url}
                        alt={selectedExercise.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-1/4 aspect-square rounded-md bg-muted flex items-center justify-center">
                    <Dumbbell className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center mb-2">
                <span className="text-sm font-medium mr-2">Difficulty:</span>
                    <span className="px-2 py-1 rounded-full text-xs transition-transform duration-300 hover:scale-105"
                  style={{
                    backgroundColor: selectedExercise.difficulty_level === 'Beginner' ? '#dcfce7' :
                                    selectedExercise.difficulty_level === 'Intermediate' ? '#fef9c3' :
                                    selectedExercise.difficulty_level === 'Advanced' ? '#fee2e2' : '#f3f4f6',
                    color: selectedExercise.difficulty_level === 'Beginner' ? '#166534' :
                          selectedExercise.difficulty_level === 'Intermediate' ? '#854d0e' :
                          selectedExercise.difficulty_level === 'Advanced' ? '#991b1b' : '#374151'
                  }}
                >
                  {selectedExercise.difficulty_level || "Unknown"}
                </span>
                  </div>

                  {selectedExercise.equipment_needed && (
                    <div className="mb-2">
                      <span className="text-sm font-medium mr-2">Equipment:</span>
                      <span className="text-sm">{selectedExercise.equipment_needed}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedExercise.description && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-sm">{selectedExercise.description}</p>
                </div>
              )}

              {/* Muscle Groups */}
              {selectedExercise.muscle_group && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-lg font-semibold mb-2">Target Muscles</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedExercise.muscle_group.split(',').map((muscle, idx) => (
                      <span
                        key={idx}
                        className="bg-muted text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105"
                      >
                        {muscle.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}



              {/* Video Tutorial */}
              {selectedExercise.video_tutorial_url && (
                <div className="animate-in fade-in duration-700">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Video Tutorial
                  </h3>
                  <div className="aspect-video rounded-md overflow-hidden bg-black transition-all duration-300 hover:shadow-lg">
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedExercise.video_tutorial_url.replace('watch?v=', 'embed/')}
                      title={`${selectedExercise.name} tutorial`}
                      style={{ border: 0 }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 animate-in fade-in duration-700">
              <Button
                onClick={() => setShowExerciseDetails(false)}
                variant="outline"
                className="flex-1 transition-all duration-300 hover:scale-105"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  addExerciseToRoutine(selectedExercise);
                  setShowExerciseDetails(false);
                }}
                variant="default"
                className="bg-primary hover:bg-primary/90 text-black flex-1 transition-all duration-300 hover:scale-105 group"
              >
                <Plus className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:rotate-90" />
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Workout Logs Dialog */}
      <Dialog open={showWorkoutLogs} onOpenChange={setShowWorkoutLogs}>
        <DialogContent className="max-w-3xl animate-in fade-in duration-500">
          <DialogHeader className="animate-in fade-in duration-700">
            <DialogTitle className="text-xl flex items-center">
              <svg className="h-5 w-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Workout Logs
            </DialogTitle>
            <DialogDescription>
              Track your progress with your saved workouts
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center mb-3 animate-in fade-in duration-700">
            <p className="text-sm text-muted-foreground flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Showing most recent logs first
            </p>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary animate-in fade-in duration-700 flex items-center">
                <Target className="h-4 w-4 mr-1" />
                <span>You have earned {userPoints.total} points</span>
              </div>
              <div
                className="px-3 py-1 rounded-full text-sm font-medium animate-in fade-in duration-700 flex items-center"
                style={{
                  backgroundColor:
                    userPoints.level <= 2 ? 'rgba(22, 163, 74, 0.15)' : // Rookie - Green
                    userPoints.level <= 4 ? 'rgba(59, 130, 246, 0.15)' : // Contender - Blue
                    userPoints.level <= 6 ? 'rgba(139, 92, 246, 0.15)' : // Challenger - Purple
                    userPoints.level <= 9 ? 'rgba(245, 158, 11, 0.15)' : // Veteran - Amber
                    'rgba(239, 68, 68, 0.15)', // Overachiever - Red
                  color:
                    userPoints.level <= 2 ? 'rgb(22, 163, 74)' : // Rookie - Green
                    userPoints.level <= 4 ? 'rgb(59, 130, 246)' : // Contender - Blue
                    userPoints.level <= 6 ? 'rgb(139, 92, 246)' : // Challenger - Purple
                    userPoints.level <= 9 ? 'rgb(245, 158, 11)' : // Veteran - Amber
                    'rgb(239, 68, 68)', // Overachiever - Red
                }}
              >
                <span className="font-bold">Level {userPoints.level}</span>
                <span className="mx-1">•</span>
                <span className="font-semibold">{userPoints.rank}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {workoutLogs.length === 0 ? (
              <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
                <svg className="h-12 w-12 mx-auto text-muted-foreground mb-3 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-muted-foreground">No workout logs found. Start adding exercises to your routine.</p>
              </div>
            ) : (
              <>
                {/* Group logs by date */}
                {Array.from(new Set(workoutLogs.map(log => log.log_date)))
                  .sort((a, b) => new Date(b) - new Date(a))
                  .map((date, dateIndex) => (
                    <div
                      key={date}
                      className="mb-4 animate-in fade-in slide-in-from-right-5 duration-300"
                      style={{ animationDelay: `${dateIndex * 100}ms` }}
                    >
                      <h3 className="text-sm font-medium mb-2 inline-block px-3 py-1 rounded-md">
                        {formatLogDate(date)}
                      </h3>
                      <div className="space-y-2">
                        {workoutLogs
                          .filter(log => log.log_date === date)
                          .sort((a, b) => {
                            // If created_at timestamp is available, use it for more precise sorting
                            if (a.created_at && b.created_at) {
                              return new Date(b.created_at) - new Date(a.created_at);
                            }
                            // Otherwise sort by log_id (higher id means newer)
                            return b.log_id - a.log_id;
                          })
                          .map((log, logIndex) => (
                            <div
                              key={log.log_id}
                              className="border rounded-md p-3 transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-left-5"
                              style={{ animationDelay: `${(dateIndex * 100) + (logIndex * 50)}ms` }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium transition-all duration-300 hover:translate-x-1">{log.exercise_name}</p>
                                </div>
                                {log.is_completed ? (
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                                      <Check className="h-3 w-3 mr-1" />
                                    Completed
                                    </div>
                                    {log.calories_burned > 0 && (
                                      <div className="flex items-center bg-primary/10 text-primary text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                                        <Target className="h-3 w-3 mr-1" />
                                        +{log.calories_burned} points
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full transition-all duration-300 hover:scale-105">
                                    <X className="h-3 w-3 mr-1" />
                                    Skipped
                                  </div>
                                )}
                              </div>
                              {log.notes && (
                                <p className="text-sm mt-2 transition-all duration-300 hover:translate-y-0.5">{log.notes}</p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-between">
            <Button
              onClick={resetWorkoutLogs}
              variant="outline"
              className="transition-all duration-300 hover:scale-105 border-red-300/70 hover:border-red-500 text-red-700/80 hover:text-red-900 flex items-center"
              disabled={isResettingLogs || workoutLogs.length === 0}
            >
              {isResettingLogs ? (
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-red-600"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Reset Logs
            </Button>
            <Button
              onClick={() => setShowWorkoutLogs(false)}
              variant="outline"
              className="transition-all duration-300 hover:scale-105 border-gray-300/70 hover:border-opacity-100 text-gray-700/80 hover:text-gray-900"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gym Details Dialog */}
      <Dialog open={showGymDetails} onOpenChange={setShowGymDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-500 p-0">
          {selectedGym && (
            <div className="flex flex-col h-full">
              {/* Hero Image with Gradient Overlay */}
              <div className="relative w-full h-80 overflow-hidden">
                {selectedGym.logo_url ? (
                  <>
                    <img
                      src={selectedGym.logo_url}
                      alt={selectedGym.name}
                      className="w-full h-full object-cover animate-in fade-in duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
                  </>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Building className="h-20 w-20 text-muted-foreground" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
                  </div>
                )}

                {/* Title overlay on image */}
                <div className="absolute top-6 left-6 right-6 animate-in fade-in slide-in-from-top-5 duration-700">
                  <h2 className="text-2xl font-bold text-white drop-shadow-md mb-1">{selectedGym.name}</h2>
                  <p className="text-white/90 text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    {selectedGym.address}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-6 py-5">
                {/* About Section */}
                <div className="mb-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="bg-primary/10 text-primary p-2 rounded-md mr-3">
                      <Building className="h-5 w-5" />
                    </span>
                    About This Gym
                  </h3>
                  <p className="text-base leading-relaxed">{selectedGym.description}</p>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-5 duration-700" style={{ animationDelay: '100ms' }}>
                  {/* Operating Hours Card */}
                  {selectedGym.operating_hours && (
                    <div className="bg-muted/50 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-md group-hover:bg-primary/20 transition-colors duration-300">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Operating Hours</h4>
                          <p className="text-sm leading-relaxed">{selectedGym.operating_hours}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Address Card */}
                  <div className="bg-muted/50 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary p-2 rounded-md group-hover:bg-primary/20 transition-colors duration-300">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Location</h4>
                        <p className="text-sm leading-relaxed">{selectedGym.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Card */}
                  {selectedGym.phone && (
                    <div className="bg-muted/50 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 group">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-md group-hover:bg-primary/20 transition-colors duration-300">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-300">Contact</h4>
                          <p className="text-sm leading-relaxed">{selectedGym.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
                <Button
                  onClick={() => setShowGymDetails(false)}
                  variant="outline"
                  className="transition-all duration-300 hover:scale-105 border-gray-300/70 hover:border-opacity-100 text-gray-700/80 hover:text-gray-900"
                >
                  Close
                </Button>
                {selectedGym.website && (
                  <Button
                    onClick={() => window.open(selectedGym.website, '_blank')}
                    className="bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg hover:shadow-primary/20 relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center text-black">
                      <Globe className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                      Show on Maps
                    </span>
                    <span className="absolute inset-0 bg-primary-dark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md animate-in fade-in duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
              Confirm Action
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>{confirmationMessage}</p>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmationAction) {
                  confirmationAction();
                }
              }}
              className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Routine Dialog */}
      <Dialog open={showSaveRoutineDialog} onOpenChange={setShowSaveRoutineDialog}>
        <DialogContent className="max-w-md animate-in fade-in duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Save className="h-5 w-5 mr-2 text-primary" />
              Save Your Routine
            </DialogTitle>
            <DialogDescription>
              Save your current workout routine to access it later
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="routine-name">Routine Name</Label>
              <Input
                id="routine-name"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Enter a name for your routine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select value={selectedGoalType} onValueChange={setSelectedGoalType}>
                <SelectTrigger id="goal-type">
                  <SelectValue placeholder="Select a goal type" />
                </SelectTrigger>
                <SelectContent>
                  {availableGoalTypes.length > 0 ? (
                    availableGoalTypes.map((goalType) => (
                      <SelectItem key={goalType} value={goalType}>
                        {goalType}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Building">Muscle Building</SelectItem>
                      <SelectItem value="Endurance">Endurance</SelectItem>
                      <SelectItem value="Flexibility">Flexibility</SelectItem>
                      <SelectItem value="General Fitness">General Fitness</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-date">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="target-date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                // Clear routines when canceling
                setRoutines([]);
                setShowSaveRoutineDialog(false);
                addToast("Routine creation canceled. Exercise list cleared.", 'info');
              }}
              className="transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              onClick={saveRoutineToGoals}
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              disabled={savingRoutine}
            >
              {savingRoutine ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Routine
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Routines Dialog */}
      <Dialog open={showUserRoutines} onOpenChange={setShowUserRoutines}>
        <DialogContent className="max-w-3xl animate-in fade-in duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <ListTodo className="h-5 w-5 mr-2 text-primary" />
              Your Saved Routines
            </DialogTitle>
            <DialogDescription>
              View and manage your saved workout routines
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingUserRoutines ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : userRoutines.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <ListTodo className="h-12 w-12 mx-auto text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">You don't have any saved routines yet.</p>
                <p className="text-muted-foreground text-sm mt-2">Create a routine and click "Save Routine" to add one.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {userRoutines.map((routine) => (
                  <div
                    key={routine.goal_id}
                    className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-md ${
                      routine.status === 'Active'
                        ? 'border-primary/50 bg-primary/5'
                        : 'hover:border-primary/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg flex items-center">
                          {routine.title}
                          {routine.status === 'Active' && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(() => {
                            try {
                              // Try to parse the description as JSON
                              const exerciseDetails = JSON.parse(routine.description);
                              if (Array.isArray(exerciseDetails)) {
                                return `Includes ${exerciseDetails.length} exercises`;
                              }
                              return routine.description;
                            } catch (e) {
                              // If it's not JSON, display as is
                              return routine.description;
                            }
                          })()}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>Target: {routine.target_date ? new Date(routine.target_date).toLocaleDateString() : 'Not set'}</span>
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{routine.goal_type || 'General Fitness'}</span>
                          </div>

                          {/* Time-related information */}
                          <div className="flex items-center mt-1 w-full">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {routine.created_at ? (
                                <>Created {formatLogDate(routine.created_at)}</>
                              ) : routine.start_date ? (
                                <>Created {formatLogDate(routine.start_date)}</>
                              ) : (
                                <>Recently created</>
                              )}
                            </span>

                            {routine.target_date && (
                              <span className="ml-2 font-medium">
                                {(() => {
                                  const now = new Date();
                                  const targetDate = new Date(routine.target_date);
                                  const diffTime = targetDate - now;
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                  if (diffDays < 0) {
                                    return <span className="text-red-500">Overdue by {Math.abs(diffDays)} days</span>;
                                  } else if (diffDays === 0) {
                                    return <span className="text-amber-500">Due today</span>;
                                  } else {
                                    return <span className="text-green-600">{diffDays} days remaining</span>;
                                  }
                                })()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {routine.status !== 'Active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => activateRoutine(routine.routine_id)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary border-primary/20 hover:border-primary/40 w-[100px]"
                          >
                            <Play className="h-3.5 w-3.5 mr-1" />
                            Activate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // Deactivate the routine
                              setConfirmationMessage("Are you sure you want to deactivate this routine?");
                              setConfirmationAction(() => async () => {
                                try {
                                  // Update the is_active field in the database
                                  const updateResponse = await axios.post('http://localhost:5000/api/workouts/update_routine', {
                                    user_id: currentUserId,
                                    routine_id: routine.routine_id,
                                    is_active: 0
                                  });

                                  if (updateResponse.data.success) {
                                    // Update the UI
                                    const updatedRoutines = userRoutines.map(r => ({
                                      ...r,
                                      status: r.routine_id === routine.routine_id ? 'Not In Use' : r.status
                                    }));
                                    setUserRoutines(updatedRoutines);

                                    // If this was the active routine, set activeRoutine to null
                                    if (activeRoutine && activeRoutine.routine_id === routine.routine_id) {
                                      setActiveRoutine(null);
                                    }

                                    addToast("Routine deactivated successfully", 'success');
                                  } else {
                                    addToast("Failed to deactivate routine", 'error');
                                  }
                                  setShowConfirmation(false);
                                } catch (error) {
                                  console.error("Error deactivating routine:", error);
                                  addToast("Failed to deactivate routine", 'error');
                                  setShowConfirmation(false);
                                }
                              });
                              setShowConfirmation(true);
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700/70 hover:text-amber-800 border-amber-100 w-[100px] opacity-80"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Set the selected routine and populate the form fields
                            setSelectedRoutine(routine);
                            setRoutineName(routine.title);
                            setSelectedGoalType(routine.goal_type || 'General Fitness');
                            setTargetDate(routine.target_date ? new Date(routine.target_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
                            setEditingRoutine(true);
                          }}
                          className="hover:bg-muted/80"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Delete the routine
                            setConfirmationMessage("Are you sure you want to delete this routine? This action cannot be undone.");
                            setConfirmationAction(() => async () => {
                              try {
                                // Create a delete endpoint if it doesn't exist
                                const response = await axios.delete(`http://localhost:5000/api/workouts/delete_routine/${routine.routine_id}/${currentUserId}`);

                                if (response.data.success) {
                                  // Remove from UI
                                  const updatedRoutines = userRoutines.filter(r => r.routine_id !== routine.routine_id);
                                  setUserRoutines(updatedRoutines);

                                  // If this was the active routine, clear it
                                  if (activeRoutine && activeRoutine.routine_id === routine.routine_id) {
                                    setActiveRoutine(null);
                                  }

                                  addToast("Routine deleted successfully", 'success');
                                }
                                setShowConfirmation(false);
                              } catch (error) {
                                console.error("Error deleting routine:", error);
                                addToast("Failed to delete routine", 'error');
                                setShowConfirmation(false);
                              }
                            });
                            setShowConfirmation(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUserRoutines(false);
                // Refresh routines when closing
                fetchUserSavedRoutines();
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Routine Dialog */}
      <Dialog open={editingRoutine} onOpenChange={setEditingRoutine}>
        <DialogContent className="max-w-md animate-in fade-in duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <Save className="h-5 w-5 mr-2 text-primary" />
              Edit Routine
            </DialogTitle>
            <DialogDescription>
              Update your saved workout routine
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-routine-name">Routine Name</Label>
              <Input
                id="edit-routine-name"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                placeholder="Enter a name for your routine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-goal-type">Goal Type</Label>
              <Select value={selectedGoalType} onValueChange={setSelectedGoalType}>
                <SelectTrigger id="edit-goal-type">
                  <SelectValue placeholder="Select a goal type" />
                </SelectTrigger>
                <SelectContent>
                  {availableGoalTypes.length > 0 ? (
                    availableGoalTypes.map((goalType) => (
                      <SelectItem key={goalType} value={goalType}>
                        {goalType}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                      <SelectItem value="Muscle Building">Muscle Building</SelectItem>
                      <SelectItem value="Endurance">Endurance</SelectItem>
                      <SelectItem value="Flexibility">Flexibility</SelectItem>
                      <SelectItem value="General Fitness">General Fitness</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-target-date">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="edit-target-date"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingRoutine(false);
                setSelectedRoutine(null);
              }}
              className="transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  setSavingRoutine(true);

                  if (!routineName) {
                    addToast("Please enter a name for your routine.", 'warning');
                    setSavingRoutine(false);
                    return;
                  }

                  if (!selectedGoalType) {
                    addToast("Please select a goal type for your routine.", 'warning');
                    setSavingRoutine(false);
                    return;
                  }

                  if (!targetDate) {
                    addToast("Please select a target date for your routine.", 'warning');
                    setSavingRoutine(false);
                    return;
                  }

                  // Update the routine using the new update_routine endpoint
                  const response = await axios.post('http://localhost:5000/api/workouts/update_routine', {
                    routine_id: selectedRoutine.routine_id,
                    user_id: currentUserId,
                    goal_type: selectedGoalType,
                    title: routineName,
                    target_date: targetDate.toISOString().split('T')[0]
                  });

                  if (response.data.success) {
                    // Close the dialog
                    setEditingRoutine(false);
                    setSelectedRoutine(null);

                    // Show success message
                    addToast("Routine updated successfully!", 'success');

                    // Refresh user routines
                    fetchUserSavedRoutines();
                  }

                  setSavingRoutine(false);
                } catch (error) {
                  console.error("Error updating routine:", error);
                  addToast("Failed to update routine. Please try again.", 'error');
                  setSavingRoutine(false);
                }
              }}
              className="bg-primary text-white hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              disabled={savingRoutine}
            >
              {savingRoutine ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
