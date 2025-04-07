"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartPie, FaMoneyBillWave, FaArrowRight, FaRedo, FaLightbulb, FaRocket, FaMagic, FaRegThumbsUp, FaRegThumbsDown, FaDownload, FaShare, FaInfoCircle, FaRegStar, FaStar } from 'react-icons/fa';
import { HiCurrencyDollar, HiOutlineCash, HiTrendingUp, HiTrendingDown, HiOutlineSparkles, HiOutlineLightningBolt } from 'react-icons/hi';
import confetti from 'canvas-confetti';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale);

// Update the API_URL to ensure it matches your backend server address
const API_URL = 'http://localhost:8000';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.5
    }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const buttonVariants = {
  hover: { 
    scale: 1.05,
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

const glowAnimation = {
  initial: { boxShadow: "0 0 0 rgba(66, 153, 225, 0)" },
  animate: {
    boxShadow: ["0 0 0 rgba(66, 153, 225, 0)", "0 0 20px rgba(66, 153, 225, 0.7)", "0 0 0 rgba(66, 153, 225, 0)"],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    }
  }
};

// Confetti function
const triggerConfetti = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // since particles fall down, start a bit higher than random
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
};

export default function BudgetForecast() {
  const [quarters, setQuarters] = useState([
    { revenue: '', expenditure: '', gross_profit: '' },
    { revenue: '', expenditure: '', gross_profit: '' },
    { revenue: '', expenditure: '', gross_profit: '' },
    { revenue: '', expenditure: '', gross_profit: '' },
  ]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('table');
  const [showTip, setShowTip] = useState(true);
  const [showExampleData, setShowExampleData] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [rating, setRating] = useState(0);
  const [showThemes, setShowThemes] = useState(false);
  const [activeChart, setActiveChart] = useState('line');
  const confettiRef = useRef(null);
  const controls = useAnimation();

  // Example data for quick filling
  const exampleData = [
    { revenue: '200000', expenditure: '50000', gross_profit: '150000' },
    { revenue: '400000', expenditure: '100000', gross_profit: '300000' },
    { revenue: '600000', expenditure: '200000', gross_profit: '400000' },
    { revenue: '700000', expenditure: '300000', gross_profit: '400000' },
  ];

  // Theme options
  const themes = {
    light: {
      primary: 'from-blue-600 to-indigo-700',
      secondary: 'bg-white',
      text: 'text-gray-800',
      accent: 'bg-blue-100 text-blue-700',
      button: 'from-blue-600 to-blue-700',
      background: 'from-gray-50 to-blue-50',
      header: 'from-gray-800 to-gray-900',
    },
    dark: {
      primary: 'from-purple-600 to-indigo-800',
      secondary: 'bg-gray-800',
      text: 'text-gray-100',
      accent: 'bg-indigo-900 text-indigo-200',
      button: 'from-purple-600 to-indigo-700',
      background: 'from-gray-900 to-indigo-950',
      header: 'from-black to-gray-900',
    },
    ocean: {
      primary: 'from-teal-500 to-blue-600',
      secondary: 'bg-white',
      text: 'text-gray-800',
      accent: 'bg-teal-100 text-teal-700',
      button: 'from-teal-500 to-blue-500',
      background: 'from-gray-50 to-teal-50',
      header: 'from-teal-800 to-blue-900',
    },
    sunset: {
      primary: 'from-orange-500 to-pink-600',
      secondary: 'bg-white',
      text: 'text-gray-800',
      accent: 'bg-orange-100 text-orange-700',
      button: 'from-orange-500 to-pink-500',
      background: 'from-gray-50 to-orange-50',
      header: 'from-orange-800 to-pink-900',
    },
    forest: {
      primary: 'from-green-600 to-teal-700',
      secondary: 'bg-white',
      text: 'text-gray-800',
      accent: 'bg-green-100 text-green-700',
      button: 'from-green-600 to-teal-600',
      background: 'from-gray-50 to-green-50',
      header: 'from-green-800 to-teal-900',
    }
  };

  useEffect(() => {
    // Hide tip after 5 seconds
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showConfetti && confettiRef.current) {
      triggerConfetti();
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [showConfetti]);

  const handleQuarterChange = (index, field, value) => {
    const newQuarters = [...quarters];
    newQuarters[index][field] = value;
    
    // Auto-calculate gross profit if revenue and expenditure are provided
    if (field === 'revenue' || field === 'expenditure') {
      const revenue = field === 'revenue' ? parseFloat(value) || 0 : parseFloat(newQuarters[index].revenue) || 0;
      const expenditure = field === 'expenditure' ? parseFloat(value) || 0 : parseFloat(newQuarters[index].expenditure) || 0;
      newQuarters[index].gross_profit = (revenue - expenditure).toFixed(2);
    }
    
    setQuarters(newQuarters);
  };

  const fillExampleData = () => {
    setQuarters(exampleData);
    setShowExampleData(false);
    
    // Animate the form to draw attention
    controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.5 }
    });
  };

  const clearAllData = () => {
    setQuarters([
      { revenue: '', expenditure: '', gross_profit: '' },
      { revenue: '', expenditure: '', gross_profit: '' },
      { revenue: '', expenditure: '', gross_profit: '' },
      { revenue: '', expenditure: '', gross_profit: '' },
    ]);
  };

  const validateInput = () => {
    for (let i = 0; i < quarters.length; i++) {
      const q = quarters[i];
      if (!q.revenue || !q.expenditure || !q.gross_profit) {
        setError(`Please fill in all fields for Quarter ${i + 1}`);
        return false;
      }
      
      if (parseFloat(q.revenue) <= 0 || parseFloat(q.expenditure) <= 0) {
        setError(`Revenue and expenditure must be positive for Quarter ${i + 1}`);
        return false;
      }
      
      const calculatedGrossProfit = parseFloat(q.revenue) - parseFloat(q.expenditure);
      if (Math.abs(parseFloat(q.gross_profit) - calculatedGrossProfit) > 0.01) {
        setError(`Income should equal revenue - expenditure for Quarter ${i + 1}`);
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formattedQuarters = quarters.map(q => ({
        revenue: parseFloat(q.revenue),
        expenditure: parseFloat(q.expenditure),
        gross_profit: parseFloat(q.gross_profit)
      }));
      
      // Using the improved model by default (no model selection)
      const response = await axios.post(`${API_URL}/forecast`, {
        past_quarters: formattedQuarters
      }, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setForecast(response.data);
      // Switch to charts view after successful forecast
      setActiveTab('charts');
      // Trigger confetti effect on successful forecast
      setShowConfetti(true);
    } catch (err) {
      console.error('Forecast error:', err);
      
      // More detailed error reporting
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Server error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`);
        console.error('Error response:', err.response.data);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error: Could not connect to the backend server. Please make sure the server is running.');
        console.error('No response received:', err.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!forecast) return null;
    
    const pastQuarters = quarters.map((q, i) => ({
      revenue: parseFloat(q.revenue),
      expenditure: parseFloat(q.expenditure),
      gross_profit: parseFloat(q.gross_profit),
      label: `Q${i+1}`
    }));
    
    const nextQuarter = {
      revenue: forecast.next_quarter_revenue,
      expenditure: forecast.next_quarter_expenditure,
      gross_profit: forecast.next_quarter_gross_profit,
      label: 'Next Q'
    };
    
    const allQuarters = [...pastQuarters, nextQuarter];
    
    // Line chart data
    const lineChartData = {
      labels: allQuarters.map(q => q.label),
      datasets: [
        {
          label: 'Revenue',
          data: allQuarters.map(q => q.revenue),
          borderColor: theme === 'dark' ? 'rgb(129, 140, 248)' : 'rgb(53, 162, 235)',
          backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.5)' : 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Expenditure',
          data: allQuarters.map(q => q.expenditure),
          borderColor: theme === 'dark' ? 'rgb(244, 114, 182)' : 'rgb(255, 99, 132)',
          backgroundColor: theme === 'dark' ? 'rgba(244, 114, 182, 0.5)' : 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Income',
          data: allQuarters.map(q => q.gross_profit),
          borderColor: theme === 'dark' ? 'rgb(52, 211, 153)' : 'rgb(75, 192, 192)',
          backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.5)' : 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        }
      ]
    };
    
    // Bar chart data for next quarter comparison
    const barChartData = {
      labels: ['Revenue', 'Expenditure', 'Income'],
      datasets: [
        {
          label: 'Current Quarter (Q4)',
          data: [
            pastQuarters[3].revenue,
            pastQuarters[3].expenditure,
            pastQuarters[3].gross_profit
          ],
          backgroundColor: theme === 'dark' ? 'rgba(129, 140, 248, 0.6)' : 'rgba(53, 162, 235, 0.6)',
        },
        {
          label: 'Next Quarter (Forecast)',
          data: [
            nextQuarter.revenue,
            nextQuarter.expenditure,
            nextQuarter.gross_profit
          ],
          backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.6)' : 'rgba(75, 192, 192, 0.6)',
        }
      ]
    };
    
    // Doughnut chart for next quarter breakdown
    const doughnutChartData = {
      labels: ['Revenue', 'Expenditure'],
      datasets: [
        {
          data: [nextQuarter.revenue, nextQuarter.expenditure],
          backgroundColor: theme === 'dark' 
            ? ['rgba(129, 140, 248, 0.8)', 'rgba(244, 114, 182, 0.8)']
            : ['rgba(53, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
          borderColor: theme === 'dark'
            ? ['rgba(129, 140, 248, 1)', 'rgba(244, 114, 182, 1)']
            : ['rgba(53, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
    
    // Polar area chart for financial metrics
    const polarAreaData = {
      labels: ['Revenue Growth', 'Expenditure Growth', 'Income Growth', 'Profit Margin'],
      datasets: [
        {
          data: [
            Math.max(0, ((nextQuarter.revenue / pastQuarters[3].revenue) - 1) * 100),
            Math.max(0, ((nextQuarter.expenditure / pastQuarters[3].expenditure) - 1) * 100),
            Math.max(0, ((nextQuarter.gross_profit / pastQuarters[3].gross_profit) - 1) * 100),
            (nextQuarter.gross_profit / nextQuarter.revenue) * 100
          ],
          backgroundColor: theme === 'dark'
            ? ['rgba(129, 140, 248, 0.7)', 'rgba(244, 114, 182, 0.7)', 'rgba(52, 211, 153, 0.7)', 'rgba(251, 191, 36, 0.7)']
            : ['rgba(53, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)'],
        }
      ]
    };
    
    return {
      lineChartData,
      barChartData,
      doughnutChartData,
      polarAreaData
    };
  };
  
  const chartData = forecast ? prepareChartData() : null;

  // Calculate trend percentages
  const calculateTrends = () => {
    if (!forecast) return null;
    
    const currentRevenue = parseFloat(quarters[3].revenue);
    const currentExpenditure = parseFloat(quarters[3].expenditure);
    const currentProfit = parseFloat(quarters[3].gross_profit);
    
    const revenueTrend = ((forecast.next_quarter_revenue / currentRevenue) - 1) * 100;
    const expenditureTrend = ((forecast.next_quarter_expenditure / currentExpenditure) - 1) * 100;
    const profitTrend = ((forecast.next_quarter_gross_profit / currentProfit) - 1) * 100;
    
    return {
      revenue: revenueTrend.toFixed(1),
      expenditure: expenditureTrend.toFixed(1),
      profit: profitTrend.toFixed(1)
    };
  };
  
  const trends = forecast ? calculateTrends() : null;

  // Function to handle feedback
  const handleFeedback = (isPositive) => {
    // In a real app, you would send this feedback to your backend
    console.log(`User gave ${isPositive ? 'positive' : 'negative'} feedback`);
    setFeedbackGiven(true);
  };

  // Function to handle star rating
  const handleRating = (value) => {
    setRating(value);
  };

  // Function to simulate downloading the forecast
  const handleDownload = () => {
    if (!forecast) return;
    
    // Create a downloadable content
    const content = {
      forecast_date: new Date().toISOString(),
      past_quarters: quarters.map((q, i) => ({
        quarter: `Q${i+1}`,
        revenue: parseFloat(q.revenue),
        expenditure: parseFloat(q.expenditure),
        gross_profit: parseFloat(q.gross_profit)
      })),
      next_quarter_forecast: {
        revenue: forecast.next_quarter_revenue,
        expenditure: forecast.next_quarter_expenditure,
        gross_profit: forecast.next_quarter_gross_profit
      },
      trends: trends
    };
    
    // Create a blob and download link
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'forecast_report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to toggle theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    setShowThemes(false);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themes[theme].background} py-12 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className={`bg-gradient-to-r ${themes[theme].primary} rounded-2xl shadow-2xl p-8 mb-10 text-white overflow-hidden relative`}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-16 -mr-16"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -mb-10 -ml-10"></div>
          
          <div className="flex justify-center items-center mb-4">
            <motion.h1 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-4xl font-bold text-center flex items-center"
            >
              <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="mr-3"
              >
                <HiOutlineSparkles className="text-yellow-300 text-3xl" />
              </motion.div>
              Forecast
            </motion.h1>
            
            <div className="absolute right-0">
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowThemes(!showThemes)}
      className="p-2 bg-white bg-opacity-20 rounded-lg text-white"
    >
      <FaMagic className="text-xl" />
    </motion.button>
              
              <AnimatePresence>
                {showThemes && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden"
                  >
                    <div className="p-2">
                      <p className="text-gray-700 font-medium px-3 py-2">Choose Theme</p>
                      {Object.keys(themes).map((themeName) => (
                        <button
                          key={themeName}
                          onClick={() => changeTheme(themeName)}
                          className={`w-full text-left px-3 py-2 rounded-md text-gray-700 flex items-center ${theme === themeName ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${themes[themeName].primary} mr-2`}></div>
                          {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl text-center opacity-90"
          >
            Predict your next quarter's financial performance with AI-powered forecasting
          </motion.p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {!forecast ? (
            <motion.div 
              key="input-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${themes[theme].secondary} rounded-2xl shadow-xl overflow-hidden`}
            >
              <div className="p-8 border-b border-gray-200">
                <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <motion.div
                      variants={pulseAnimation}
                      initial="initial"
                      animate="animate"
                      className="text-blue-600 text-3xl mr-4"
                    >
                      <FaChartLine />
                    </motion.div>
                    <h2 className={`text-3xl font-bold ${themes[theme].text}`}>Enter Past 4 Quarters Data</h2>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => setShowExampleData(!showExampleData)}
                      className={`px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-all duration-300`}
                    >
                      <FaLightbulb className="mr-2" />
                      Example Data
                    </motion.button>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      onClick={clearAllData}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center transition-all duration-300"
                    >
                      <FaRedo className="mr-2" />
                      Clear All
                    </motion.button>
                  </div>
                </motion.div>
                
                <AnimatePresence>
                  {showExampleData && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-blue-800">Example Data </h3>
                        <motion.button
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                          onClick={fillExampleData}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                        >
                          Use This Data
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-blue-700">Q1</p>
                          <p>Revenue: ₹200,000</p>
                          <p>Expenditure: ₹50,000</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Q2</p>
                          <p>Revenue: ₹400,000</p>
                          <p>Expenditure: ₹100,000</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Q3</p>
                          <p>Revenue: ₹600,000</p>
                          <p>Expenditure: ₹200,000</p>
                        </div>
                        <div>
                          <p className="font-medium text-blue-700">Q4</p>
                          <p>Revenue: ₹700,000</p>
                          <p>Expenditure: ₹300,000</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {showTip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg flex items-start"
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{ duration: 1, delay: 1 }}
                      className="text-blue-500 text-xl mr-3 mt-1 flex-shrink-0"
                    >
                      <FaLightbulb />
                    </motion.div>
                    <div>
                      <p className="text-blue-700 font-medium">Pro Tip</p>
                      <p className="text-blue-600">Enter your financial data for the past 4 quarters to get an accurate forecast. Our AI model is specially tuned to detect patterns like constant growth of 2 lakhs between quarters.</p>
                    </div>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <motion.div 
                    variants={itemVariants} 
                    className="overflow-hidden rounded-xl border border-gray-300 mb-8 shadow-sm"
                    animate={controls}
                  >
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className={`w-1/6 bg-gradient-to-r from-gray-100 to-gray-50 p-5 text-left text-xl font-semibold text-gray-700 border-b border-r border-gray-300`}>Quarter</th>
                          <th className="w-5/18 bg-gradient-to-r from-gray-100 to-gray-50 p-5 text-left text-xl font-semibold text-gray-700 border-b border-r border-gray-300">
                            <div className="flex items-center">
                              <HiCurrencyDollar className="text-blue-500 mr-2 text-2xl" />
                              Revenue
                            </div>
                          </th>
                          <th className="w-5/18 bg-gradient-to-r from-gray-100 to-gray-50 p-5 text-left text-xl font-semibold text-gray-700 border-b border-r border-gray-300">
                            <div className="flex items-center">
                              <HiOutlineCash className="text-red-500 mr-2 text-2xl" />
                              Expenditure
                            </div>
                          </th>
                          <th className="w-5/18 bg-gradient-to-r from-gray-100 to-gray-50 p-5 text-left text-xl font-semibold text-gray-700 border-b border-gray-300">
                            <div className="flex items-center">
                              <FaMoneyBillWave className="text-green-500 mr-2 text-xl" />
                              Income
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {quarters.map((quarter, index) => (
                          <motion.tr 
                            key={index}
                            variants={itemVariants} 
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}
                          >
                            <td className="p-5 text-xl font-medium text-gray-700 border-r border-gray-300">
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center"
                              >
                                Q{index + 1}
                              </motion.div>
                            </td>
                            <td className="p-5 border-r border-gray-300">
                              <motion.div whileHover={{ scale: 1.02 }}>
                                <input
                                  type="number"
                                  className="w-full p-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  value={quarter.revenue}
                                  onChange={(e) => handleQuarterChange(index, 'revenue', e.target.value)}
                                  placeholder="Enter revenue"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </motion.div>
                            </td>
                            <td className="p-5 border-r border-gray-300">
                              <motion.div whileHover={{ scale: 1.02 }}>
                                <input
                                  type="number"
                                  className="w-full p-4 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  value={quarter.expenditure}
                                  onChange={(e) => handleQuarterChange(index, 'expenditure', e.target.value)}
                                  placeholder="Enter expenditure"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                              </motion.div>
                            </td>
                            <td className="p-5">
                              <motion.div whileHover={{ scale: 1.02 }}>
                                <input
                                  type="number"
                                  className="w-full p-4 text-xl bg-gray-100 border border-gray-300 rounded-lg"
                                  value={quarter.gross_profit}
                                  onChange={(e) => handleQuarterChange(index, 'gross_profit', e.target.value)}
                                  placeholder="Calculated automatically"
                                  readOnly
                                />
                              </motion.div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <svg className="h-6 w-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xl">{error}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="submit"
                    className={`w-full p-6 text-2xl font-bold rounded-xl bg-gradient-to-r ${themes[theme].button} text-white shadow-lg transition-all duration-300 relative overflow-hidden`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Forecast...
                      </span>
                    ) : (
                      <>
                        <motion.span 
                          className="absolute inset-0 bg-white"
                          initial={{ x: "-100%", opacity: 0.1 }}
                          animate={{ x: "100%", opacity: 0.1 }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                        <span className="flex items-center justify-center relative z-10">
                          <HiOutlineLightningBolt className="mr-2 text-3xl" />
                          Generate Forecast
                          <FaArrowRight className="ml-2" />
                        </span>
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 gap-10"
              ref={confettiRef}
            >
              <motion.div variants={itemVariants} className={`${themes[theme].secondary} rounded-2xl shadow-xl overflow-hidden`}>
                <div className={`bg-gradient-to-r ${themes[theme].header} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                        className="text-3xl mr-4 text-blue-400"
                      >
                        <FaChartLine />
                      </motion.div>
                      <h2 className="text-3xl font-bold">Next Quarter Forecast</h2>
                    </div>
                    <div className="flex space-x-3">
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center transition-all duration-300"
                      >
                        <FaDownload className="mr-2" />
                        Export
                      </motion.button>
                      <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setForecast(null)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center transition-all duration-300"
                      >
                        <FaRedo className="mr-2" />
                        New Forecast
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('table')} 
                      className={`px-6 py-3 rounded-lg transition text-xl flex items-center ${activeTab === 'table' ? themes[theme].accent : 'hover:bg-gray-100'}`}
                    >
                      <FaChartBar className="mr-2" />
                      Summary
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('charts')} 
                      className={`px-6 py-3 rounded-lg transition text-xl flex items-center ${activeTab === 'charts' ? themes[theme].accent : 'hover:bg-gray-100'}`}
                    >
                      <FaChartPie className="mr-2" />
                      Charts
                    </motion.button>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {activeTab === 'table' && (
                    <motion.div
                      key="table-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                          className="p-10 border-r border-gray-200"
                        >
                          <motion.div 
                            className="flex flex-col items-center"
                            variants={glowAnimation}
                            initial="initial"
                            animate="animate"
                          >
                            <h3 className="text-blue-600 font-medium mb-3 text-2xl flex items-center">
                              <HiCurrencyDollar className="mr-1" />
                              Revenue
                            </h3>
                            <p className={`text-5xl font-bold ${themes[theme].text} mb-3`}>₹{forecast.next_quarter_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.revenue) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.revenue) >= 0 ? (
                                <HiTrendingUp className="mr-1" />
                              ) : (
                                <HiTrendingDown className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.revenue))}% {parseFloat(trends.revenue) >= 0 ? 'increase' : 'decrease'}</span>
                            </div>
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="p-10 border-r border-gray-200"
                        >
                          <motion.div 
                            className="flex flex-col items-center"
                            variants={glowAnimation}
                            initial="initial"
                            animate="animate"
                          >
                            <h3 className="text-red-500 font-medium mb-3 text-2xl flex items-center">
                              <HiOutlineCash className="mr-1" />
                              Expenditure
                            </h3>
                            <p className={`text-5xl font-bold ${themes[theme].text} mb-3`}>₹{forecast.next_quarter_expenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.expenditure) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.expenditure) <= 0 ? (
                                <HiTrendingDown className="mr-1" />
                              ) : (
                                <HiTrendingUp className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.expenditure))}% {parseFloat(trends.expenditure) <= 0 ? 'decrease' : 'increase'}</span>
                            </div>
                          </motion.div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="p-10"
                        >
                          <motion.div 
                            className="flex flex-col items-center"
                            variants={glowAnimation}
                            initial="initial"
                            animate="animate"
                          >
                            <h3 className="text-green-500 font-medium mb-3 text-2xl flex items-center">
                              <FaMoneyBillWave className="mr-1" />
                              Income
                            </h3>
                            <p className={`text-5xl font-bold ${themes[theme].text} mb-3`}>₹{forecast.next_quarter_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.profit) >= 0 ? (
                                <HiTrendingUp className="mr-1" />
                              ) : (
                                <HiTrendingDown className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.profit))}% {parseFloat(trends.profit) >= 0 ? 'increase' : 'decrease'}</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>
                      
                      {forecast.trend_detected && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                          className="p-6 bg-blue-50 m-6 rounded-xl border border-blue-100 relative overflow-hidden"
                        >
                          <motion.div
                            className="absolute inset-0 bg-blue-400"
                            initial={{ x: "-100%", opacity: 0.05 }}
                            animate={{ x: "100%", opacity: 0.05 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                          />
                          <div className="flex items-start relative z-10">
                            <motion.div
                              animate={{ 
                                rotate: [0, 10, -10, 10, 0],
                                scale: [1, 1.2, 1]
                              }}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                              className="text-blue-500 text-2xl mr-4 mt-1"
                            >
                              <FaLightbulb />
                            </motion.div>
                            <div>
                              <h3 className="text-xl font-semibold text-blue-800 mb-2">Pattern Detected</h3>
                              <p className="text-blue-700">
                                Our AI model has detected a consistent pattern in your quarterly data. The average difference between quarters is approximately ₹{forecast.average_difference?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '200,000'}.
                              </p>
                              <p className="text-blue-700 mt-2">
                                Based on this pattern, we've predicted your next quarter with {forecast.model_confidence?.toFixed(1) || '95.0'}% confidence.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="p-6">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="overflow-hidden rounded-xl border border-gray-300 shadow-sm"
                        >
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-r border-gray-300">Quarter</th>
                                <th className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-r border-gray-300">Revenue</th>
                                <th className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-r border-gray-300">Expenditure</th>
                                <th className="bg-gradient-to-r from-gray-100 to-gray-50 p-4 text-left font-semibold text-gray-700 border-b border-gray-300">Income</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quarters.map((quarter, index) => (
                                <motion.tr 
                                  key={index} 
                                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                  whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}
                                >
                                  <td className="p-4 font-medium text-gray-700 border-r border-gray-300">Q{index + 1}</td>
                                  <td className="p-4 border-r border-gray-300">₹{parseFloat(quarter.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  <td className="p-4 border-r border-gray-300">₹{parseFloat(quarter.expenditure).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  <td className="p-4">₹{parseFloat(quarter.gross_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </motion.tr>
                              ))}
                              <motion.tr 
                                className="bg-blue-50 font-medium"
                                initial={{ backgroundColor: "rgba(219, 234, 254, 0.5)" }}
                                animate={{ backgroundColor: ["rgba(219, 234, 254, 0.5)", "rgba(191, 219, 254, 0.8)", "rgba(219, 234, 254, 0.5)"] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <td className="p-4 text-blue-700 border-r border-gray-300">Next Quarter</td>
                                <td className="p-4 text-blue-700 border-r border-gray-300">₹{forecast.next_quarter_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-4 text-blue-700 border-r border-gray-300">₹{forecast.next_quarter_expenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-4 text-blue-700">₹{forecast.next_quarter_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </motion.tr>
                            </tbody>
                          </table>
                        </motion.div>
                      </div>
                      
                      {/* Feedback section */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="p-6 border-t border-gray-200"
                      >
                        <div className="flex flex-col items-center">
                          <h3 className={`text-xl font-semibold ${themes[theme].text} mb-3`}>How accurate was this forecast?</h3>
                          
                          {!feedbackGiven ? (
                            <div className="flex space-x-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleFeedback(true)}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center"
                              >
                                <FaRegThumbsUp className="mr-2" />
                                Accurate
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleFeedback(false)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg flex items-center"
                              >
                                <FaRegThumbsDown className="mr-2" />
                                Not Accurate
                              </motion.button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <p className="text-green-600 mb-3">Thank you for your feedback!</p>
                              <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRating(star)}
                                    className="text-2xl text-yellow-400"
                                  >
                                    {star <= rating ? <FaStar /> : <FaRegStar />}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'charts' && (
                    <motion.div
                      key="charts-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-6"
                    >
                      <div className="flex justify-center mb-6 space-x-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveChart('line')}
                          className={`px-4 py-2 rounded-lg flex items-center ${activeChart === 'line' ? themes[theme].accent : 'bg-gray-100'}`}
                        >
                          <FaChartLine className="mr-2" />
                          Trend
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveChart('bar')}
                          className={`px-4 py-2 rounded-lg flex items-center ${activeChart === 'bar' ? themes[theme].accent : 'bg-gray-100'}`}
                        >
                          <FaChartBar className="mr-2" />
                          Comparison
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveChart('doughnut')}
                          className={`px-4 py-2 rounded-lg flex items-center ${activeChart === 'doughnut' ? themes[theme].accent : 'bg-gray-100'}`}
                        >
                          <FaChartPie className="mr-2" />
                          Breakdown
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveChart('polar')}
                          className={`px-4 py-2 rounded-lg flex items-center ${activeChart === 'polar' ? themes[theme].accent : 'bg-gray-100'}`}
                        >
                          <FaRocket className="mr-2" />
                          Metrics
                        </motion.button>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence mode="wait">
                          {activeChart === 'line' && (
                            <motion.div 
                              key="line-chart"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className={`${themes[theme].secondary} p-6 rounded-xl border border-gray-200 shadow-sm col-span-2`}
                            >
                              <h3 className={`text-xl font-bold mb-4 ${themes[theme].text}`}>Quarterly Trends</h3>
                              <div className="h-80">
                                <Line 
                                  data={chartData.lineChartData} 
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                        labels: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        }
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                              label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                              label += new Intl.NumberFormat('en-IN', { 
                                                style: 'currency', 
                                                currency: 'INR',
                                                maximumFractionDigits: 0
                                              }).format(context.parsed.y);
                                            }
                                            return label;
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      y: {
                                        beginAtZero: true,
                                        ticks: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
                                          callback: function(value) {
                                            return '₹' + value.toLocaleString();
                                          }
                                        },
                                        grid: {
                                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                        }
                                      },
                                      x: {
                                        ticks: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        },
                                        grid: {
                                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </motion.div>
                          )}
                          
                          {activeChart === 'bar' && (
                            <motion.div 
                              key="bar-chart"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className={`${themes[theme].secondary} p-6 rounded-xl border border-gray-200 shadow-sm col-span-2`}
                            >
                              <h3 className={`text-xl font-bold mb-4 ${themes[theme].text}`}>Current vs Next Quarter</h3>
                              <div className="h-80">
                                <Bar 
                                  data={chartData.barChartData}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                        labels: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        }
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                              label += ': ';
                                            }
                                            if (context.parsed.y !== null) {
                                              label += new Intl.NumberFormat('en-IN', { 
                                                style: 'currency', 
                                                currency: 'INR',
                                                maximumFractionDigits: 0
                                              }).format(context.parsed.y);
                                            }
                                            return label;
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      y: {
                                        beginAtZero: true,
                                        ticks: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
                                          callback: function(value) {
                                            return '₹' + value.toLocaleString();
                                          }
                                        },
                                        grid: {
                                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                        }
                                      },
                                      x: {
                                        ticks: {
                                          color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                        },
                                        grid: {
                                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                        }
                                      }
                                    }
                                  }}
                                />
                              </div>
                            </motion.div>
                          )}
                          
                          {activeChart === 'doughnut' && (
                            <motion.div 
                              key="doughnut-chart"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className={`${themes[theme].secondary} p-6 rounded-xl border border-gray-200 shadow-sm col-span-2`}
                            >
                              <h3 className={`text-xl font-bold mb-4 ${themes[theme].text}`}>Next Quarter Breakdown</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1 flex items-center justify-center">
                                  <div className="h-64 w-64">
                                    <Doughnut 
                                      data={chartData.doughnutChartData}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                          legend: {
                                            position: 'bottom',
                                            labels: {
                                              color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                            }
                                          },
                                          tooltip: {
                                            callbacks: {
                                              label: function(context) {
                                                let label = context.label || '';
                                                if (label) {
                                                  label += ': ';
                                                }
                                                if (context.parsed !== null) {
                                                  label += new Intl.NumberFormat('en-IN', { 
                                                    style: 'currency', 
                                                    currency: 'INR',
                                                    maximumFractionDigits: 0
                                                  }).format(context.parsed);
                                                }
                                                return label;
                                              }
                                            }
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl h-full">
                                    <h4 className={`text-lg font-semibold mb-4 ${themes[theme].text}`}>Financial Analysis</h4>
                                    <ul className="space-y-4">
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                                          <HiTrendingUp className="text-blue-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Revenue Forecast</p>
                                          <p className="text-gray-600 dark:text-gray-300">Expected to {parseFloat(trends.revenue) >= 0 ? 'increase' : 'decrease'} by {Math.abs(parseFloat(trends.revenue))}% compared to Q4.</p>
                                        </div>
                                      </motion.li>
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-red-100 p-2 rounded-full mr-3">
                                          <HiOutlineCash className="text-red-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Expenditure Projection</p>
                                          <p className="text-gray-600 dark:text-gray-300">Expected to {parseFloat(trends.expenditure) >= 0 ? 'increase' : 'decrease'} by {Math.abs(parseFloat(trends.expenditure))}% compared to Q4.</p>
                                        </div>
                                      </motion.li>
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-green-100 p-2 rounded-full mr-3">
                                          <FaMoneyBillWave className="text-green-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Income Outlook</p>
                                          <p className="text-gray-600 dark:text-gray-300">Expected to {parseFloat(trends.profit) >= 0 ? 'increase' : 'decrease'} by {Math.abs(parseFloat(trends.profit))}% compared to Q4.</p>
                                        </div>
                                      </motion.li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {activeChart === 'polar' && (
                            <motion.div 
                              key="polar-chart"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.3 }}
                              className={`${themes[theme].secondary} p-6 rounded-xl border border-gray-200 shadow-sm col-span-2`}
                            >
                              <h3 className={`text-xl font-bold mb-4 ${themes[theme].text}`}>Financial Metrics</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-1 flex items-center justify-center">
                                  <div className="h-64 w-64">
                                    <PolarArea 
                                      data={chartData.polarAreaData}
                                      options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                          legend: {
                                            position: 'bottom',
                                            labels: {
                                              color: theme === 'dark' ? '#e5e7eb' : '#1f2937'
                                            }
                                          },
                                          tooltip: {
                                            callbacks: {
                                              label: function(context) {
                                                let label = context.label || '';
                                                if (label) {
                                                  label += ': ';
                                                }
                                                if (context.raw !== null) {
                                                  label += context.raw.toFixed(1) + '%';
                                                }
                                                return label;
                                              }
                                            }
                                          }
                                        },
                                        scales: {
                                          r: {
                                            ticks: {
                                              color: theme === 'dark' ? '#e5e7eb' : '#1f2937',
                                              backdropColor: 'transparent'
                                            },
                                            grid: {
                                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                            },
                                            angleLines: {
                                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                                            }
                                          }
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl h-full">
                                    <h4 className={`text-lg font-semibold mb-4 ${themes[theme].text}`}>Performance Insights</h4>
                                    <ul className="space-y-4">
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                                          <FaInfoCircle className="text-blue-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Revenue Growth</p>
                                          <p className="text-gray-600 dark:text-gray-300">
                                            {parseFloat(trends.revenue) >= 0 
                                              ? `Strong growth trajectory with ${Math.abs(parseFloat(trends.revenue))}% increase expected.` 
                                              : `Declining trend with ${Math.abs(parseFloat(trends.revenue))}% decrease expected.`}
                                          </p>
                                        </div>
                                      </motion.li>
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-purple-100 p-2 rounded-full mr-3">
                                          <FaInfoCircle className="text-purple-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Profit Margin</p>
                                          <p className="text-gray-600 dark:text-gray-300">
                                            {(forecast.next_quarter_gross_profit / forecast.next_quarter_revenue * 100).toFixed(1)}% profit margin expected in the next quarter.
                                          </p>
                                        </div>
                                      </motion.li>
                                      <motion.li 
                                        className="flex items-start"
                                        whileHover={{ x: 5 }}
                                      >
                                        <div className="bg-yellow-100 p-2 rounded-full mr-3">
                                          <FaInfoCircle className="text-yellow-600" />
                                        </div>
                                        <div>
                                          <p className={`font-medium ${themes[theme].text}`}>Expenditure Efficiency</p>
                                          <p className="text-gray-600 dark:text-gray-300">
                                            Expenditure represents {(forecast.next_quarter_expenditure / forecast.next_quarter_revenue * 100).toFixed(1)}% of revenue in the forecast.
                                          </p>
                                        </div>
                                      </motion.li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-10 text-center text-gray-500"
        >
          <p>© 2025 Paisawise | AI-Powered Financial Forecasting</p>
        </motion.div>
      </div>
    </div>
  );
}
