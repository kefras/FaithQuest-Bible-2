import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Trophy, 
  Play, 
  LogIn, 
  LogOut, 
  Timer, 
  HelpCircle, 
  ChevronRight,
  User as UserIcon,
  Medal,
  RefreshCw,
  Layout,
  Calendar,
  Zap,
  History,
  ArrowLeft,
  Settings,
  PieChart,
  Edit3,
  Camera,
  Target,
  Award,
  Scroll,
  Sun,
  Leaf,
  Crown,
  Sparkles,
  BookMarked
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { auth, signInWithGoogle, db, getLeaderboard, updateUserProfile, recordGameHistory } from './lib/firebase';
import { getDailyManna, DailyManna } from './lib/gemini';
import { QUESTIONS } from './data/questions';
import { ACHIEVEMENTS } from './constants/achievements';
import { GameState, Testament, Level, Question, UserProfile, GameMode, GameHistoryEntry } from './types';
import { doc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<UserProfile[]>([]);
  
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timer: 30,
    isGameOver: false,
    selectedTestament: 'Both',
    selectedLevel: 'Beginner',
    gameMode: 'Standard',
    selectedCategory: 'All',
    isPlaying: false,
    hintsUsed: 0,
    correctCount: 0,
    matchStats: {}
  });

  const [showHint, setShowHint] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isShowingFeedback, setIsShowingFeedback] = useState(false);

  const [isFetchingLeaderboard, setIsFetchingLeaderboard] = useState(false);

  // Daily Manna state
  const [dailyManna, setDailyManna] = useState<DailyManna | null>(null);
  const [isFetchingManna, setIsFetchingManna] = useState(false);
  const [mannaError, setMannaError] = useState<string | null>(null);
  const [showManna, setShowManna] = useState(false);

  // Derived categories from questions
  const categories = Array.from(new Set(QUESTIONS.map(q => q.category).filter(Boolean)));

  const getDailyQuestions = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    
    // Deterministic shuffle
    const shuffled = [...QUESTIONS].sort((a, b) => {
      const hashA = (a.id.length * seed) % 100;
      const hashB = (b.id.length * seed) % 100;
      return hashA - hashB;
    });

    return shuffled.slice(0, 10);
  };

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous profile listener if it exists
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        // Listen to user profile changes
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userDocRef, 
          (doc) => {
            if (doc.exists()) {
              setUserProfile(doc.data() as UserProfile);
            }
          },
          (error) => {
            console.error("Firestore Profile Sync Error:", {
              error: error.message,
              userId: firebaseUser?.uid,
              path: `users/${firebaseUser?.uid}`
            });
          }
        );
        setLoading(false);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.isPlaying && !gameState.isGameOver && gameState.timer > 0 && !isShowingFeedback && gameState.gameMode === 'Standard') {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer - 1 }));
      }, 1000);
    } else if (gameState.timer === 0 && gameState.isPlaying && !isShowingFeedback && gameState.gameMode === 'Standard') {
      handleNextQuestion(false);
    }

    return () => clearInterval(interval);
  }, [gameState.isPlaying, gameState.isGameOver, gameState.timer, isShowingFeedback, gameState.gameMode]);

  useEffect(() => {
    fetchLeaderboard();
    fetchDailyManna();
  }, []);

  const handleStartGame = (overrideMode?: GameMode) => {
    const mode = overrideMode ?? gameState.gameMode;
    let filteredQuestions: Question[] = [];

    if (mode === 'Daily') {
      filteredQuestions = getDailyQuestions();
    } else {
      filteredQuestions = QUESTIONS.filter(q => {
        const testamentMatch = gameState.selectedTestament === 'Both' || q.testament === gameState.selectedTestament;
        const levelMatch = q.level === gameState.selectedLevel;
        const categoryMatch = gameState.selectedCategory === 'All' || q.category === gameState.selectedCategory;
        return testamentMatch && levelMatch && categoryMatch;
      });
    }

    if (filteredQuestions.length === 0) {
      alert("No questions found for this selection. Try broader filters!");
      return;
    }

    if (mode !== 'Daily') {
      filteredQuestions = filteredQuestions.sort(() => Math.random() - 0.5);
    }

    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      questions: filteredQuestions,
      currentQuestionIndex: 0,
      score: 0,
      timer: userProfile?.settings?.defaultTimerDuration || 30,
      isGameOver: false,
      isPlaying: true,
      hintsUsed: 0,
      correctCount: 0,
      matchStats: {}
    }));
    setShowHint(false);
  };

  const handleAnswerSelect = (option: string) => {
    if (isShowingFeedback) return;
    
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    const cat = currentQuestion.category || 'General';
    
    setSelectedOption(option);
    setIsShowingFeedback(true);

    setGameState(prev => {
      const newStats = { ...prev.matchStats };
      if (!newStats[cat]) newStats[cat] = { correct: 0, total: 0 };
      newStats[cat].total += 1;
      if (isCorrect) newStats[cat].correct += 1;

      return {
        ...prev,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
        matchStats: newStats
      };
    });

    if (isCorrect && (gameState.gameMode === 'Standard' || gameState.gameMode === 'Daily')) {
      const timeBonus = Math.floor(gameState.timer / 2);
      const levelMultiplier = gameState.selectedLevel === 'Beginner' ? 10 : gameState.selectedLevel === 'Medium' ? 20 : 30;
      const modeBonus = gameState.gameMode === 'Daily' ? 50 : 0;
      setGameState(prev => ({ ...prev, score: prev.score + levelMultiplier + timeBonus + modeBonus }));
    }

    setTimeout(() => {
      setIsShowingFeedback(false);
      setSelectedOption(null);
      handleNextQuestion(isCorrect);
    }, 1500);
  };

  const handleNextQuestion = (lastCorrect: boolean) => {
    setShowHint(false);
    if (gameState.currentQuestionIndex + 1 < gameState.questions.length) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        timer: userProfile?.settings?.defaultTimerDuration || 30
      }));
    } else if (gameState.gameMode === 'Practice') {
      // Loop back to start in Practice Mode
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: 0,
        questions: [...prev.questions].sort(() => Math.random() - 0.5), // Reshuffle for variety
        timer: userProfile?.settings?.defaultTimerDuration || 30
      }));
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setGameState(prev => ({ ...prev, isGameOver: true, isPlaying: false }));
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (userProfile && (gameState.gameMode === 'Standard' || gameState.gameMode === 'Daily')) {
      const newTotalScore = (userProfile.totalScore || 0) + gameState.score;
      const newHighScore = Math.max(userProfile.highScore || 0, gameState.score);
      
      const newProgress = { ...(userProfile.progress || { beginner: 0, medium: 0, advance: 0 }) };
      if (gameState.score > 0) {
        const levelKey = gameState.selectedLevel.toLowerCase() as keyof typeof newProgress;
        newProgress[levelKey] = (newProgress[levelKey] || 0) + 1;
      }

      // Category Stats Update
      const newCategoryStats = { ...(userProfile.categoryStats || {}) };
      Object.entries(gameState.matchStats).forEach(([cat, stats]) => {
        const s = stats as { correct: number; total: number };
        if (!newCategoryStats[cat]) newCategoryStats[cat] = { correct: 0, total: 0 };
        newCategoryStats[cat].correct += s.correct;
        newCategoryStats[cat].total += s.total;
      });

      // Record History
      const historyEntry: GameHistoryEntry = {
        date: new Date().toISOString(),
        score: gameState.score,
        mode: gameState.gameMode,
        level: gameState.selectedLevel,
        testament: gameState.selectedTestament,
        correctCount: gameState.correctCount,
        totalQuestions: gameState.currentQuestionIndex + (gameState.gameMode === 'Practice' ? 0 : 1) 
      };
      
      await recordGameHistory(userProfile.userId, historyEntry);

      // --- Achievement Checking ---
      const currentlyUnlocked = userProfile.unlockedAchievements || [];
      const newUnlocks: string[] = [];

      ACHIEVEMENTS.forEach(ach => {
        if (currentlyUnlocked.includes(ach.id)) return;

        let isMet = false;
        if (ach.id === 'first_quest') isMet = true;
        if (ach.id === 'perfect_standard' && gameState.gameMode === 'Standard' && gameState.correctCount === 10) isMet = true;
        if (ach.id === 'genesis_master') {
          const genesisStat = newCategoryStats['Genesis'];
          if (genesisStat && genesisStat.correct === genesisStat.total && genesisStat.total >= 5) isMet = true;
        }
        if (ach.id === 'daily_champion' && gameState.gameMode === 'Daily' && gameState.score >= 500) isMet = true;
        if (ach.id === 'advanced_scholar' && gameState.selectedLevel === 'Advance' && gameState.correctCount >= 8) isMet = true;

        if (isMet) newUnlocks.push(ach.id);
      });

      const updatedAchievements = [...currentlyUnlocked, ...newUnlocks];

      if (newUnlocks.length > 0) {
        // We could show a toast here, but for now we just record it.
        console.log("Unlocked new achievements:", newUnlocks);
      }

      await updateUserProfile(userProfile.userId, {
        totalScore: newTotalScore,
        highScore: newHighScore,
        progress: newProgress,
        categoryStats: newCategoryStats,
        unlockedAchievements: updatedAchievements
      });
    }
  };

  const fetchLeaderboard = async () => {
    setIsFetchingLeaderboard(true);
    try {
      const data = await getLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingLeaderboard(false);
    }
  };

  const fetchDailyManna = async () => {
    setIsFetchingManna(true);
    setMannaError(null);
    try {
      const manna = await getDailyManna();
      setDailyManna(manna);
    } catch (err) {
      console.error('Failed to fetch Daily Manna:', err);
      setMannaError('Unable to load today\'s verse. Please try again.');
    } finally {
      setIsFetchingManna(false);
    }
  };

  const handleShowLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-geo-bg text-geo-text">
      {/* Header Section */}
      <header className="h-16 md:h-20 border-b border-geo-border flex items-center justify-between px-4 md:px-10 bg-white shadow-sm z-20 shrink-0">
        <div className="flex items-center space-x-2 md:space-x-3" id="app-logo">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-geo-primary rounded-lg flex items-center justify-center rotate-45 shadow-lg shadow-geo-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
            <div className="-rotate-45 text-white font-black text-lg md:text-xl leading-none flex items-center justify-center">F</div>
          </div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight text-geo-primary">FAITHQUEST <span className="hidden sm:inline font-light text-geo-accent">BIBLE</span></h1>
        </div>
        
        <div className="flex items-center space-x-4 md:space-x-12">
          {!user ? (
            <button 
              onClick={signInWithGoogle}
              className="geo-btn-primary flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm min-h-[44px]"
              id="login-button"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          ) : (
            <>
              <div className="hidden lg:block text-center border-l border-geo-border pl-6">
                <p className="geo-label">Level</p>
                <p className="text-sm font-bold truncate max-w-[100px]">{gameState.isPlaying ? gameState.selectedLevel : (userProfile?.progress.advance ? 'Advanced' : userProfile?.progress.medium ? 'Intermediate' : 'Beginner')}</p>
              </div>
              <div className="text-center">
                <p className="geo-label">Score</p>
                <p className="text-sm md:text-lg font-bold text-geo-primary">{gameState.isPlaying ? gameState.score : userProfile?.totalScore || 0}</p>
              </div>
              <div className="hidden md:flex flex-col items-center">
                <p className="geo-label">Progress</p>
                <div className="flex items-center space-x-2 mt-1">
                   <div className="w-24 lg:w-32 h-1.5 bg-geo-border rounded-full overflow-hidden">
                     <motion.div 
                       className="h-full bg-geo-primary"
                       initial={{ width: 0 }}
                       animate={{ 
                         width: gameState.isPlaying 
                           ? `${(gameState.currentQuestionIndex / gameState.questions.length) * 100}%` 
                           : '0%' 
                       }}
                     />
                   </div>
                   <span className="text-xs font-bold">
                     {gameState.isPlaying ? `${gameState.currentQuestionIndex + 1}/${gameState.questions.length}` : '--/--'}
                   </span>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-geo-border bg-slate-100 cursor-pointer hover:ring-2 hover:ring-geo-primary transition-all flex-shrink-0"
                  onClick={() => setShowProfile(true)}
                >
                  <img src={userProfile?.photoURL || (userProfile?.avatarSeed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`)} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  id="logout-button"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Sidebar: Selection & Leaderboard */}
        <aside className={`w-full md:w-72 border-r border-geo-border bg-white overflow-y-auto shrink-0 flex flex-col h-auto md:h-full max-h-[50vh] md:max-h-none z-10 shadow-lg md:shadow-none transition-all duration-300 ${gameState.isPlaying ? 'hidden md:flex' : 'flex'}`}>
          {/* Game Configuration Section */}
          <div className="p-6 space-y-8 border-b border-geo-border">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-3.5 h-3.5 text-geo-accent" />
                <h3 className="geo-label leading-none">Game Mode</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 bg-geo-bg p-1 rounded-xl border border-geo-border/50">
                {(['Standard', 'Practice', 'Daily'] as GameMode[]).map((m) => {
                  const isActive = gameState.gameMode === m;
                  return (
                    <button 
                      key={m}
                      disabled={gameState.isPlaying}
                      onClick={() => setGameState(prev => ({ ...prev, gameMode: m }))}
                      className={`py-3 md:py-2 rounded-lg text-xs md:text-[9px] font-black uppercase tracking-tight transition-all min-h-[44px] md:min-h-0 flex items-center justify-center ${
                        isActive 
                          ? 'bg-white text-geo-primary shadow-sm ring-1 ring-geo-primary/10' 
                          : 'text-slate-400 hover:text-slate-600'
                      } ${gameState.isPlaying ? 'cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {gameState.gameMode !== 'Daily' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-3.5 h-3.5 text-geo-accent" />
                  <h3 className="geo-label leading-none">Testament Mode</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {(['Old', 'New', 'Both'] as Testament[]).map((t) => {
                    const isActive = gameState.selectedTestament === t;
                    return (
                      <button 
                        key={t}
                        disabled={gameState.isPlaying}
                        onClick={() => setGameState(prev => ({ ...prev, selectedTestament: t }))}
                        className={`relative flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all group min-h-[44px] ${
                          isActive 
                            ? 'bg-geo-primary text-white shadow-md shadow-geo-primary/20 scale-[1.02]' 
                            : 'bg-geo-bg hover:bg-geo-hover text-geo-text border border-geo-border/50'
                        } ${gameState.isPlaying ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                      >
                        <span>{t === 'Both' ? 'Both Testaments' : `${t} Testament`}</span>
                        {isActive && <motion.div layoutId="active-mode" className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {gameState.gameMode === 'Daily' && (
              <div className="bg-geo-primary/5 border border-geo-primary/20 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-geo-primary rounded-lg flex items-center justify-center text-white">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-geo-primary">Daily Quest</p>
                    <p className="text-xs font-medium text-slate-500">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  Complete today's hand-picked set of 10 questions for a massive bonus reward.
                </p>
              </div>
            )}

            {gameState.gameMode !== 'Daily' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-3.5 h-3.5 text-geo-accent" />
                  <h3 className="geo-label leading-none">Challenge Level</h3>
                </div>
              <div className="flex bg-geo-bg p-1 rounded-xl border border-geo-border/50 shadow-inner">
                {(['Beginner', 'Medium', 'Advance'] as Level[]).map((l) => {
                  const isActive = gameState.selectedLevel === l;
                  return (
                    <button 
                      key={l}
                      disabled={gameState.isPlaying}
                      onClick={() => setGameState(prev => ({ ...prev, selectedLevel: l }))}
                      className={`flex-1 py-3 md:py-2 rounded-lg text-xs md:text-[10px] font-black uppercase tracking-tight transition-all min-h-[44px] md:min-h-0 ${
                        isActive 
                          ? 'bg-white text-geo-primary shadow-sm ring-1 ring-geo-primary/10' 
                          : 'text-slate-400 hover:text-slate-600'
                      } ${gameState.isPlaying ? 'cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {gameState.gameMode === 'Practice' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-3.5 h-3.5 text-geo-accent" />
                  <h3 className="geo-label leading-none">Book / Theme</h3>
                </div>
                <select 
                  disabled={gameState.isPlaying}
                  value={gameState.selectedCategory}
                  onChange={(e) => setGameState(prev => ({ ...prev, selectedCategory: e.target.value }))}
                  className="w-full bg-geo-bg border border-geo-border p-2 rounded-lg text-sm focus:ring-1 focus:ring-geo-primary outline-none"
                >
                  <option value="All">All Books/Themes</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Social Stats Section */}
          <div className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-geo-accent" />
                <h3 className="geo-label leading-none">Global Top 5</h3>
              </div>
              <button 
                onClick={handleShowLeaderboard}
                className="text-[10px] font-bold text-geo-primary hover:underline uppercase tracking-widest"
              >
                View
              </button>
            </div>

            {isFetchingLeaderboard ? (
                 <div className="py-8 text-center bg-geo-bg rounded-2xl border border-dashed border-geo-border/50">
                   <RefreshCw className="w-5 h-5 text-geo-primary mx-auto mb-2 animate-spin" />
                   <p className="text-[10px] text-geo-primary font-bold uppercase tracking-widest animate-pulse">Searching Faithful...</p>
                 </div>
            ) : leaderboardData.length > 0 ? (
              <div className="space-y-3">
                {leaderboardData.slice(0, 5).map((profile, idx) => {
                  const isGold = idx === 0;
                  const isSilver = idx === 1;
                  const isBronze = idx === 2;
                  
                  return (
                    <div 
                      key={profile.userId} 
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        user?.uid === profile.userId 
                          ? 'bg-geo-primary/5 border-geo-primary/20 ring-1 ring-geo-primary/10' 
                          : 'bg-white border-geo-border/20 hover:border-geo-border/60 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-lg overflow-hidden border ${
                            isGold ? 'border-amber-400 ring-2 ring-amber-100' : 
                            isSilver ? 'border-slate-300 ring-2 ring-slate-100' : 
                            isBronze ? 'border-orange-300 ring-2 ring-orange-100' : 'border-geo-border'
                          }`}>
                            <img src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.userId}`} alt="" className="w-full h-full object-cover" />
                          </div>
                          {idx < 3 && (
                            <div className={`absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shadow-sm ${
                              isGold ? 'bg-amber-400 text-white' : 
                              isSilver ? 'bg-slate-400 text-white' : 
                              'bg-orange-400 text-white'
                            }`}>
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-geo-text truncate">{profile.displayName}</p>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter tabular-nums">{profile.highScore} points</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
                <div className="py-8 text-center bg-geo-bg rounded-2xl border border-dashed border-geo-border/50">
                  <RefreshCw className="w-5 h-5 text-geo-border mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Disciples found</p>
                </div>
            )}
          </div>

          <div className="p-6 pt-0 mt-auto border-t border-geo-border">
             <button 
                onClick={() => setShowHistory(true)}
                disabled={!user || gameState.isPlaying}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-geo-border hover:bg-geo-hover transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed group"
             >
                <History className="w-3.5 h-3.5 text-geo-accent group-hover:rotate-12 transition-transform" />
                Mission Log
             </button>
          </div>
        </aside>

        {/* Main Quiz Area */}
        <section className="flex-1 p-4 sm:p-6 md:p-12 flex flex-col items-center overflow-y-auto bg-geo-bg relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {!gameState.isPlaying && !gameState.isGameOver && !showLeaderboard && !showHistory && !showProfile && !showManna && (
              <motion.div 
                key="landing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl w-full flex flex-col items-center text-center space-y-6 md:space-y-10 py-4 md:py-10 h-full justify-center"
              >
                <div className="space-y-4 md:space-y-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-geo-text leading-tight uppercase tracking-tight">
                    The Ultimate <br/> 
                    <span className="text-geo-primary italic underline decoration-geo-border underline-offset-[8px] md:underline-offset-[12px]">Scripture Quest</span>
                  </h2>
                  <p className="text-sm md:text-lg text-slate-500 leading-relaxed max-w-lg mx-auto">
                    A geometrically balanced experience for the faithful. Test your knowledge, earn your place among disciples.
                  </p>
                </div>

                {/* Bento grid layout */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
                  {/* High Score card */}
                  <div className="geo-card p-6 md:p-8 flex flex-col items-center justify-center space-y-3 md:space-y-4">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-geo-hover rounded-full flex items-center justify-center text-geo-accent">
                        <Trophy className="w-6 h-6 md:w-8 md:h-8" />
                     </div>
                     <div>
                        <p className="geo-label">Your Best</p>
                        <p className="text-2xl md:text-3xl font-serif font-bold italic">{userProfile?.highScore || 0}</p>
                     </div>
                  </div>
                  {/* Begin Quest card */}
                  <div className="geo-card p-6 md:p-8 flex flex-col items-center justify-center space-y-3 md:space-y-4 border-geo-primary/20 bg-geo-primary/5">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-geo-primary rounded-full flex items-center justify-center text-white">
                        <Play className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                     </div>
                     <button 
                        onClick={handleStartGame}
                        disabled={!user}
                        className="geo-btn-primary w-full uppercase tracking-widest text-xs py-3 md:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        Begin Quest
                     </button>
                  </div>
                  {/* Daily Manna card - full width */}
                  <div
                    className="col-span-2 geo-card p-5 md:p-6 cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => {
                      if (!dailyManna && !isFetchingManna) fetchDailyManna();
                      setShowManna(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <Sun className="w-4 h-4 text-geo-accent" />
                        </div>
                        <div className="text-left">
                          <p className="geo-label">Daily Manna</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <Sparkles className="w-4 h-4 text-geo-accent opacity-60 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {isFetchingManna ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs italic">Loading today's verse...</span>
                      </div>
                    ) : dailyManna ? (
                      <p className="text-sm font-serif italic text-geo-text text-left leading-relaxed line-clamp-2 md:line-clamp-none">
                        "{dailyManna.verse}" <span className="not-italic text-xs text-geo-primary font-semibold">— {dailyManna.reference}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-left">Tap to receive today's divine inspiration...</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Daily Manna full view */}
            {showManna && (
              <motion.div
                key="daily-manna"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl bg-white border border-geo-border shadow-2xl rounded-2xl p-8 md:p-10 mt-4 overflow-y-auto max-h-[85vh]"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Sun className="w-5 h-5 text-geo-accent" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-black uppercase tracking-tight">Daily Manna</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setShowManna(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-geo-hover transition-colors">
                      <ChevronRight className="w-6 h-6 text-geo-accent rotate-180" />
                    </button>
                  </div>

                  {isFetchingManna ? (
                    <div className="py-16 flex flex-col items-center gap-4 text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-geo-primary" />
                      <p className="text-sm font-medium italic">Receiving today's divine word...</p>
                    </div>
                  ) : mannaError ? (
                    <div className="py-16 flex flex-col items-center gap-4 text-slate-400">
                      <BookMarked className="w-12 h-12 text-slate-200" />
                      <p className="text-sm text-center italic">{mannaError}</p>
                      <button
                        onClick={fetchDailyManna}
                        className="geo-btn-primary flex items-center gap-2 text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                      </button>
                    </div>
                  ) : dailyManna ? (
                    <>
                      <div className="bg-gradient-to-br from-indigo-50 to-amber-50 border border-geo-primary/10 rounded-2xl p-6 md:p-8 space-y-4">
                        <div className="flex items-start gap-3">
                          <BookOpen className="w-5 h-5 text-geo-primary shrink-0 mt-1" />
                          <blockquote className="font-serif text-lg md:text-xl italic text-geo-text leading-relaxed">
                            "{dailyManna.verse}"
                          </blockquote>
                        </div>
                        <div className="flex justify-end">
                          <span className="bg-geo-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                            {dailyManna.reference}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-geo-accent" />
                          <h3 className="geo-label">Devotional Reflection</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                          {dailyManna.devotional}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-geo-border">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Sparkles className="w-3.5 h-3.5 text-geo-accent" />
                          <span className="text-[10px] uppercase tracking-widest font-semibold">Powered by Gemini AI</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowManna(false);
                            handleStartGame('Daily');
                          }}
                          className="geo-btn-primary flex items-center gap-2 text-xs py-2"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Daily Quest
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              </motion.div>
            )}

            {gameState.isPlaying && !gameState.isGameOver && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full max-w-2xl flex flex-col items-center"
              >
                {/* Timer Area */}
                <div className="w-full flex justify-between items-end mb-12">
                  <div className="w-24 h-24 border-4 border-geo-primary rounded-full flex flex-col items-center justify-center relative bg-white shadow-inner">
                    <span className="text-3xl font-black tabular-nums">
                      {gameState.gameMode === 'Practice' ? '∞' : gameState.timer}
                    </span>
                    <span className="text-[8px] uppercase font-bold tracking-tighter">
                      {gameState.gameMode === 'Practice' ? 'Practice' : gameState.gameMode === 'Daily' ? 'Rapid' : 'seconds'}
                    </span>
                    <motion.div 
                      className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-geo-primary rounded-full shadow-lg ${gameState.gameMode === 'Practice' ? 'animate-pulse' : ''}`}
                      animate={gameState.gameMode !== 'Practice' ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-geo-accent text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest leading-none shadow-sm shadow-geo-accent/20">
                      {gameState.gameMode === 'Daily' && <Zap className="w-3 h-3 fill-current" />}
                      {gameState.gameMode} Mode
                    </div>
                    <div className="text-geo-primary font-bold text-sm italic">
                      {gameState.questions[gameState.currentQuestionIndex].testament} Testament • {gameState.questions[gameState.currentQuestionIndex].category || 'General'}
                    </div>
                  </div>
                </div>

                {/* Question Card */}
                <div className="w-full geo-card p-6 md:p-10 mb-6 md:mb-10 overflow-hidden relative shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-geo-primary/5 rounded-full -mr-16 -mt-16" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-center leading-relaxed mb-8 md:mb-12 italic text-geo-text px-2 md:px-4">
                    "{gameState.questions[gameState.currentQuestionIndex].text}"
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
                    {gameState.questions[gameState.currentQuestionIndex].options.map((option, idx) => {
                      const isCorrect = option === gameState.questions[gameState.currentQuestionIndex].correctAnswer;
                      const isSelected = option === selectedOption;
                      
                      let buttonClass = "p-4 md:p-6 border-2 border-geo-border rounded-lg text-base md:text-lg font-medium hover:border-geo-primary hover:bg-[#F0F4F8] transition-all text-left flex items-center space-x-3 md:space-x-4 group min-h-[56px]";
                      let spanClass = "w-8 h-8 shrink-0 bg-geo-hover group-hover:bg-geo-primary group-hover:text-white rounded flex items-center justify-center text-xs font-black transition-colors";

                      if (isShowingFeedback) {
                        if (isCorrect) {
                          buttonClass = "p-4 md:p-6 border-2 border-green-500 bg-green-50 rounded-lg text-base md:text-lg font-medium text-left flex items-center space-x-3 md:space-x-4 group min-h-[56px]";
                          spanClass = "w-8 h-8 shrink-0 bg-green-500 text-white rounded flex items-center justify-center text-xs font-black";
                        } else if (isSelected) {
                          buttonClass = "p-4 md:p-6 border-2 border-red-500 bg-red-50 rounded-lg text-base md:text-lg font-medium text-left flex items-center space-x-3 md:space-x-4 group min-h-[56px]";
                          spanClass = "w-8 h-8 shrink-0 bg-red-500 text-white rounded flex items-center justify-center text-xs font-black";
                        } else {
                          buttonClass = "p-4 md:p-6 border-2 border-geo-border rounded-lg text-base md:text-lg font-medium opacity-40 text-left flex items-center space-x-3 md:space-x-4 group cursor-default min-h-[56px]";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isShowingFeedback}
                          onClick={() => handleAnswerSelect(option)}
                          className={buttonClass}
                          id={`option-${idx}`}
                        >
                          <span className={spanClass}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="truncate">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hint & Action */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-geo-accent">
                    <button 
                      onClick={() => setShowHint(true)}
                      className="w-12 h-12 border border-geo-border rounded-full flex items-center justify-center hover:bg-geo-hover transition-colors shadow-sm"
                    >
                      <HelpCircle className="w-6 h-6" />
                    </button>
                    <div className="max-w-xs transition-opacity overflow-hidden">
                      <p className="geo-label leading-none mb-1">Need a hint?</p>
                      <p className={`text-sm italic italic leading-tight transition-all ${showHint ? 'opacity-100' : 'opacity-30 blur-[2px]'}`}>
                        {showHint ? gameState.questions[gameState.currentQuestionIndex].hint : "Select for Divine guidance..."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-geo-primary font-bold font-serif italic">{gameState.score} pts</span>
                  </div>
                </div>
              </motion.div>
            )}

            {(gameState.isGameOver || showLeaderboard || showHistory || showProfile) && (
              <motion.div 
                key="overlay-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-2xl bg-white border border-geo-border shadow-2xl rounded-2xl p-10 mt-4 overflow-y-auto max-h-[85vh]"
              >
                 {showProfile ? (
                   <div className="space-y-10">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <UserIcon className="w-6 h-6 text-geo-primary" />
                            <h2 className="text-2xl font-serif font-black uppercase tracking-tight">Disciple Profile</h2>
                         </div>
                         <button onClick={() => setShowProfile(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-geo-hover transition-colors rotate-180">
                            <ChevronRight className="w-6 h-6 text-geo-accent" />
                         </button>
                      </div>

                      <div className="flex flex-col md:flex-row gap-10 items-start">
                         <div className="space-y-6 flex flex-col items-center shrink-0">
                            <div className="relative group">
                               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-geo-bg ring-4 ring-geo-primary/10 shadow-xl">
                                  <img 
                                    src={userProfile?.photoURL || (userProfile?.avatarSeed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`)} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                  />
                               </div>
                               <button 
                                 onClick={() => {
                                   const newSeed = Math.random().toString(36).substring(7);
                                   updateUserProfile(user!.uid, { avatarSeed: newSeed });
                                 }}
                                 className="absolute -bottom-2 -right-2 w-10 h-10 bg-geo-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-transform"
                               >
                                  <Camera className="w-4 h-4" />
                               </button>
                            </div>
                            <div className="text-center">
                               <h3 className="text-xl font-bold">{userProfile?.displayName}</h3>
                               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{userProfile?.progress.advance ? 'Grand Master' : userProfile?.progress.medium ? 'High Disciple' : 'Faithful Beginner'}</p>
                            </div>
                         </div>

                         <div className="flex-1 w-full grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex items-center gap-2 mb-2">
                               <PieChart className="w-4 h-4 text-geo-accent" />
                               <h4 className="geo-label">Battle Statistics</h4>
                            </div>
                            
                            <div className="bg-geo-bg p-4 rounded-xl border border-geo-border">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Knowledge Ratio</p>
                               <p className="text-2xl font-serif font-black text-geo-primary">
                                  {userProfile?.gameHistory && userProfile.gameHistory.length > 0
                                    ? Math.round(
                                        (userProfile.gameHistory.reduce((acc, g) => acc + (g.correctCount || 0), 0) / 
                                         userProfile.gameHistory.reduce((acc, g) => acc + (g.totalQuestions || 1), 0)) * 100
                                      )
                                    : 0}%
                               </p>
                            </div>
                            <div className="bg-geo-bg p-4 rounded-xl border border-geo-border">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Score / Match</p>
                               <p className="text-2xl font-serif font-black text-geo-accent">
                                  {userProfile?.gameHistory && userProfile.gameHistory.length > 0
                                    ? Math.round(userProfile.gameHistory.reduce((acc, g) => acc + (g.score || 0), 0) / userProfile.gameHistory.length)
                                    : 0}
                               </p>
                            </div>
                            <div className="bg-geo-bg p-4 rounded-xl border border-geo-border">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Quests</p>
                               <p className="text-2xl font-serif font-black text-slate-700">
                                  {userProfile?.gameHistory?.length || 0}
                               </p>
                            </div>
                            <div className="bg-geo-bg p-4 rounded-xl border border-geo-border">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Best Streak</p>
                               <p className="text-2xl font-serif font-black text-indigo-600">
                                  {userProfile?.highScore || 0}
                               </p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-geo-accent" />
                            <h4 className="geo-label">Thematic Proficiency</h4>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {userProfile?.categoryStats && Object.keys(userProfile.categoryStats).length > 0 ? (
                               Object.entries(userProfile.categoryStats).map(([cat, stats]) => {
                                  const categoryData = stats as { correct: number; total: number };
                                  const percentage = Math.round((categoryData.correct / categoryData.total) * 100);
                                  return (
                                    <div key={cat} className="p-4 bg-geo-bg border border-geo-border rounded-xl flex items-center justify-between">
                                       <div className="space-y-1">
                                          <p className="text-[10px] font-black uppercase tracking-tight text-geo-text">{cat}</p>
                                          <div className="w-24 h-1.5 bg-geo-border rounded-full overflow-hidden">
                                             <div className="h-full bg-geo-primary" style={{ width: `${percentage}%` }} />
                                          </div>
                                       </div>
                                       <span className="font-serif font-black text-geo-primary">{percentage}%</span>
                                    </div>
                                  );
                               })
                            ) : (
                              <p className="col-span-2 text-center text-xs text-slate-400 italic py-6 bg-geo-bg rounded-xl border border-dashed border-geo-border">Finish your first quest to unlock thematic insights.</p>
                            )}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-geo-accent" />
                            <h4 className="geo-label">Spiritual Achievements</h4>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {ACHIEVEMENTS.map(ach => {
                               const isUnlocked = userProfile?.unlockedAchievements?.includes(ach.id);
                               const Icon = {
                                 Scroll: Scroll,
                                 Sun: Sun,
                                 Leaf: Leaf,
                                 Crown: Crown,
                                 Book: BookOpen
                               }[ach.icon] || Award;

                               return (
                                 <div 
                                   key={ach.id} 
                                   className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-3 transition-all ${
                                     isUnlocked 
                                       ? 'bg-white border-geo-border shadow-sm border-b-2 border-b-geo-primary' 
                                       : 'bg-geo-bg border-geo-border/50 opacity-40 grayscale'
                                   }`}
                                 >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-geo-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                                       <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                       <p className={`text-[10px] font-black uppercase tracking-tight ${isUnlocked ? 'text-geo-text' : 'text-slate-400'}`}>{ach.title}</p>
                                       {isUnlocked && <p className="text-[8px] text-slate-400 font-medium leading-none">{ach.description}</p>}
                                    </div>
                                 </div>
                               );
                            })}
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-geo-accent" />
                            <h4 className="geo-label">Pilgrim Settings</h4>
                         </div>
                         <div className="bg-geo-bg p-6 rounded-2xl border border-geo-border space-y-4">
                            <div className="flex items-center justify-between">
                               <div>
                                  <p className="text-xs font-bold text-geo-text">Quest Timer Duration</p>
                                  <p className="text-[10px] text-slate-400">Total time allowed per scripture challenge.</p>
                               </div>
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="range" 
                                    min="15" 
                                    max="60" 
                                    step="5"
                                    value={userProfile?.settings?.defaultTimerDuration || 30}
                                    onChange={(e) => {
                                      const newVal = parseInt(e.target.value);
                                      updateUserProfile(user!.uid, { 
                                        settings: { ...userProfile!.settings, defaultTimerDuration: newVal }
                                      });
                                    }}
                                    className="h-1.5 w-32 bg-geo-border rounded-lg appearance-none cursor-pointer accent-geo-primary"
                                  />
                                  <span className="w-8 text-center font-serif font-black text-geo-primary">
                                     {userProfile?.settings?.defaultTimerDuration || 30}s
                                  </span>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : showHistory ? (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <History className="w-6 h-6 text-geo-primary" />
                            <h2 className="text-2xl font-serif font-black uppercase tracking-tight">Mission Log</h2>
                         </div>
                         <button onClick={() => setShowHistory(false)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-geo-hover transition-colors rotate-180">
                            <ChevronRight className="w-6 h-6 text-geo-accent" />
                         </button>
                      </div>
                      
                      {!userProfile?.gameHistory || userProfile.gameHistory.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed border-geo-border rounded-2xl space-y-4">
                           <History className="w-12 h-12 text-slate-200 mx-auto" />
                           <p className="text-slate-400 italic">"Go therefore and make disciples..."<br/>Your journey is just beginning.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                           {[...userProfile.gameHistory].reverse().map((entry, idx) => (
                             <div key={idx} className="flex items-center justify-between p-6 bg-geo-bg border border-geo-border rounded-2xl group transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-geo-primary/5">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-3">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                        entry.mode === 'Daily' ? 'bg-amber-100 text-amber-600' : 
                                        entry.mode === 'Practice' ? 'bg-blue-100 text-blue-600' : 'bg-geo-primary/10 text-geo-primary'
                                      }`}>
                                         {entry.mode}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                         {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                   </div>
                                   <h4 className="font-serif font-bold text-geo-text leading-tight">
                                      Quest on {entry.testament} Testament
                                   </h4>
                                   <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Difficulty: {entry.level}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-3xl font-serif font-black text-geo-primary leading-none mb-1">{entry.score}</p>
                                   <p className="geo-label text-[8px]">Points Earned</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 ) : gameState.isGameOver ? (
                   <div className="text-center space-y-8">
                      <div className="w-20 h-20 bg-geo-primary rounded-2xl rotate-45 mx-auto flex items-center justify-center shadow-xl shadow-geo-primary/20">
                         <Trophy className="w-10 h-10 text-white -rotate-45" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-serif font-black uppercase tracking-tight">Quest Complete</h2>
                        <p className="text-slate-500 italic">"Study to shew thyself approved unto God..."</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-geo-bg p-6 rounded-xl border border-geo-border">
                            <p className="geo-label">Final Score</p>
                            <p className="text-3xl font-serif font-black text-geo-primary">{gameState.score}</p>
                         </div>
                         <div className="bg-geo-bg p-6 rounded-xl border border-geo-border">
                            <p className="geo-label">Experience</p>
                            <p className="text-3xl font-serif font-black text-geo-accent">+{Math.floor(gameState.score / 10)} XP</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => {
                          setGameState(prev => ({ ...prev, isGameOver: false, isPlaying: false }));
                        }}
                        className="geo-btn-primary w-full py-4 text-xs tracking-[0.2em] uppercase"
                      >
                         Return to Nexus
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-serif font-black uppercase tracking-tight">Echelons of Honor</h2>
                         <button onClick={() => setShowLeaderboard(false)} className="text-geo-accent hover:text-geo-text">
                            <ChevronRight className="w-6 h-6 rotate-180" />
                         </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto scroll-smooth pr-2 custom-scrollbar space-y-3">
                         {leaderboardData.map((profile, i) => {
                            const isCurrentUser = profile.userId === user?.uid;
                            const isTop3 = i < 3;
                            
                            return (
                              <div 
                                key={profile.userId} 
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                  isCurrentUser 
                                    ? 'bg-geo-primary/5 border-geo-primary shadow-lg shadow-geo-primary/5 scale-[1.02]' 
                                    : 'bg-white border-geo-border hover:border-geo-accent/30'
                                }`}
                              >
                                 <div className="flex items-center gap-4 min-w-0">
                                    <div className="relative">
                                       <span className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center ${
                                         i === 0 ? 'bg-amber-400 text-white' :
                                         i === 1 ? 'bg-slate-300 text-white' :
                                         i === 2 ? 'bg-amber-600 text-white' :
                                         'text-slate-300'
                                       }`}>
                                          {i + 1}
                                       </span>
                                       {isTop3 && (
                                         <Medal className={`absolute -top-2 -left-2 w-4 h-4 shadow-sm ${
                                           i === 0 ? 'text-amber-400' :
                                           i === 1 ? 'text-slate-400' :
                                           'text-amber-700'
                                         }`} />
                                       )}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-geo-hover border border-geo-border overflow-hidden relative shadow-inner">
                                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed || profile.userId}`} alt="" />
                                       {isCurrentUser && (
                                         <div className="absolute inset-0 border-2 border-geo-primary rounded-xl" />
                                       )}
                                    </div>
                                    <div className="min-w-0">
                                       <p className={`font-bold truncate ${isCurrentUser ? 'text-geo-primary' : 'text-geo-text'}`}>
                                          {profile.displayName} {isCurrentUser && <span className="text-[8px] uppercase tracking-tighter ml-1 opacity-60 text-geo-primary font-black animate-pulse">(You)</span>}
                                       </p>
                                       <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Rank {i + 1}</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-2xl font-serif font-black text-geo-primary leading-none mb-1">{profile.highScore}</p>
                                    <p className="geo-label text-[8px]">Highest Score</p>
                                 </div>
                              </div>
                            );
                         })}
                      </div>
                   </div>
                 )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer status bar */}
      <footer className="h-10 md:h-12 bg-geo-text text-white flex items-center justify-between px-4 md:px-10 text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase shrink-0 z-20">
        <div className="flex space-x-4 md:space-x-12 overflow-x-auto no-scrollbar scroll-smooth">
          <span className="flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <span className="text-geo-accent">ID:</span> FQB-{user?.uid.slice(0, 4) || 'GUEST'}
          </span>
          <span className="flex items-center gap-1 md:gap-2 whitespace-nowrap underline decoration-geo-accent underline-offset-4">
            <span className="text-geo-accent">Difficulty:</span> {gameState.selectedLevel}
          </span>
          <span className="hidden sm:flex items-center gap-1 md:gap-2 whitespace-nowrap">
            <span className="text-geo-accent">Region:</span> EU-W2
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0 ml-4">
          <motion.span 
            className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <span className="font-medium hidden xs:inline">Live Pool</span>
        </div>
      </footer>
    </div>
  );

}
