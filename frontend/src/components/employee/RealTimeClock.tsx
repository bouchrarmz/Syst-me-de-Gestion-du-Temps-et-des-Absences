
import { useState, useEffect } from 'react';

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl font-bold text-[#33C3F0] dark:text-[#6E59A5] mb-2">
        {hours}:{minutes}:{seconds}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {time.toLocaleDateString(localStorage.getItem('language') || 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

export default RealTimeClock;
