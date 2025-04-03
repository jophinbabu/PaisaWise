"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartLine, FaChartBar, FaChartPie, FaMoneyBillWave, FaArrowRight, FaRedo, FaLightbulb } from 'react-icons/fa';
import { HiCurrencyDollar, HiOutlineCash, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

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
  const [modelType, setModelType] = useState('default');
  const [availableModels, setAvailableModels] = useState([]);
  const [modelDetails, setModelDetails] = useState({});
  const [activeTab, setActiveTab] = useState('table');
  const [showTip, setShowTip] = useState(true);

  // Fetch available models when component mounts
  useEffect(() => {
    fetchAvailableModels();
    
    // Hide tip after 5 seconds
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchAvailableModels = async () => {
    try {
      const response = await axios.get(`${API_URL}/models`);
      setAvailableModels(response.data.available_models || ['default']);
      setModelDetails(response.data.model_details || {});
    } catch (err) {
      console.error('Error fetching available models:', err);
    }
  };

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
      
      console.log('Sending request to:', `${API_URL}/forecast?model_type=${modelType}`);
      console.log('Request data:', {
        past_quarters: formattedQuarters
      });
      
      // Add timeout and additional headers
      const response = await axios.post(`${API_URL}/forecast?model_type=${modelType}`, {
        past_quarters: formattedQuarters
      }, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response received:', response.data);
      setForecast(response.data);
      // Switch to charts view after successful forecast
      setActiveTab('charts');
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
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Expenditure',
          data: allQuarters.map(q => q.expenditure),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          tension: 0.3,
        },
        {
          label: 'Income',
          data: allQuarters.map(q => q.gross_profit),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
          backgroundColor: 'rgba(53, 162, 235, 0.6)',
        },
        {
          label: 'Next Quarter (Forecast)',
          data: [
            nextQuarter.revenue,
            nextQuarter.expenditure,
            nextQuarter.gross_profit
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }
      ]
    };
    
    // Doughnut chart for next quarter breakdown
    const doughnutChartData = {
      labels: ['Revenue', 'Expenditure'],
      datasets: [
        {
          data: [nextQuarter.revenue, nextQuarter.expenditure],
          backgroundColor: [
            'rgba(53, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(53, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    return {
      lineChartData,
      barChartData,
      doughnutChartData
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-10 text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-16 -mr-16"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -mb-10 -ml-10"></div>
          
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold mb-3 text-center"
          >
            Paisawise
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl text-center opacity-90"
          >
            Predict your next quarter's financial performance with machine learning
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
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-200">
                <motion.div variants={itemVariants} className="flex items-center mb-6">
                  <FaChartLine className="text-blue-600 text-3xl mr-4" />
                  <h2 className="text-3xl font-bold text-gray-800">Enter Past 4 Quarters Data</h2>
                </motion.div>
                
                {showTip && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg flex items-start"
                  >
                    <FaLightbulb className="text-blue-500 text-xl mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-blue-700 font-medium">Pro Tip</p>
                      <p className="text-blue-600">Enter your financial data for the past 4 quarters to get an accurate forecast. The model uses machine learning to predict your next quarter's performance.</p>
                    </div>
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <motion.div variants={itemVariants} className="overflow-hidden rounded-xl border border-gray-300 mb-8 shadow-sm">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="w-1/6 bg-gradient-to-r from-gray-100 to-gray-50 p-5 text-left text-xl font-semibold text-gray-700 border-b border-r border-gray-300">Quarter</th>
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
                          >
                            <td className="p-5 text-xl font-medium text-gray-700 border-r border-gray-300">Q{index + 1}</td>
                            <td className="p-5 border-r border-gray-300">
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
                            </td>
                            <td className="p-5 border-r border-gray-300">
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
                            </td>
                            <td className="p-5">
                              <input
                                type="number"
                                className="w-full p-4 text-xl bg-gray-100 border border-gray-300 rounded-lg"
                                value={quarter.gross_profit}
                                onChange={(e) => handleQuarterChange(index, 'gross_profit', e.target.value)}
                                placeholder="Calculated automatically"
                                readOnly
                              />
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                  
                  {availableModels.length > 1 && (
                    <motion.div variants={itemVariants} className="mb-8">
                      <h3 className="text-2xl font-bold mb-4 text-gray-800">Select Prediction Model</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {availableModels.map(model => (
                          <motion.div 
                            key={model} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1"
                          >
                            <label className={`block p-6 border rounded-xl cursor-pointer transition-all duration-200 ${modelType === model ? 'bg-blue-50 border-blue-500 shadow-md' : 'border-gray-300 hover:bg-gray-50'}`}>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  name="modelType"
                                  value={model}
                                  checked={modelType === model}
                                  onChange={() => setModelType(model)}
                                  className="h-5 w-5 text-blue-600"
                                />
                                <span className="ml-3 font-medium text-xl">
                                  {model === 'default' ? 'Lasso/Ridge Regression' : 'Random Forest'}
                                </span>
                              </div>
                              {modelDetails[model] && (
                                <div className="mt-3 pl-8 text-gray-600">
                                  <div className="flex justify-between text-lg">
                                    <span>Accuracy:</span>
                                    <span className="font-medium">{modelDetails[model].overall_accuracy}</span>
                                  </div>
                                </div>
                              )}
                            </label>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
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
                    className="w-full p-6 text-2xl font-bold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transition-all duration-300"
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
                      <span className="flex items-center justify-center">
                        Generate Forecast
                        <FaArrowRight className="ml-2" />
                      </span>
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
            >
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
                  <div className="flex items-center">
                    <FaChartLine className="text-3xl mr-4 text-blue-400" />
                    <h2 className="text-3xl font-bold">Next Quarter Forecast</h2>
                  </div>
                </div>
                
                <div className="p-6 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('table')} 
                      className={`px-6 py-3 rounded-lg transition text-xl flex items-center ${activeTab === 'table' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      <FaChartBar className="mr-2" />
                      Summary
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('charts')} 
                      className={`px-6 py-3 rounded-lg transition text-xl flex items-center ${activeTab === 'charts' ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
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
                          <div className="flex flex-col items-center">
                            <h3 className="text-blue-600 font-medium mb-3 text-2xl flex items-center">
                              <HiCurrencyDollar className="mr-1" />
                              Revenue
                            </h3>
                            <p className="text-5xl font-bold text-gray-800 mb-3">₹{forecast.next_quarter_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.revenue) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.revenue) >= 0 ? (
                                <HiTrendingUp className="mr-1" />
                              ) : (
                                <HiTrendingDown className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.revenue))}% {parseFloat(trends.revenue) >= 0 ? 'increase' : 'decrease'}</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                          className="p-10 border-r border-gray-200"
                        >
                          <div className="flex flex-col items-center">
                            <h3 className="text-red-600 font-medium mb-3 text-2xl flex items-center">
                              <HiOutlineCash className="mr-1" />
                              Expenditure
                            </h3>
                            <p className="text-5xl font-bold text-gray-800 mb-3">₹{forecast.next_quarter_expenditure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.expenditure) <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.expenditure) <= 0 ? (
                                <HiTrendingDown className="mr-1" />
                              ) : (
                                <HiTrendingUp className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.expenditure))}% {parseFloat(trends.expenditure) <= 0 ? 'decrease' : 'increase'}</span>
                            </div>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                          className="p-10"
                        >
                          <div className="flex flex-col items-center">
                            <h3 className="text-green-600 font-medium mb-3 text-2xl flex items-center">
                              <FaMoneyBillWave className="mr-1" />
                              Income
                            </h3>
                            <p className="text-5xl font-bold text-gray-800 mb-3">₹{forecast.next_quarter_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <div className={`flex items-center ${parseFloat(trends.profit) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(trends.profit) >= 0 ? (
                                <HiTrendingUp className="mr-1" />
                              ) : (
                                <HiTrendingDown className="mr-1" />
                              )}
                              <span className="font-medium">{Math.abs(parseFloat(trends.profit))}% {parseFloat(trends.profit) >= 0 ? 'increase' : 'decrease'}</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="p-8"
                      >
                      
                
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {activeTab === 'charts' && chartData && (
                    <motion.div
                      key="charts-view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-8"
                    >
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-10"
                      >
                        <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                          <FaChartLine className="mr-2 text-blue-500" />
                          Financial Trends
                        </h3>
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <Line 
                            data={chartData.lineChartData} 
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'top',
                                  labels: {
                                    font: {
                                      size: 14
                                    }
                                  }
                                },
                                title: {
                                  display: true,
                                  text: 'Financial Performance Trend',
                                  font: {
                                    size: 18
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
                                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                                      }
                                      return label;
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  ticks: {
                                    callback: function(value) {
                                      return '₹' + value.toLocaleString();
                                    },
                                    font: {
                                      size: 14
                                    }
                                  }
                                },
                                x: {
                                  ticks: {
                                    font: {
                                      size: 14
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                            <FaChartBar className="mr-2 text-indigo-500" />
                            Quarter Comparison
                          </h3>
                          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            <Bar 
                              data={chartData.barChartData}
                              options={{
                                responsive: true,
                                plugins: {
                                  legend: {
                                    position: 'top',
                                    labels: {
                                      font: {
                                        size: 14
                                      }
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
                                          label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(context.parsed.y);
                                        }
                                        return label;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  y: {
                                    ticks: {
                                      callback: function(value) {
                                        return '₹' + value.toLocaleString();
                                      },
                                      font: {
                                        size: 14
                                      }
                                    }
                                  },
                                  x: {
                                    ticks: {
                                      font: {
                                        size: 14
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                            <FaChartPie className="mr-2 text-purple-500" />
                            Next Quarter Breakdown
                          </h3>
                          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex justify-center">
                            <div style={{ height: '300px', width: '300px' }}>
                              <Doughnut 
                                data={chartData.doughnutChartData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: true,
                                  plugins: {
                                    legend: {
                                      position: 'bottom',
                                      labels: {
                                        font: {
                                          size: 14
                                        }
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
                                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(context.parsed);
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
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200"
                      >
                        <h3 className="font-bold text-blue-800 mb-3 text-xl flex items-center">
                          <FaLightbulb className="mr-2 text-yellow-500" />
                          Forecast Insights
                        </h3>
                        <p className="text-blue-700 text-xl leading-relaxed">
                          {forecast.next_quarter_revenue > quarters[3].revenue 
                            ? `Revenue is projected to increase by ${((forecast.next_quarter_revenue / parseFloat(quarters[3].revenue) - 1) * 100).toFixed(1)}% compared to the current quarter.` 
                            : `Revenue is projected to decrease by ${((1 - forecast.next_quarter_revenue / parseFloat(quarters[3].revenue)) * 100).toFixed(1)}% compared to the current quarter.`
                          }
                          {' '}
                          {forecast.next_quarter_gross_profit > 0 
                            ? `The projected gross profit margin is ${((forecast.next_quarter_gross_profit / forecast.next_quarter_revenue) * 100).toFixed(1)}%.` 
                            : `The forecast indicates a negative gross profit, suggesting a review of cost structures may be beneficial.`
                          }
                        </p>
                       
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Start a New Forecast</h3>
                <p className="text-gray-600 mb-6 text-lg">Want to try different numbers or scenarios? Start a new forecast.</p>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setForecast(null)}
                  className="w-full p-4 text-xl font-bold rounded-xl bg-gradient-to-r from-gray-800 to-gray-700 text-white transition shadow-lg flex items-center justify-center"
                >
                  <FaRedo className="mr-2" />
                  Enter New Data
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
