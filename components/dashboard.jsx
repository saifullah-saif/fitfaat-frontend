"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ActivityFeed } from "@/components/widgets/activity-feed";
import { useAuth } from "@/components/auth-provider";
import { UserStats } from "@/components/user-stats";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Utensils } from "lucide-react";
import axios from "axios";

export function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user || { name: "User" };

  const [selectedFoods, setSelectedFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [loadingWorkoutPlan, setLoadingWorkoutPlan] = useState(true);
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [userPoints, setUserPoints] = useState(0);
  const [userRankings, setUserRankings] = useState({
    points: 0,
    level: 1,
    rank_title: 'Rookie'
  });
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [loadingRankings, setLoadingRankings] = useState(true);

  // Fetch selected foods from the backend when the component is mounted
  useEffect(() => {
    async function fetchSelectedFoods() {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard/diet/");
        // Ensure the response is structured correctly
        setSelectedFoods(response.data.selectedFoods || []);  // Assuming response structure: { selectedFoods: [...] }
      } catch (error) {
        console.error("Failed to fetch selected foods.", error);
      } finally {
        setLoading(false);  // Set loading to false after fetching
      }
    }

    fetchSelectedFoods();
  }, []);

  // Fetch workout streak and user points
  useEffect(() => {
    async function fetchWorkoutData() {
      try {
        const userId = auth?.user?.id;

        if (!userId) {
          setLoadingStreak(false);
          setLoadingRankings(false);
          return;
        }

        setLoadingStreak(true);
        setLoadingRankings(true);

        // Fetch user workout logs to calculate streak
        const logsResponse = await axios.get('http://localhost:5000/api/workouts/fetch_user_workout_logs', {
          params: { user_id: userId }
        });

        if (logsResponse.data && logsResponse.data.length > 0) {
          // Get unique workout dates
          const workoutDates = [...new Set(logsResponse.data.map(log =>
            new Date(log.log_date).toISOString().split('T')[0]
          ))].sort();

          // Calculate streak (consecutive days)
          let streak = 0;
          const today = new Date().toISOString().split('T')[0];

          // Check if user worked out today
          if (workoutDates.includes(today)) {
            streak = 1;

            // Check previous consecutive days
            let checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - 1);

            while (true) {
              const dateStr = checkDate.toISOString().split('T')[0];
              if (workoutDates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
              } else {
                break;
              }
            }
          } else if (workoutDates.length > 0) {
            // If not worked out today, check if worked out yesterday and count previous days
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (workoutDates.includes(yesterdayStr)) {
              streak = 1;

              // Check previous consecutive days
              let checkDate = new Date();
              checkDate.setDate(checkDate.getDate() - 2);

              while (true) {
                const dateStr = checkDate.toISOString().split('T')[0];
                if (workoutDates.includes(dateStr)) {
                  streak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }
            }
          }

          setWorkoutStreak(streak);
        }

        // Fetch user rankings
        try {
          const rankingsResponse = await axios.get(`http://localhost:5000/api/workouts/fetch_user_rankings/${userId}`);
          if (rankingsResponse.data) {
            setUserPoints(rankingsResponse.data.points || 0);
            setUserRankings({
              points: rankingsResponse.data.points || 0,
              level: rankingsResponse.data.level || 1,
              rank_title: rankingsResponse.data.rank_title || 'Rookie'
            });
          }
        } catch (error) {
          console.error("Failed to fetch user rankings:", error);
          setUserPoints(0);
          setUserRankings({
            points: 0,
            level: 1,
            rank_title: 'Rookie'
          });
        }

        setLoadingStreak(false);
        setLoadingRankings(false);
      } catch (error) {
        console.error("Failed to fetch workout data:", error);
        setWorkoutStreak(0);
        setUserPoints(0);
        setUserRankings({
          points: 0,
          level: 1,
          rank_title: 'Rookie'
        });
        setLoadingStreak(false);
        setLoadingRankings(false);
      }
    }

    fetchWorkoutData();
  }, [auth?.user?.id]);

  // Fetch active workout plan
  useEffect(() => {
    async function fetchActiveWorkoutPlan() {
      try {
        const userId = auth?.user?.id;

        if (!userId) {
          setLoadingWorkoutPlan(false);
          return;
        }

        setLoadingWorkoutPlan(true);

        // Fetch user's active workout plan
        const response = await axios.get('http://localhost:5000/api/workouts/fetch_user_workout_plans', {
          params: { user_id: userId }
        });

        console.log("Fetched workout plans:", response.data);

        // Find the active workout plan - handle all possible formats of is_active
        const activePlan = response.data.find(plan => {
          // Convert to string and check if it's truthy
          const isActive = String(plan.is_active).toLowerCase();
          return isActive === '1' || isActive === 'true' || isActive === 'yes' || plan.is_active === 1 || plan.is_active === true;
        });

        console.log("Active plan check:", activePlan);

        if (activePlan) {
          console.log("Found active workout plan:", activePlan.name);

          // Calculate progress based on start date and duration
          const startDate = new Date(activePlan.start_date);
          const today = new Date();

          // If there's an end date, use it; otherwise, calculate based on duration_weeks
          let endDate;
          if (activePlan.end_date) {
            endDate = new Date(activePlan.end_date);
          } else if (activePlan.duration_weeks) {
            // Calculate end date based on duration_weeks
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (activePlan.duration_weeks * 7));
          } else {
            // Default to 4 weeks if no duration is specified
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 28);
          }

          // Calculate total duration and elapsed time
          const totalDuration = endDate - startDate;
          const elapsedTime = today - startDate;

          // Calculate progress percentage (capped at 100%)
          const progressPercentage = Math.min(Math.round((elapsedTime / totalDuration) * 100), 100);

          // Add progress percentage to the active plan object
          const workoutPlanData = {
            ...activePlan,
            name: activePlan.name || 'Workout Plan',
            goal_type: activePlan.goal_type || 'General Fitness',
            progressPercentage,
            daysRemaining: Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))
          };

          console.log("Setting active workout plan:", workoutPlanData);
          setActiveWorkoutPlan(workoutPlanData);
        } else {
          console.log("No active workout plan found");
          setActiveWorkoutPlan(null);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setActiveWorkoutPlan(null);
      } finally {
        setLoadingWorkoutPlan(false);
      }
    }

    fetchActiveWorkoutPlan();
  }, [auth?.user?.id]);

  // Function to remove food item from selectedFoods list
  const handleRemove = (foodId) => {
    const updatedSelectedFoods = selectedFoods.filter((food) => food.id !== foodId);
    setSelectedFoods(updatedSelectedFoods);
  };



  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Add keyframe animation for pulse effect */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.3;
          }
        }

        @keyframes shine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .goal-name-shine {
          background: linear-gradient(
            90deg,
            rgba(34, 197, 94, 0.7) 0%,
            rgba(34, 197, 94, 1) 25%,
            rgba(34, 197, 94, 1) 50%,
            rgba(34, 197, 94, 0.7) 75%,
            rgba(34, 197, 94, 0.7) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 15s linear infinite;
          display: inline-block;
        }

        @keyframes glow {
          0% {
            filter: drop-shadow(0 0 2px currentColor);
          }
          50% {
            filter: drop-shadow(0 0 6px currentColor);
          }
          100% {
            filter: drop-shadow(0 0 2px currentColor);
          }
        }

        .rank-rookie-shine {
          background: linear-gradient(
            90deg,
            rgba(22, 163, 74, 0.7) 0%,
            rgba(22, 163, 74, 1) 25%,
            rgba(22, 163, 74, 1) 50%,
            rgba(22, 163, 74, 0.7) 75%,
            rgba(22, 163, 74, 0.7) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 15s linear infinite, glow 2s ease-in-out infinite;
          display: inline-block;
        }

        .rank-contender-shine {
          background: linear-gradient(
            90deg,
            rgba(59, 130, 246, 0.7) 0%,
            rgba(59, 130, 246, 1) 25%,
            rgba(59, 130, 246, 1) 50%,
            rgba(59, 130, 246, 0.7) 75%,
            rgba(59, 130, 246, 0.7) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 15s linear infinite, glow 2s ease-in-out infinite;
          display: inline-block;
        }

        .rank-challenger-shine {
          background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.7) 0%,
            rgba(139, 92, 246, 1) 25%,
            rgba(139, 92, 246, 1) 50%,
            rgba(139, 92, 246, 0.7) 75%,
            rgba(139, 92, 246, 0.7) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 15s linear infinite, glow 2s ease-in-out infinite;
          display: inline-block;
        }

        .rank-veteran-shine {
          background: linear-gradient(
            90deg,
            rgba(245, 158, 11, 0.7) 0%,
            rgba(245, 158, 11, 1) 25%,
            rgba(245, 158, 11, 1) 50%,
            rgba(245, 158, 11, 0.7) 75%,
            rgba(245, 158, 11, 0.7) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shine 15s linear infinite, glow 2s ease-in-out infinite;
          display: inline-block;
        }

        .level-rookie-glow {
          box-shadow: 0 0 15px rgba(22, 163, 74, 0.5);
          animation: glow 2s ease-in-out infinite;
        }

        .level-contender-glow {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
          animation: glow 2s ease-in-out infinite;
        }

        .level-challenger-glow {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
          animation: glow 2s ease-in-out infinite;
        }

        .level-veteran-glow {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.5);
          animation: glow 2s ease-in-out infinite;
        }

        @keyframes slideIn {
          0% {
            stroke-dasharray: 0 ${2 * Math.PI * 42};
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes progressSlideIn {
          0% {
            width: 0;
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes buttonShine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .quiz-button-shine {
          background: linear-gradient(
            90deg,
            #c026d3 0%,
            #db2777 25%,
            #c026d3 50%,
            #db2777 75%,
            #c026d3 100%
          );
          background-size: 200% auto;
          animation: buttonShine 3s ease infinite;
          transition: all 0.3s ease;
          box-shadow: 0 0 15px rgba(219, 39, 119, 0.5);
        }

        .quiz-button-shine:hover {
          box-shadow: 0 0 20px rgba(219, 39, 119, 0.7);
          transform: translateY(-2px);
        }
      `}</style>
      <div className="flex flex-col gap-2">
        <h1 className="text-muted-foreground text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-4xl text-medium">Welcome back, {user?.name || "User"}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">


        <TabsContent value="overview" className="space-y-6">
          <UserStats />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Goal Card - Made Smaller */}
            <Card className="bg-gradient-to-tr from-green-500/10 to-teal-500/10 p-4 flex flex-col border-green-500/20 relative overflow-hidden">
              {loadingWorkoutPlan ? (
                <div className="flex justify-center items-center h-[120px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : activeWorkoutPlan ? (
                <div className="flex flex-col h-full w-full items-center justify-center">
                  {/* Header */}
                  <div className="mb-4 text-xl font-medium">My Goal</div>

                  {/* Goal Content */}
                  <h3 className="text-3xl font-bold mb-2 goal-name-shine">{activeWorkoutPlan.name || 'Workout Plan'}</h3>
                  <p className="text-xs text-slate-300 mb-3 line-clamp-2 text-center max-w-[90%]">{activeWorkoutPlan.description || 'Aid in muscle recovery, reduce injury risk, and enhance flexibility.'}</p>

                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-slate-400" />
                      <span className="text-xs text-slate-400">Goal: {activeWorkoutPlan.goal_type || 'General Fitness'}</span>
                    </div>
                    <div className="bg-green-500/20 px-2 py-0.5 rounded text-xs font-medium text-green-400">
                      {activeWorkoutPlan.difficulty_level || 'Beginner'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[120px] w-full">
                  <div className="mb-4 text-lg font-medium">My Goal</div>
                  <div className="text-sm font-medium mb-2">No active workout goal</div>
                  <p className="text-xs text-muted-foreground mb-3">Set a goal to track your progress</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/workout')}
                  >
                    <Dumbbell className="mr-1 h-4 w-4" />
                    Set Goal
                  </Button>
                </div>
              )}
            </Card>

            {/* My Stats Card */}
            <Card className="bg-gradient-to-tr from-purple-500/10 to-pink-500/10 p-4 flex flex-col items-center justify-center border-purple-500/20 relative overflow-hidden">


              {loadingRankings ? (
                <div className="flex justify-center items-center h-[120px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full">
                  {/* Rank Display */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="text-xs text-slate-400 mb-1">Current Rank</div>
                    <div className={`text-4xl font-bold mb-1 ${
                      userRankings.level <= 2 ? 'rank-rookie-shine' :
                      userRankings.level <= 4 ? 'rank-contender-shine' :
                      userRankings.level <= 6 ? 'rank-challenger-shine' :
                      'rank-veteran-shine'
                    }`}>
                      {userRankings.rank_title}
                    </div>
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-2 mt-2 ${
                      userRankings.level <= 2 ? 'bg-green-500/20 level-rookie-glow' :
                      userRankings.level <= 4 ? 'bg-blue-500/20 level-contender-glow' :
                      userRankings.level <= 6 ? 'bg-purple-500/20 level-challenger-glow' :
                      'bg-amber-500/20 level-veteran-glow'
                    }`}>
                      <span className="text-2xl font-bold">{userRankings.level}</span>
                    </div>
                  </div>

                  {/* Points Display */}
                  <div className="w-full max-w-[80%] mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Total Points</span>
                      <span className="text-xs font-medium">{userRankings.points}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (userRankings.points / (userRankings.level * 500)) * 100)}%`,
                          animation: "progressSlideIn 1.5s ease-out forwards"
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-400 text-right mt-1">
                      {(() => {
                        // Show points needed for next level
                        let nextThreshold = 100;

                        if (userRankings.level === 1) nextThreshold = 100;
                        else if (userRankings.level === 2) nextThreshold = 300;
                        else if (userRankings.level === 3) nextThreshold = 500;
                        else if (userRankings.level === 4) nextThreshold = 800;
                        else if (userRankings.level === 5) nextThreshold = 1200;
                        else if (userRankings.level === 6) nextThreshold = 1800;
                        else if (userRankings.level === 7) nextThreshold = 2500;
                        else if (userRankings.level === 8) nextThreshold = 3500;
                        else if (userRankings.level === 9) nextThreshold = 5000;
                        else return "Max level reached";

                        const pointsNeeded = nextThreshold - userRankings.points;
                        return `${pointsNeeded} points to next level`;
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Workout Streak Card */}
            <Card className="bg-gradient-to-tr from-green-500/10 to-teal-500/10 p-4 flex flex-col items-center justify-center border-green-500/20">
              <div className="mb-4 text-lg font-medium">Workout Streak</div>
              {loadingStreak ? (
                <div className="flex justify-center items-center h-[160px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : (
                <div className="flex flex-row items-center justify-center gap-6">
                  {/* Streak Display */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F87171" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>
                        </defs>
                        {/* Background circle with gap at top */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#F8717130"
                          className="progress-circle-track"
                          strokeDasharray={`${2 * Math.PI * 42 - 15} ${2 * Math.PI * 42}`}
                          strokeDashoffset="7.5"
                          transform="rotate(-90 50 50)"
                        />
                        {/* Progress circle - fills based on days of the week (1-7) with gap at top */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#streakGradient)"
                          className="progress-circle-fill"
                          strokeDasharray={`${Math.min(workoutStreak * (2 * Math.PI * 42 / 7), 2 * Math.PI * 42 - 15)} ${2 * Math.PI * 42}`}
                          strokeDashoffset="7.5"
                          transform="rotate(-90 50 50)"
                          style={{
                            animation: "slideIn 1.5s ease-out forwards"
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{workoutStreak}</span>

                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium">Weekly Streak</div>
                    <div className="text-xs text-muted-foreground">{7 - workoutStreak} days to complete</div>
                  </div>

                  {/* Points Display */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="pointsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#BEF264" />
                            <stop offset="100%" stopColor="#84CC16" />
                          </linearGradient>
                        </defs>
                        {/* Background circle with gap at top */}
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="#BEF26430"
                          className="progress-circle-track"
                          strokeDasharray={`${2 * Math.PI * 42 - 15} ${2 * Math.PI * 42}`}
                          strokeDashoffset="7.5"
                          transform="rotate(-90 50 50)"
                        />
                        {/* Progress circle - fills based on progress within current level */}
                        {(() => {
                          // Calculate level thresholds
                          let currentThreshold = 0;
                          let nextThreshold = 100;
                          let level = 1;

                          if (userPoints < 100) {
                            currentThreshold = 0;
                            nextThreshold = 100;
                            level = 1;
                          } else if (userPoints < 300) {
                            currentThreshold = 100;
                            nextThreshold = 300;
                            level = 2;
                          } else if (userPoints < 500) {
                            currentThreshold = 300;
                            nextThreshold = 500;
                            level = 3;
                          } else if (userPoints < 800) {
                            currentThreshold = 500;
                            nextThreshold = 800;
                            level = 4;
                          } else if (userPoints < 1200) {
                            currentThreshold = 800;
                            nextThreshold = 1200;
                            level = 5;
                          } else if (userPoints < 1800) {
                            currentThreshold = 1200;
                            nextThreshold = 1800;
                            level = 6;
                          } else if (userPoints < 2500) {
                            currentThreshold = 1800;
                            nextThreshold = 2500;
                            level = 7;
                          } else if (userPoints < 3500) {
                            currentThreshold = 2500;
                            nextThreshold = 3500;
                            level = 8;
                          } else if (userPoints < 5000) {
                            currentThreshold = 3500;
                            nextThreshold = 5000;
                            level = 9;
                          } else {
                            currentThreshold = 5000;
                            nextThreshold = 5000; // Max level
                            level = 10;
                          }

                          // Calculate progress percentage within current level
                          const levelProgress = nextThreshold === currentThreshold
                            ? 1
                            : (userPoints - currentThreshold) / (nextThreshold - currentThreshold);

                          return (
                            <>
                              <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="url(#pointsGradient)"
                                className="progress-circle-fill"
                                strokeDasharray={`${Math.min(levelProgress * (2 * Math.PI * 42), 2 * Math.PI * 42 - 15)} ${2 * Math.PI * 42}`}
                                strokeDashoffset="7.5"
                                transform="rotate(-90 50 50)"
                                style={{
                                  animation: "slideIn 1.5s ease-out forwards"
                                }}
                              />
                              <text
                                x="50"
                                y="110"
                                textAnchor="middle"
                                fontSize="10"
                                fill="currentColor"
                                className="text-muted-foreground"
                              >
                                Level {level}
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold">{userPoints}</span>

                      </div>
                    </div>
                    <div className="mt-2 text-sm font-medium">Total Points</div>
                    {(() => {
                      // Show points needed for next level
                      let nextThreshold = 100;

                      if (userPoints < 100) nextThreshold = 100;
                      else if (userPoints < 300) nextThreshold = 300;
                      else if (userPoints < 500) nextThreshold = 500;
                      else if (userPoints < 800) nextThreshold = 800;
                      else if (userPoints < 1200) nextThreshold = 1200;
                      else if (userPoints < 1800) nextThreshold = 1800;
                      else if (userPoints < 2500) nextThreshold = 2500;
                      else if (userPoints < 3500) nextThreshold = 3500;
                      else if (userPoints < 5000) nextThreshold = 5000;
                      else return null; // Max level reached

                      const pointsNeeded = nextThreshold - userPoints;

                      return (
                        <div className="text-xs text-muted-foreground">
                          {pointsNeeded} points to next level
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </Card>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Selected Foods Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-4 relative overflow-hidden">
              <div className="mb-4 text-lg font-medium text-center">Selected Foods</div>

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium flex items-center">
                  <Utensils className="h-4 w-4 mr-2 text-blue-400" />
                  Today's Diet
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => router.push('/diet')}
                >
                  Add Food
                </Button>
              </div>

              <div className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                {loading ? (
                  <div className="flex justify-center items-center h-[60px]">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : selectedFoods.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    <p>No foods selected today</p>
                    <p className="text-xs mt-1">Track your meals to monitor calorie intake</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {selectedFoods.map((food) => (
                      <li key={food.id} className="flex justify-between items-center text-sm bg-slate-900/10 p-2 rounded-md">
                        <div className="flex items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-2">
                            <Utensils className="h-3 w-3 text-blue-400" />
                          </div>
                          <span className="font-medium">{food.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs mr-3">{food.calories} kcal</span>
                          <button
                            onClick={() => handleRemove(food.id)}
                            className="text-red-400 hover:text-red-500 bg-red-500/10 p-1 rounded-full"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            {/* Recent Activities Card */}
            <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20 p-4 relative overflow-hidden">
              <div className="mb-4 text-lg font-medium text-center">Recent Activities</div>

              <h4 className="text-md font-medium mb-3 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-teal-400" />
                Activity Log
              </h4>
              <div className="max-h-[240px] overflow-y-auto pr-2 scrollbar-thin">
                <ActivityFeed />
              </div>
            </Card>

            {/* Personalize Your Experience Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="mb-4 text-lg font-medium text-center">Personalize Your Experience</div>

              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-slate-900/20 rounded-lg p-6 flex flex-col items-center justify-center w-full">
                  <div className="h-16 w-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>

                  <p className="text-sm text-slate-300 mb-6">
                    Take our health quiz to get personalized recommendations tailored to your fitness goals and needs.
                  </p>

                  <Button
                    onClick={() => router.push('/onboarding')}
                    className="quiz-button-shine text-white px-6 py-2 rounded-md"
                  >
                    Play Your Quiz Now
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-500/10">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Analytics</h3>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics charts will appear here</p>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-gradient-to-br from-slate-500/5 to-slate-600/5 border-slate-500/10">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Reports</h3>
              <div className="h-[400px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Reports will appear here</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
}
