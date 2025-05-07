import { useState, useEffect } from 'react';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs from 'dayjs';

export function CurrentTimeDisplay() {
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000); // Обновление каждую секунду

        return () => clearInterval(intervalId); // Очистка интервала при размонтировании
    }, []);

    return (
        <StaticTimePicker
            readOnly
            value={currentTime}
            slotProps={{
                actionBar: {
                    actions: [],
                },
            }}
            sx={{
                '& .MuiClock-root': { display: 'none' }, // скрывает циферблат
                border:'1px solid gray',
                mt:2,
                borderRadius:'20px'
            }}
            views={['hours', 'minutes', 'seconds',]}
        />
    );
}
