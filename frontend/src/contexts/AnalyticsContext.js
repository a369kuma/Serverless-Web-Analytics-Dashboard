import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const AnalyticsContext = createContext();

const initialState = {
  sites: [],
  currentSite: null,
  analytics: null,
  loading: false,
  error: null,
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'
};

function analyticsReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SITES':
      return { ...state, sites: action.payload, loading: false, error: null };
    case 'SET_CURRENT_SITE':
      return { ...state, currentSite: action.payload };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload, loading: false, error: null };
    case 'ADD_SITE':
      return { ...state, sites: [...state.sites, action.payload] };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AnalyticsProvider({ children }) {
  const [state, dispatch] = useReducer(analyticsReducer, initialState);

  const fetchSites = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const sites = await analyticsAPI.getSites();
      dispatch({ type: 'SET_SITES', payload: sites });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const fetchAnalytics = async (siteId, options = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const analytics = await analyticsAPI.getAnalytics(siteId, options);
      dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const addSite = async (siteData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newSite = await analyticsAPI.registerSite(siteData);
      dispatch({ type: 'ADD_SITE', payload: newSite });
      return newSite;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setCurrentSite = (site) => {
    dispatch({ type: 'SET_CURRENT_SITE', payload: site });
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const value = {
    ...state,
    fetchSites,
    fetchAnalytics,
    addSite,
    clearError,
    setCurrentSite
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
