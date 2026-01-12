'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  
  const calculate = () => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    
    if (target < birth) return null;
    
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      days += new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    
    // Next birthday
    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    
    // Day of week born
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const birthDay = daysOfWeek[birth.getDay()];
    
    // Zodiac
    const zodiacSigns = [
      { sign: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
      { sign: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
      { sign: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
      { sign: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
      { sign: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
      { sign: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
      { sign: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
      { sign: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
      { sign: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
      { sign: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
      { sign: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
      { sign: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
    ];
    
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    const zodiac = zodiacSigns.find(z => {
      if (z.start[0] === 12 && z.end[0] === 1) {
        return (month === 12 && day >= z.start[1]) || (month === 1 && day <= z.end[1]);
      }
      return (month === z.start[0] && day >= z.start[1]) || (month === z.end[0] && day <= z.end[1]);
    }) || zodiacSigns[0];

    // Chinese zodiac
    const chineseZodiac = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
    const chineseYear = chineseZodiac[birth.getFullYear() % 12];
    
    return { 
      years, months, days, totalDays, totalWeeks, totalMonths, totalHours, totalMinutes,
      daysUntilBirthday, zodiac, birthDay, chineseYear,
      nextBirthdayDate: nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  };
  
  const result = calculate();

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate exact age with detailed life statistics"
      icon={Icons.calendar}
      gradient="from-violet-500 to-purple-600"
    >
      {/* Date Inputs */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={targetDate}
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Calculate Age At</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            min={birthDate}
            className="w-full px-4 py-3 bg-black/20 border border-white/5 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Main Age Display */}
          <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-2xl p-8 text-center border border-purple-500/20">
            <div className="text-sm text-gray-400 mb-3">Your Age</div>
            <div className="flex items-center justify-center gap-4 text-4xl md:text-5xl font-bold">
              <div className="text-center">
                <span className="text-violet-400">{result.years}</span>
                <div className="text-xs text-gray-500 font-normal mt-1">Years</div>
              </div>
              <span className="text-gray-600">:</span>
              <div className="text-center">
                <span className="text-purple-400">{result.months}</span>
                <div className="text-xs text-gray-500 font-normal mt-1">Months</div>
              </div>
              <span className="text-gray-600">:</span>
              <div className="text-center">
                <span className="text-pink-400">{result.days}</span>
                <div className="text-xs text-gray-500 font-normal mt-1">Days</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Days', value: result.totalDays.toLocaleString() },
              { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
              { label: 'Total Months', value: result.totalMonths.toLocaleString() },
              { label: 'Total Hours', value: result.totalHours.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} className="bg-black/20 rounded-xl p-4 text-center border border-white/5">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Detailed Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-xl">
                  🎂
                </div>
                <div>
                  <div className="text-sm text-gray-400">Next Birthday</div>
                  <div className="font-semibold text-white">{result.daysUntilBirthday} days</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{result.nextBirthdayDate}</div>
            </div>

            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xl">
                  {result.zodiac.emoji}
                </div>
                <div>
                  <div className="text-sm text-gray-400">Zodiac Sign</div>
                  <div className="font-semibold text-white">{result.zodiac.sign}</div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-5 border border-white/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center text-xl">
                  🐲
                </div>
                <div>
                  <div className="text-sm text-gray-400">Chinese Zodiac</div>
                  <div className="font-semibold text-white">{result.chineseYear}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Birth Day */}
          <div className="bg-black/20 rounded-xl p-5 border border-white/5 text-center">
            <div className="text-sm text-gray-400 mb-1">You were born on a</div>
            <div className="text-2xl font-bold text-white">{result.birthDay}</div>
          </div>

          {/* Life Journey */}
          <div className="bg-black/20 rounded-xl p-5 border border-white/5">
            <div className="text-sm text-gray-400 mb-3">Life Journey</div>
            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                style={{ width: `${Math.min(100, (result.years / 80) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Birth</span>
              <span>Current ({result.years}/{80})</span>
              <span>80 years</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p>Enter your birth date to calculate your age</p>
        </div>
      )}
    </ToolLayout>
  );
}
