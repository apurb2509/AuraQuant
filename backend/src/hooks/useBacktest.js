import { useState } from 'react';

export const useBacktest = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Backtest Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { history, fetchHistory, isLoading };
};