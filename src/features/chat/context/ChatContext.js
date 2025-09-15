import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApiClient } from '../hooks/useApiClient';

// Fallback UUID generator for test environments
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for test environment
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

/**
 * Context for managing chat state across multiple trigger points
 * (corner launcher and prominent button)
 */
const ChatContext = createContext();

/**
 * Custom hook to use chat context
 * @returns {Object} Chat state and controls
 */
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

/**
 * Provider component for chat state management
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 */
export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // API client integration
  const { 
    isLoading, 
    error, 
    isConnected, 
    sendMessage: apiSendMessage, 
    clearError, 
    reset: resetApi,
    getStatus
  } = useApiClient();

  /**
   * Toggle chat panel open/closed state
   */
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  /**
   * Open chat panel
   */
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  /**
   * Close chat panel
   */
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  /**
   * Add a message to the conversation
   * @param {Object} message - Message object
   * @param {string} message.role - 'user' or 'assistant'
   * @param {string} message.content - Message content
   * @param {Array} message.sources - Optional sources for assistant messages
   * @param {number} message.confidence - Optional confidence score
   */
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  /**
   * Check if message is a greeting and return automatic response
   * @param {string} message - User message to check
   * @returns {string|null} - Automatic response or null if not a greeting
   */
  const getGreetingResponse = useCallback((message) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // Common greetings patterns
    const greetingPatterns = [
      /^hi$/,
      /^hello$/,
      /^hey$/,
      /^good morning$/,
      /^good afternoon$/,
      /^good evening$/,
      /^hi there$/,
      /^hello there$/,
      /^hey there$/,
      /^hi how are you$/,
      /^hello how are you$/,
      /^hey how are you$/,
      /^how are you$/,
      /^how are you doing$/,
      /^how's it going$/,
      /^what's up$/,
      /^whats up$/,
      /^howdy$/,
      /^greetings$/
    ];

    const isGreeting = greetingPatterns.some(pattern => pattern.test(lowerMessage));
    
    if (isGreeting) {
      return "Hello! I'm Giuseppe's AI assistant. I'm here to help you learn about his background, skills, and experience in AI and engineering. Feel free to ask me anything about his education, projects, or technical expertise. You can also click on the suggested questions below to get started!";
    }
    
    return null;
  }, []);

  /**
   * Send a message through the API
   * @param {string} message - User message to send
   */
  const sendMessage = useCallback(async (message) => {
    if (!message || message.trim().length === 0) {
      return;
    }

    // Clear any existing errors
    clearError();

    // Add user message to conversation
    addMessage({
      role: 'user',
      content: message.trim()
    });

    // Check for automatic greeting response
    const greetingResponse = getGreetingResponse(message.trim());
    if (greetingResponse) {
      // Add automatic greeting response
      addMessage({
        role: 'assistant',
        content: greetingResponse,
        isAutomatic: true
      });
      return;
    }

    try {
      // Prepare conversation history for API
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Send to API
      const response = await apiSendMessage(message, history);
      
      if (response) {
        // Add assistant response to conversation
        addMessage({
          role: 'assistant',
          content: response.text,
          sources: response.sources || [],
          confidence: response.confidence || 0,
          usage: response.usage
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      
      // Add error message to conversation for user feedback
      addMessage({
        role: 'assistant',
        content: error?.message || "I'm sorry, I couldn't process that message. Please try again.",
        isError: true
      });
    }
  }, [messages, addMessage, apiSendMessage, clearError, error, getGreetingResponse]);

  /**
   * Update current message input
   * @param {string} message - Current input value
   */
  const updateCurrentMessage = useCallback((message) => {
    setCurrentMessage(message);
  }, []);

  /**
   * Clear the conversation history
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    clearError();
  }, [clearError]);

  /**
   * Reset entire chat state
   */
  const resetChat = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setIsChatOpen(false);
    resetApi();
  }, [resetApi]);

  /**
   * Get suggested conversation starters with pre-answered responses
   * @returns {Array} Array of suggestion objects
   */
  // All available questions pool
  const allQuestions = [
    // Initial questions set
    {
      question: "What is Giuseppe's educational background?",
      answer: "Giuseppe's educational background includes:\n\n• Master's degree in Mechanical Engineering from INSA Lyon (2015-2017)\n• Currently pursuing Data Science and MLOps studies at Université Paris 1 Panthéon-Sorbonne (2024-ongoing)\n• Strong engineering foundation combined with advanced data science expertise\n• Specialized focus on machine learning operations and data science applications"
    },
    {
      question: "What programming languages and technologies does Giuseppe specialize in?",
      answer: "Giuseppe specializes in a comprehensive tech stack:\n\n• Programming Languages: Python (primary), SQL\n• ML/AI Frameworks: TensorFlow, PyTorch, Keras, scikit-learn\n• Computer Vision: CNNs, RNNs, YOLOv8 for object detection\n• MLOps & DevOps: Docker, Git/Github, Linux, Airflow pipelines\n• Engineering Tools: ANSYS Workbench, CATIA V5/V6, SolidWorks\n• Specialized Skills: FEM analysis, CAD modeling, time series forecasting"
    },
    {
      question: "What are his most notable AI projects?",
      answer: "Giuseppe has developed several impressive AI projects:\n\n• AI Vehicle Damage Detection System: YOLOv8-based system identifying 8 damage types with Flask + React/TypeScript interface\n• Anomaly Detection App: Manufacturing quality control using MVTec dataset\n• Book Recommender System: Collaborative filtering with FastAPI and Airflow pipelines\n• Agentic RAG System: Intelligent query routing orchestrated by n8n\n• Cryptocurrency Forecasting Dashboard: Time series prediction using Prophet & scikit-learn ensembles\n• Computer Vision Applications: Advanced image processing and object detection solutions"
    },
    // Follow-up questions set 1
    {
      question: "What is Giuseppe's professional experience in engineering?",
      answer: "Giuseppe's engineering experience spans multiple domains:\n\n• Mechanical Engineering background with expertise in CAD design\n• Proficient in advanced simulation tools (ANSYS, FEM analysis)\n• Experience with industrial design software (CATIA V5/V6, SolidWorks)\n• Strong foundation in engineering principles and problem-solving\n• Transition from traditional engineering to AI/ML applications\n• Applied engineering mindset to data science and machine learning projects"
    },
    {
      question: "How does Giuseppe approach machine learning projects?",
      answer: "Giuseppe follows a systematic approach to ML projects:\n\n• Data-driven methodology with thorough analysis and preprocessing\n• Implementation of end-to-end ML pipelines using modern frameworks\n• Focus on practical applications and real-world problem solving\n• Integration of MLOps practices for production deployment\n• Emphasis on model interpretability and performance optimization\n• Continuous learning and adaptation of new technologies and techniques"
    },
    {
      question: "What makes Giuseppe's technical profile unique?",
      answer: "Giuseppe's unique combination of skills includes:\n\n• Dual expertise in traditional engineering and modern AI/ML\n• Bridge between mechanical engineering principles and data science\n• Hands-on experience with both theoretical concepts and practical implementation\n• Cross-disciplinary approach combining engineering rigor with AI innovation\n• Strong problem-solving skills from engineering applied to ML challenges\n• Continuous evolution from classical engineering to cutting-edge AI technologies"
    },
    // Follow-up questions set 2
    {
      question: "What computer vision capabilities does Giuseppe have?",
      answer: "Giuseppe has extensive computer vision expertise:\n\n• Object Detection: YOLOv8 implementation for damage detection systems\n• Deep Learning: CNNs and RNNs using TensorFlow and PyTorch\n• Image Processing: Advanced algorithms for visual data analysis\n• Real-time Applications: Video processing and live detection systems\n• Quality Control: Anomaly detection for manufacturing processes\n• Framework Proficiency: Keras, OpenCV, and modern CV libraries"
    },
    {
      question: "How does Giuseppe integrate MLOps in his projects?",
      answer: "Giuseppe implements comprehensive MLOps practices:\n\n• Containerization: Docker for consistent deployment environments\n• Pipeline Automation: Airflow for workflow orchestration\n• Version Control: Git/Github for code and model versioning\n• Linux Environments: Command-line proficiency for server management\n• CI/CD Integration: Automated testing and deployment processes\n• Monitoring: Performance tracking and model drift detection"
    },
    {
      question: "What types of data science problems does Giuseppe solve?",
      answer: "Giuseppe tackles diverse data science challenges:\n\n• Time Series Forecasting: Cryptocurrency prediction using Prophet\n• Recommendation Systems: Collaborative filtering algorithms\n• Anomaly Detection: Quality control in manufacturing\n• Natural Language Processing: RAG systems and intelligent routing\n• Predictive Analytics: Ensemble methods with scikit-learn\n• Computer Vision: Object detection and image classification tasks"
    }
  ];

  const getSuggestions = useCallback(() => {
    const messageCount = messages.length;
    
    // Create a rotation that cycles through different sets of 3 questions
    // Each interaction shows a different set, cycling back to the beginning when needed
    const setIndex = Math.floor((messageCount / 2) % 3); // Changes every 2 messages, cycles through 3 sets
    const startIndex = setIndex * 3;
    
    return allQuestions.slice(startIndex, startIndex + 3);
  }, [messages, allQuestions]);

  const value = {
    // UI State
    isChatOpen,
    toggleChat,
    openChat,
    closeChat,
    
    // Message State
    messages,
    currentMessage,
    updateCurrentMessage,
    
    // API State
    isLoading,
    error,
    isConnected,
    
    // Actions
    sendMessage,
    addMessage,
    clearMessages,
    resetChat,
    clearError,
    getSuggestions,
    getStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;