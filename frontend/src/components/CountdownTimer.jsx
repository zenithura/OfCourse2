import React, { useState, useEffect, useMemo } from 'react';

const CountdownTimer = () => {
  const TARGET_DATE = useMemo(() => new Date('2025-01-28T23:59:59'), []);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    mins: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = TARGET_DATE.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({ days, hours, mins });
      } else {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [TARGET_DATE]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-16">
      <div className="relative w-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl shadow-2xl">
        {/* Arkaplan efektleri */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-400/10 blur-3xl"></div>
          <div className="absolute -inset-2 bg-gray-100/20 backdrop-blur-3xl -z-10"></div>
        </div>
        
        {/* Ana içerik */}
        <div className="relative py-8 sm:py-12 px-4">
          {/* Sayaç */}
          <div className="flex justify-center items-center gap-6 sm:gap-12 mb-8">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{timeLeft.days}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 mt-2">Gün</div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-300">|</div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{timeLeft.hours}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 mt-2">Saat</div>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-300">|</div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{timeLeft.mins}</div>
              <div className="text-xs sm:text-sm font-medium text-gray-600 mt-2">Dakika</div>
            </div>
          </div>

          {/* İndirim Kronometresi Başlığı */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">İndirim Kronometresi</h2>
            <div className="w-24 sm:w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          {/* Katılımcılar */}
          <div className="flex justify-center items-center mt-6 sm:mt-8">
            <div className="flex -space-x-2">
              <img className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-lg" src="https://i.pravatar.cc/100?img=1" alt="User" />
              <img className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-lg" src="https://i.pravatar.cc/100?img=2" alt="User" />
              <img className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-lg" src="https://i.pravatar.cc/100?img=3" alt="User" />
            </div>
            <span className="ml-3 text-sm sm:text-base text-gray-600 font-medium">2k+ Kişi Katıldı</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer; 