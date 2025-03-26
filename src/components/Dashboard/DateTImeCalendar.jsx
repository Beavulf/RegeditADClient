import { useState, useEffect } from 'react';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
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
        <StaticDateTimePicker
            readOnly
            value={currentTime}
            slotProps={{
                actionBar: {
                    actions: [],
                },
                tabs: {
                    hidden: true,
                },
            }}
        />
    );
}
