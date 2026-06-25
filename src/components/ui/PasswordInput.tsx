"use client";

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  showLockIcon?: boolean;
}

export default function PasswordInput({ label, showLockIcon = true, className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {showLockIcon && (
          <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        )}
        <input
          type={show ? 'text' : 'password'}
          className={`w-full ${showLockIcon ? 'pl-10' : 'pl-4'} pr-11 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B5E3C]/20 focus:border-[#8B5E3C] outline-none transition-all ${className ?? ''}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(prev => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
