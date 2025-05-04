'use client';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, ReactNode } from 'react';
import { BarChart2, LineChart as LineIcon , Flame, Calendar, Clock, Quote, ChevronDown, ChevronUp, UserCircle,Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  HiHome,
  HiClipboardCheck,
  HiChartBar,
  HiFire,
  HiCog,
  HiUser,
  HiSwitchHorizontal,
  HiOutlineFire, HiOutlineSparkles,HiOutlineHeart,
  
  HiPlus,
  HiX,
  HiCheck,
  HiTrash,
  HiPencil,
  
 

} from 'react-icons/hi';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}
interface Habit {
  id: string;
  title: string;
  completed: number;
  target: number;
  streak: number;
  category?: string;
  icon?: ReactNode;
  notes?: string;
}

type WeeklyProgress = {
  habitId: string;
  title: string;
  data: { day: string; value: number }[];
};
const weeklyData: WeeklyProgress[] = [
  {
    habitId: '1',
    title: 'Drink Water',
    data: [
      { day: 'Mon', value: 3 },
      { day: 'Tue', value: 4 },
      { day: 'Wed', value: 2 },
      { day: 'Thu', value: 5 },
      { day: 'Fri', value: 3 },
      { day: 'Sat', value: 4 },
      { day: 'Sun', value: 5 },
    ],
  },
  {
    habitId: '2',
    title: 'Meditation',
    data: [
      { day: 'Mon', value: 2 },
      { day: 'Tue', value: 3 },
      { day: 'Wed', value: 3 },
      { day: 'Thu', value: 2 },
      { day: 'Fri', value: 4 },
      { day: 'Sat', value: 2 },
      { day: 'Sun', value: 3 },
    ],
  },
];


const mockApi = {
  fetchHabits: async (): Promise<Habit[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    return [ {
      id: '1',
      title: 'Drink Water',
      completed: 3,
      target: 5,
      streak: 7,
      icon: <HiOutlineFire className="text-white" />,
      notes: 'Try to drink a glass every hour.',
    },
    {
      id: '2',
      title: 'Meditation',
      completed: 3,
      target: 4,
      streak: 12,
      icon: <HiOutlineSparkles className="text-white" />,
      notes: 'Even 5 minutes helps reset the mind.',
    },
    {
      id: '3',
      title: 'Exercise',
      completed: 4,
      target: 7,
      streak: 5,
      icon: <HiOutlineHeart className="text-white" />,
     
    },
  ];
  },
  updateHabit: async (habitId: string, updatedHabit: Partial<Habit>): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
    console.log(`Mock API: Updated habit ${habitId} with`, updatedHabit); // Simulate API update
  },

  fetchWeeklyProgress: async (): Promise<WeeklyProgress[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return weeklyData;}
};

const habitColorMap: Record<string, string> = {
  '1': '#3B82F6', // blue-500 for Drink Water
  '2': '#8B5CF6', // violet-500 for Meditation
  '3': '#EC4899', // pink-500 for Exercise
};
type ChartType = 'bar' | 'line';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};


  
const mockUser: User = {
  name: 'John Doe',
  greeting: 'Hello there!',
  quote: 'The best way to predict the future is to create it.',
  streakDays: 14,
  lastActivity: '2025-05-01T12:30:00Z',
};


