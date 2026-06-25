"use client";
import { Menu, User as UserIcon, Clock, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentProfile, signOut } from '@/lib/auth';
import { Profile } from '@/types';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [time, setTime] = useState<Date | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const p = await getCurrentProfile();
        setProfile(p);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProf();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const initials = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?';

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center">
        {/* 
        <button className="md:hidden p-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-md">
          <Menu className="w-6 h-6" />
        </button>
        */}
        {/* Real-time Clock */}
        <div className="text-sm font-medium text-gray-600 hidden sm:flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {time ? time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit', second:'2-digit' }) : 'Memuat...'}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 p-2 rounded-md transition-colors">
          <div className="w-8 h-8 bg-[#FFB300] rounded-full flex items-center justify-center text-[#3E2723] font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium hidden sm:block text-gray-700">
            {profile?.full_name || 'Memuat...'}
          </span>
        </div>
        
        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors flex items-center gap-1"
          title="Keluar"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Keluar</span>
        </button>
      </div>
    </header>
  );
}
