import { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

const SessionTimer = () => {
  const { enqueueSnackbar } = useSnackbar();
  // Вычисляем начальное значение сразу
  const getInitialTimeLeft = () => {
    const sessionStart = localStorage.getItem('sessionStart');
    if (!sessionStart) {
      localStorage.setItem('sessionStart', dayjs().valueOf());
      return 3600;
    }
    const startTime = dayjs(parseInt(sessionStart));
    const endTime = startTime.add(1, 'hour');
    const diff = endTime.diff(dayjs(), 'second');
    return diff > 0 ? diff : 0;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const startTime = dayjs(parseInt(localStorage.getItem('sessionStart')));
      const endTime = startTime.add(1, 'hour');
      const now = dayjs();
      const diff = endTime.diff(now, 'second');
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        localStorage.removeItem('sessionStart');
      }
      else if (diff === 300) {
        enqueueSnackbar('Сессия истекает через 5 минут', { variant: 'warning' });
      }
      else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Typography>
      Сессия: {formatTime(timeLeft)}
    </Typography>
  );
};

export default SessionTimer; 