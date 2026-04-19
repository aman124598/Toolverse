'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';
import { StitchContainer, StitchButton } from '@/components/StitchComponents';

export default function AgeCalculatorPage() {
  const [dob, setDob] = useState('');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{ years: number; months: number; days: number; totalDays: number } | null>(null);

  const calculateAge = () => {
    if (!dob || !targetDate) return;

    const birth = new Date(dob);
    const target = new Date(targetDate);
    
    if (birth > target) {
      alert("Date of birth cannot be after the target date.");
      return;
    }

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }

    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setResult({ years, months, days, totalDays });
  };

  return (
    <ToolLayout 
      title="Age Calculator" 
      description="Calculate your exact age in years, months, and days"
      icon={Icons.calendar}
      gradient="from-rose-500 to-pink-500"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StitchContainer>
            <label className="block text-sm text-gray-400 mb-3">Date of Birth</label>
            <input 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 transition-colors filter-[color-scheme:dark]"
            />
          </StitchContainer>
          
          <StitchContainer>
            <label className="block text-sm text-gray-400 mb-3">Age at the Date of</label>
            <input 
              type="date" 
              value={targetDate} 
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 transition-colors filter-[color-scheme:dark]"
            />
          </StitchContainer>
        </div>

        <div className="flex justify-center">
          <StitchButton onClick={calculateAge} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}>
            Calculate Age
          </StitchButton>
        </div>

        {result && (
          <StitchContainer className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
             <div className="text-center space-y-4">
                <h3 className="text-gray-400 text-sm font-medium">Your exact age is</h3>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                  <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                    <span className="text-4xl font-bold text-white">{result.years}</span>
                    <span className="block text-rose-400 text-sm mt-1">Years</span>
                  </div>
                  <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                    <span className="text-4xl font-bold text-white">{result.months}</span>
                    <span className="block text-rose-400 text-sm mt-1">Months</span>
                  </div>
                  <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                    <span className="text-4xl font-bold text-white">{result.days}</span>
                    <span className="block text-rose-400 text-sm mt-1">Days</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-gray-400">
                  Or <span className="text-white font-medium">{result.totalDays.toLocaleString()}</span> Total Days
                </div>
             </div>
          </StitchContainer>
        )}
      </div>
    </ToolLayout>
  );
}