interface CheckInProps {
  habits: Habit[];
  onUpdate: (id: string, updatedHabit: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string) => void;

}
interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`h-2 bg-blue-100 bg-opacity-20 rounded-full overflow-hidden w-full ${className}`}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};
const StatsComponent = (): JSX.Element => {
  const [progressData, setProgressData] = useState<WeeklyProgress[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const data = await mockApi.fetchWeeklyProgress();
        setProgressData(data);
        // Set the first habit as default selected
        if (data.length > 0 && !selectedHabit) {
          setSelectedHabit(data[0].habitId);
        }
      } catch (error) {
        console.error("Failed to fetch habit data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleChartType = (): void => {
    setChartType(chartType === 'bar' ? 'line' : 'bar');
  };

  const selectedHabitData = progressData.find(habit => habit.habitId === selectedHabit);

  const calculateAverage = (data: { day: string; value: number }[]): number => {
    return Math.round(data.reduce((sum, day) => sum + day.value, 0) / data.length);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📊 Weekly Progress</h2>
        
        <button
          onClick={toggleChartType}
          className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
        >
          {chartType === 'bar' ? 
            <><LineIcon size={20} /> Line Chart</> : 
            <><BarChart2 size={20} /> Bar Chart</>
          }
        </button>
      </div>

      {/* Habit Selection Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {progressData.map((habit) => (
          <button
            key={habit.habitId}
            onClick={() => setSelectedHabit(habit.habitId)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedHabit === habit.habitId
                ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {habit.title}
          </button>
        ))}
      </div>

      {/* Chart Display Area */}
      <div className="h-64 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : progressData.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">No progress data available.</p>
          </div>
        ) : !selectedHabitData ? (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">Select a habit to view progress.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={selectedHabitData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name={selectedHabitData.title} 
                  fill={habitColorMap[selectedHabitData.habitId] || '#3B82F6'} 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={selectedHabitData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="linear" 
                  dataKey="value" 
                  name={selectedHabitData.title} 
                  stroke={habitColorMap[selectedHabitData.habitId] || '#3B82F6'} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      {selectedHabitData && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-gray-700">
            <span className="font-bold">{selectedHabitData.title}</span> - Average: {
              calculateAverage(selectedHabitData.data)
            } per day
          </p>
        </div>
      )}
    </div>
  );
};
interface FooterProps {
  setActiveSection: (section: string) => void;
}
const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  const motivationalQuotes = [
    'Small steps every day lead to big results.',
    'Consistency is the key to success.',
    'Your habits shape your future.',
    'Keep going, you’re closer than you think!',
  ];

  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    const random = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(random);
  }, []);

  return (
    <motion.footer
      className="bg-gradient-to-r from-blue-600 to-purple-700 text-white mt-12 py-8"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-label="Footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand Info */}
        <motion.div
          className="flex flex-col items-center md:items-start"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>Habit Tracker</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              ✨
            </motion.span>
          </h2>
          <p className="mt-2 text-white/80 text-sm text-center md:text-left">
            Build better habits, one day at a time.
          </p>
          <p className="mt-2 text-white/70 italic text-sm">"{quote}"</p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          className="flex flex-col items-center md:items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-white/90">
            {[
              { label: 'Home', section: 'home' },
              { label: 'Check-In', section: 'checkin' },
              { label: 'Stats', section: 'stats' },
              { label: 'Profile', section: 'profile' },
            ].map((item) => (
              <motion.li
                key={item.section}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => setActiveSection(item.section)}
                  className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                  aria-label={`Navigate to ${item.label} section`}
                >
                  {item.label}
                </button>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Motivational Stats */}
        <motion.div
          className="flex flex-col items-center md:items-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold mb-3">Your Progress</h3>
          <ul className="space-y-2 text-white/90">
            <li className="flex items-center gap-2">
              <Flame size={16} /> 14-day streak
            </li>
            <li className="flex items-center gap-2">
              <HiChartBar size={16} /> 97% completion rate
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineSparkles size={16} /> 42 tasks completed
            </li>
            <li className="flex items-center gap-2">
              <HiOutlineHeart size={16} /> 4 badges earned
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 mt-8 py-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/70">
          © 2025 Habit Tracker. All rights reserved.
        </p>
        <div className="flex gap-4 text-white/80">
          <motion.a
            href="https://github.com/radha-krish"
            aria-label="GitHub"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="hover:text-white transition-colors"
          >
            <Github size={18} />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/radha-krishna-reddepalli-036936253"
            aria-label="LinkedIn"
            whileHover={{ scale: 1.2, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="hover:text-white transition-colors"
          >
            <Linkedin size={18} />
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
};



const Stats = () => {
  const [progressData, setProgressData] = useState<WeeklyProgress[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    const fetchData = async () => {
      const data = await mockApi.fetchWeeklyProgress(); // Assuming mockApi is available
      setProgressData(data.slice(0, 2)); // Limit to first two habits
    };
    fetchData();
  }, []);

  return (
    <motion.div
    className='mx-10'
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 5, ease: [0.22, 1, 0.36, 1] }}
    >
    <div className="min-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span>📊</span> Weekly Progress
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
          className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <HiSwitchHorizontal className="text-lg" />
          {chartType === 'bar' ? 'Line Chart' : 'Bar Chart'}
        </motion.button>
      </div>

      {progressData.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No progress data available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {progressData.map((habit) => (
            <motion.div
              key={habit.habitId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl p-4 shadow-lg border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{habit.title}</h3>
              <div className="w-full h-48 sm:h-64">
                <ResponsiveContainer>
                  {chartType === 'bar' ? (
                    <BarChart data={habit.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#6366f1" />
                    </BarChart>
                  ) : (
                    <LineChart data={habit.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </motion.div>
  );
};


// Badge component
const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
    {children} 
  </span>
);
const CheckIn = ({ habits, onUpdate, onDelete, onAdd }: CheckInProps) => {
  const [newHabit, setNewHabit] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<{ [key: string]: string }>({});

  // Sort habits by progress percentage
  const sortedHabits = [...habits].sort((a, b) => 
    (b.completed / b.target) - (a.completed / a.target)
  );

  const handleNoteSubmit = (habitId: string) => {
    if (noteText[habitId]?.trim()) {
      onUpdate(habitId, { notes: noteText[habitId] });
    }
    setEditingNotes(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-violet-600 bg-clip-text text-transparent flex items-center gap-2">
          <HiOutlineSparkles className="text-blue-500" />
          Daily Check-In
        </h2>
        
        {!isAdding ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-500 to-violet-600 text-white p-2 rounded-lg flex items-center gap-1 transition-all"
            onClick={() => setIsAdding(true)}
          >
            <HiPlus className="text-lg" />
            <span>Add Habit</span>
          </motion.button>
        ) : null}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (newHabit.trim()) {
                onAdd(newHabit);
                setNewHabit("");
                setIsAdding(false);
              }
            }}
            className="mb-6 overflow-hidden"
          >
            <div className="flex gap-2 items-center bg-blue-50 p-1 pl-4 rounded-lg border border-blue-100">
              <input
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="New habit..."
                className="flex-1 bg-transparent border-none outline-none py-2 text-gray-700"
                autoFocus
              />
              <div className="flex">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-violet-600 p-2 rounded-lg text-white transition-colors"
                >
                  <HiCheck className="text-lg" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="bg-gray-200 p-2 rounded-lg ml-2 text-gray-600 transition-colors"
                  onClick={() => setIsAdding(false)}
                >
                  <HiX className="text-lg" />
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {habits.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No habits yet. Add one to get started!</p>
        </div>
      )}

      <div className="md:grid md:grid-cols-2 md:gap-4">
        <AnimatePresence>
          {sortedHabits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="mb-4 md:mb-0"
            >
              <motion.div 
                className="bg-blue-50 rounded-xl border border-blue-100 overflow-hidden shadow-md h-full"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-2 rounded-lg text-white">
                        {habit.icon || <HiOutlineFire className="text-lg" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{habit.title}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge className="bg-blue-100 text-blue-700">
                            {habit.completed}/{habit.target}
                          </Badge>
                          <Badge className="bg-violet-100 text-violet-700">
                            Streak: {habit.streak}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={habit.completed >= habit.target}
                        className={`p-2 rounded-lg ${
                          habit.completed >= habit.target 
                            ? 'bg-green-100 text-green-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-violet-600 text-white'
                        }`}
                        onClick={() =>
                          onUpdate(habit.id, {
                            completed: Math.min(habit.completed + 1, habit.target),
                          })
                        }
                      >
                        {habit.completed >= habit.target ? (
                          <HiCheck className="text-lg" />
                        ) : (
                          <HiPlus className="text-lg" />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                        onClick={() => onDelete(habit.id)}
                      >
                        <HiTrash className="text-lg" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <ProgressBar value={habit.completed} max={habit.target} className="mt-2" />
                  
                  <div className="mt-4">
                    {editingNotes === habit.id ? (
                      <div className="flex gap-2 items-center bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <textarea
                          value={noteText[habit.id] || habit.notes || ""}
                          onChange={(e) => setNoteText({ ...noteText, [habit.id]: e.target.value })}
                          placeholder="Add notes for today..."
                          className="flex-1 bg-transparent border-none outline-none py-2 text-gray-700 resize-none h-20"
                          autoFocus
                        />
                        <div className="flex flex-col gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="bg-gradient-to-r from-blue-500 to-violet-600 p-2 rounded-lg text-white"
                            onClick={() => handleNoteSubmit(habit.id)}
                          >
                            <HiCheck className="text-lg" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            className="bg-gray-200 p-2 rounded-lg text-gray-600"
                            onClick={() => setEditingNotes(null)}
                          >
                            <HiX className="text-lg" />
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-gray-600 text-sm italic">
                          {habit.notes || "No notes yet..."}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                          onClick={() => setEditingNotes(habit.id)}
                        >
                          <HiPencil className="text-lg" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};



  
interface MenuItem {
  label: string;
  section: string;
  path: string;
  icon: React.ReactNode;
}




interface User {
  name: string;
  greeting: string;
  quote: string;
  streakDays?: number;
  lastActivity?: string;
}

interface WelcomeBannerProps {
  user: User;
  setActiveSection: (section: string) => void;
}


interface TodaysHabitsProps {
  habits: Habit[];
}



interface TodaysHabitsProps {
  habits: Habit[];
  onHabitUpdate: (habitId: string) => void; // Callback to update habit
}

const TodaysHabits: React.FC<TodaysHabitsProps> = ({ habits , onHabitUpdate }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const habitVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Function to determine progress color based on completion percentage
  const getProgressColor = (completed: number, target: number) => {
    const percentage = (completed / target) * 100;
    if (percentage >= 100) return "from-green-400 to-green-500";
    if (percentage >= 60) return "from-blue-400 to-blue-500";
    if (percentage >= 30) return "from-yellow-400 to-yellow-500";
    return "from-red-400 to-red-500";
  };

  // Function to get emoji based on completion status
  const getStatusEmoji = (completed: number, target: number) => {
    const percentage = (completed / target) * 100;
    if (percentage >= 100) return "🎉";
    if (percentage >= 60) return "👍";
    if (percentage >= 30) return "🔄";
    return "🏃";
  };

  // Handle complete button click
  const handleComplete = (habitId: string) => {
    onHabitUpdate(habitId); // Trigger update in parent component
  };

  return (
    <motion.div
      className="mt-6 bg-white/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex justify-between items-center mb-6">
        <motion.h2 
          className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Today's Habits
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.5 
            }}
          >
            ✓
          </motion.span>
        </motion.h2>
        
        <motion.div
          className="text-xs sm:text-sm bg-blue-50 text-blue-600 px-2 sm:px-3 py-1 rounded-full font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {habits.length} habits
        </motion.div>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {habits.map(habit => (
          <motion.div 
            key={habit.id} 
            className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            variants={habitVariants}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getProgressColor(habit.completed, habit.target)} text-white text-lg sm:text-xl`}>
                  {habit.icon || getStatusEmoji(habit.completed, habit.target)}
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">{habit.title}</span>
                {habit.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {habit.category}
                  </span>
                )}
              </div>
              
              <motion.div 
                className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <motion.span
                  animate={{ 
                    rotate: [0, -5, 5, -5, 0],
                  }}
                  transition={{ 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  🔥
                </motion.span>
                <span className="font-medium">{habit.streak}-day streak</span>
              </motion.div>
            </div>
            
            <div className="relative w-full bg-gray-100 rounded-full h-2 sm:h-3 mb-3 overflow-hidden">
              <motion.div
                className={`bg-gradient-to-r ${getProgressColor(habit.completed, habit.target)} h-2 sm:h-3 rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((habit.completed / habit.target) * 100, 100)}%` }}
                transition={{ 
                  duration: 1, 
                  ease: "easeOut",
                  delay: 0.3,
                }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {habit.completed}/{habit.target} completed
              </div>
              
              <div className="flex gap-1 sm:gap-2">
                {Array.from({ length: habit.target }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${
                      idx < habit.completed 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-300'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.5 + (idx * 0.1),
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    {idx < habit.completed ? "✓" : ""}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {habit.completed < habit.target && (
              <motion.button
                className="mt-3 sm:mt-4 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg font-medium text-xs sm:text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleComplete(habit.id)}
              >
                <span>Complete Next</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        ))}
      </motion.div>

      {habits.length === 0 && (
        <motion.div 
          className="text-center py-10 text-gray-500 text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No habits scheduled for today.
        </motion.div>
      )}
    </motion.div>
  );
};




  

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ user, setActiveSection }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 25 }}
      transition={{ 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative overflow-hidden md:p-10 p-2"
    >
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 opacity-10">
          <motion.div 
            className="absolute top-10 right-10 w-16 sm:w-24 h-16 sm:h-24 rounded-full bg-black"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute top-20 right-24 sm:right-36 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-white"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>

        <div className="relative z-10">
          {/* User greeting section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
            <div className="w-full">
              <motion.h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span>{user.greeting}, </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  {user.name}
                </span>
                <motion.span
                  initial={{ rotate: -30, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.5
                  }}
                >
                  👋
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="mt-3 text-white/80 text-sm sm:text-base max-w-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {user.quote}
              </motion.p>
            </div>

            {/* Stats card - only shows if streak data exists */}
            {user.streakDays !== undefined && (
              <motion.div 
                className="w-full md:w-auto bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-white/20 shadow-inner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className="text-center">
                  <p className="text-white/70 text-xs sm:text-sm">Current Streak</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <motion.span
                      className="text-xl sm:text-2xl text-white font-bold"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500,
                        delay: 0.8
                      }}
                    >
                      {user.streakDays}
                    </motion.span>
                    <motion.span
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        color: ["#FDE047", "#FCD34D", "#F59E0B", "#FCD34D", "#FDE047"]
                      }}
                      transition={{ 
                        duration: 0.6,
                        delay: 1, 
                        ease: "easeInOut",
                      }}
                      className="text-xl sm:text-2xl"
                    >
                      🔥
                    </motion.span>
                  </div>
                  <p className="text-white/50 text-xs mt-1">
                    Last activity: {user.lastActivity || 'Today'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <motion.div 
            className="flex md:flex-row gap-3 mt-5 w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <button 
              className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 shadow-sm hover:shadow flex items-center gap-2 w-full sm:w-auto justify-center"
              onClick={() => setActiveSection('checkin')}>
              <span>Check In Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 w-full sm:w-auto text-center"
              onClick={() => setActiveSection('stats')}
            >
              View Stats
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};


const ProfileComponent = ({ user }:{ user: User }) => {
  const [expanded, setExpanded] = useState(false);
  const [isStreakAnimating, setIsStreakAnimating] = useState(false);

  useEffect(() => {
    setIsStreakAnimating(true);
    const timer = setTimeout(() => setIsStreakAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto px-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 50 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-700 px-6 pt-8 pb-16 relative">
          <div className="absolute inset-0 bg-pattern bg-repeat opacity-5" />
          <motion.div
            className="flex items-center gap-3 relative z-10"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white ring-2 ring-white/30"
              whileHover={{ scale: 1.05 }}
            >
              <UserCircle size={40} />
            </motion.div>
            <div>
              <motion.h1
                className="text-xl font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {user.name}
              </motion.h1>
              <motion.p
                className="text-white/80 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {user.greeting}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-2xl mx-4 -mt-12 p-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Streak */}
          <motion.div className="flex items-center gap-4 mb-6" variants={itemVariants}>
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.1, rotate: 10 }}
              animate={
                isStreakAnimating
                  ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.8 }}
            >
              <Flame className="text-white" size={26} />
            </motion.div>
            <div>
              <h3 className="text-gray-500 text-sm">Current Streak</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-800">{user.streakDays}</span>
                <span className="ml-1 text-gray-600">days</span>
              </div>
            </div>
          </motion.div>

          {/* Last Active */}
          <motion.div className="flex items-center gap-3 mb-6" variants={itemVariants}>
            <Clock size={18} className="text-blue-500" />
            <div>
              <span className="text-gray-600">Last active </span>
              <span className="font-medium text-gray-700">{formatTimeAgo(user.lastActivity)}</span>
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div className="mb-4" variants={itemVariants}>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-violet-500 relative">
              <Quote size={16} className="text-violet-500 absolute top-2 left-2 opacity-20" />
              <p className="text-gray-700 italic pl-5">"{user.quote}"</p>
            </div>
          </motion.div>

          {/* Expandable Section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                key="extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 border-t pt-4"
              >
                <div className="space-y-3">
                  <motion.div className="flex items-center gap-3" variants={itemVariants}>
                    <Calendar size={18} className="text-blue-500" />
                    <div>
                      <span className="text-gray-600">Member since </span>
                      <span className="font-medium text-gray-700">January 2025</span>
                    </div>
                  </motion.div>

                  <motion.div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-blue-50 rounded-xl p-3 text-center shadow-sm">
                      <span className="block text-lg font-bold text-blue-600">97%</span>
                      <span className="text-xs text-blue-800">Completion</span>
                    </div>
                    <div className="bg-violet-50 rounded-xl p-3 text-center shadow-sm">
                      <span className="block text-lg font-bold text-violet-600">42</span>
                      <span className="text-xs text-violet-800">Tasks Done</span>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center shadow-sm">
                      <span className="block text-lg font-bold text-orange-600">4</span>
                      <span className="text-xs text-orange-800">Badges</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <motion.button
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-5 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variants={itemVariants}
          >
            {expanded ? (
              <>
                Show less <ChevronUp size={16} />
              </>
            ) : (
              <>
                Show more <ChevronDown size={16} />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};
const Navbar: React.FC<NavbarProps> = ({ activeSection, setActiveSection }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems: MenuItem[] = [
    { label: 'Home', section: 'home', path: '/', icon: <HiHome className="text-xl" /> },
    { label: 'Check-In', section: 'checkin', path: '/checkin', icon: <HiClipboardCheck className="text-xl" /> },
    { label: 'Stats', section: 'stats', path: '/stats', icon: <HiChartBar className="text-xl" /> },
   
    { label: 'Profile', section: 'profile', path: '/profile', icon: <HiUser className="text-xl" /> },
  ];

  const handleNavigation = (section: string, path: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);

    if (path === '/') {
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } 
    } 
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.2 }}
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled ? 'md:bg-white/80 backdrop-blur-md shadow-lg' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div className="text-xl font-bold flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <span className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Habit
            </span>
            <span className="relative">
              <span className="text-2xl text-gray-800">Tracker</span>
              <motion.span
                className="absolute -top-1 -right-3 text-2xl text-blue-500"
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 15, 0, 15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              >
                ✦
              </motion.span>
            </span>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-gray-100/80 hover:bg-gray-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              <motion.div animate={isMobileMenuOpen ? 'open' : 'closed'} className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: 45, y: 9 } }}
                  className="w-full h-0.5 bg-gray-800 block rounded-full"
                />
                <motion.span
                  variants={{ closed: { opacity: 1 }, open: { opacity: 0 } }}
                  className="w-full h-0.5 bg-gray-800 block rounded-full"
                />
                <motion.span
                  variants={{ closed: { rotate: 0, y: 0 }, open: { rotate: -45, y: -9 } }}
                  className="w-full h-0.5 bg-gray-800 block rounded-full"
                />
              </motion.div>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex space-x-1 items-center">
              {menuItems.map((item) => (
                <motion.li className="mx-1" key={item.section} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => handleNavigation(item.section, item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      activeSection === item.section
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md'
                        : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-2xl z-40 rounded-l-2xl"
          >
            <div className="flex flex-col h-full">
              <div className="p-5 font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Habit Tracker
              </div>
              <nav className="flex-1 px-3 py-4 bg-white">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <motion.li key={item.section} whileHover={{ x: 5 }} whileTap={{ scale: 0.98 }}>
                      <button
                        onClick={() => handleNavigation(item.section, item.path)}
                        className={`flex items-center w-full gap-3 p-3 rounded-xl transition-all duration-300 ${
                          activeSection === item.section
                            ? 'bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            activeSection === item.section
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
                Keep your habits strong 💪
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};




// Define the functional component using React.FC
const Home: React.FC = () => {
  // State to track which section is active (initially 'home')
  const [activeSection, setActiveSection] = useState<string>('home');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await mockApi.fetchHabits();
      setHabits(data);
    };
    fetch();
  }, []);
  const handleUpdate = async (id: string, updatedHabit: Partial<Habit>) => {
    await mockApi.updateHabit(id, updatedHabit);
    setHabits((prev) =>
      prev.map((habit) => (habit.id === id ? { ...habit, ...updatedHabit } : habit))
    );
  };

  const handleDelete = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
  };

  const handleAdd = (title: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      completed: 0,
      target: 5,
      streak: 0,
      icon: <HiOutlineFire className="text-white" />,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  useEffect(() => {
    const loadHabits = async () => {
      try {
        setIsLoading(true);
        const fetchedHabits = await mockApi.fetchHabits();
        setHabits(fetchedHabits);
      } catch (err) {
        setError('Failed to load habits. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    loadHabits();
  }, []);

  
  const handleHabitUpdate = async (habitId: string) => {
    const updatedHabit = habits.find((habit) => habit.id === habitId);
    if (!updatedHabit) return;

    const newCompleted = updatedHabit.completed + 1;
    const newStreak =
      newCompleted >= updatedHabit.target ? updatedHabit.streak + 1 : updatedHabit.streak;

    try {
      await mockApi.updateHabit(habitId, { completed: newCompleted, streak: newStreak });
      setHabits(
        habits.map((habit) =>
          habit.id === habitId ? { ...habit, completed: newCompleted, streak: newStreak } : habit
        )
      );
    } catch (err) {
      console.error('Failed to update habit:', err);
    }
  };
  return (
    <div>
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="pt-16">
        {activeSection === 'home' && (
          <div className="flex-col">
            <WelcomeBanner user={mockUser} setActiveSection={setActiveSection} />
            {isLoading ? (
              <motion.div
                className="text-center py-10 text-gray-500 text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Loading habits...
              </motion.div>
            ) : error ? (
              <motion.div
                className="text-center py-10 text-red-500 text-sm sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {error}
              </motion.div>
            ) : (
              <TodaysHabits habits={habits} onHabitUpdate={handleHabitUpdate} />
             
            )}
             <Stats/>
          </div>
        )}
        {activeSection==="checkin" &&(
          <>
         <CheckIn habits={habits} onUpdate={handleUpdate} onDelete={handleDelete} onAdd={handleAdd} />
          </>
        )}
        {activeSection==="stats" && (
          <>
        <StatsComponent/>
          </>
        )}

{activeSection==="profile" &&(
          <>
        <ProfileComponent user={mockUser} />;
          </>
        )}
       
      </main>
      <Footer setActiveSection={setActiveSection}/>
    </div>
  );
};

export default Home;