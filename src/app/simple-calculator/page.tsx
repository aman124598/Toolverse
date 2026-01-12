'use client';

import { useState } from 'react';
import ToolLayout, { Icons } from '@/components/ToolLayout';

export default function SimpleCalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let result = 0;

      switch (operation) {
        case '+': result = currentValue + inputValue; break;
        case '−': result = currentValue - inputValue; break;
        case '×': result = currentValue * inputValue; break;
        case '÷': result = inputValue !== 0 ? currentValue / inputValue : 0; break;
        default: result = inputValue;
      }

      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = () => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+': result = previousValue + inputValue; break;
      case '−': result = previousValue - inputValue; break;
      case '×': result = previousValue * inputValue; break;
      case '÷': result = inputValue !== 0 ? previousValue / inputValue : 0; break;
    }

    const historyEntry = `${previousValue} ${operation} ${inputValue} = ${result}`;
    setHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    
    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const percentage = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const Button = ({ label, onClick, className = '', wide = false }: { label: string; onClick: () => void; className?: string; wide?: boolean }) => (
    <button
      onClick={onClick}
      className={`h-16 rounded-2xl text-xl font-medium transition-all hover:scale-105 active:scale-95 ${wide ? 'col-span-2' : ''} ${className}`}
    >
      {label}
    </button>
  );

  return (
    <ToolLayout
      title="Calculator"
      description="Professional calculator for everyday math"
      icon={Icons.calculator}
      gradient="from-gray-600 to-gray-800"
    >
      <div className="max-w-sm mx-auto">
        {/* Display */}
        <div className="bg-black/30 rounded-2xl p-6 mb-4 border border-white/5">
          <div className="text-sm text-gray-500 h-6 text-right font-mono">
            {previousValue !== null && `${previousValue} ${operation || ''}`}
          </div>
          <div className="text-5xl font-light text-right text-white truncate font-mono tracking-wider">
            {parseFloat(display).toLocaleString('en-US', { maximumFractionDigits: 10 })}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3">
          <Button label="AC" onClick={clear} className="bg-gray-600 text-white" />
          <Button label="±" onClick={toggleSign} className="bg-gray-600 text-white" />
          <Button label="%" onClick={percentage} className="bg-gray-600 text-white" />
          <Button label="÷" onClick={() => performOperation('÷')} className={`${operation === '÷' ? 'bg-white text-amber-500' : 'bg-amber-500 text-black'}`} />
          
          <Button label="7" onClick={() => inputDigit('7')} className="bg-white/10 text-white" />
          <Button label="8" onClick={() => inputDigit('8')} className="bg-white/10 text-white" />
          <Button label="9" onClick={() => inputDigit('9')} className="bg-white/10 text-white" />
          <Button label="×" onClick={() => performOperation('×')} className={`${operation === '×' ? 'bg-white text-amber-500' : 'bg-amber-500 text-black'}`} />
          
          <Button label="4" onClick={() => inputDigit('4')} className="bg-white/10 text-white" />
          <Button label="5" onClick={() => inputDigit('5')} className="bg-white/10 text-white" />
          <Button label="6" onClick={() => inputDigit('6')} className="bg-white/10 text-white" />
          <Button label="−" onClick={() => performOperation('−')} className={`${operation === '−' ? 'bg-white text-amber-500' : 'bg-amber-500 text-black'}`} />
          
          <Button label="1" onClick={() => inputDigit('1')} className="bg-white/10 text-white" />
          <Button label="2" onClick={() => inputDigit('2')} className="bg-white/10 text-white" />
          <Button label="3" onClick={() => inputDigit('3')} className="bg-white/10 text-white" />
          <Button label="+" onClick={() => performOperation('+')} className={`${operation === '+' ? 'bg-white text-amber-500' : 'bg-amber-500 text-black'}`} />
          
          <Button label="0" onClick={() => inputDigit('0')} className="bg-white/10 text-white" wide />
          <Button label="." onClick={inputDecimal} className="bg-white/10 text-white" />
          <Button label="=" onClick={calculate} className="bg-amber-500 text-black" />
        </div>

        {/* Backspace */}
        <button
          onClick={backspace}
          className="w-full mt-3 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
          </svg>
          Backspace
        </button>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">History</span>
              <button
                onClick={() => setHistory([])}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {history.map((entry, i) => (
                <div key={i} className="text-sm text-gray-400 font-mono bg-white/5 rounded-lg px-3 py-2">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
