import React, { useState, useEffect } from 'react';
import { Lock, User as UserIcon, LogIn, UserPlus, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, users, onRegister }) => {
  const [view, setView] = useState<'login' | 'register' | 'pending'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load remembered user from localStorage
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedUser');
    if (remembered) {
      try {
        const { username: savedUsername, password: savedPassword } = JSON.parse(remembered);
        setUsername(savedUsername);
        setPassword(savedPassword);
        setRememberMe(true);
      } catch (e) {
        // Ignore parse error
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      if (user.status === 'pending') {
        setView('pending');
        return;
      }
      if (user.status === 'rejected') {
        setError('บัญชีของคุณไม่ได้รับอนุญาตให้เข้าใช้งาน');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      onLogin(user);
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (users.some(u => u.username === username)) {
      setError('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      username,
      password,
      status: 'pending',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    onRegister(newUser);
    setView('pending');
  };

  if (view === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden network-bg">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative z-10 text-center">
          <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-100">
            <Clock className="w-10 h-10 text-yellow-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">อยู่ระหว่างดำเนินการขออนุญาตการใช้งาน</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            ข้อมูลการลงทะเบียนของคุณถูกส่งไปยังผู้ดูแลระบบแล้ว โปรดรอการตรวจสอบและอนุมัติสิทธิ์การเข้าใช้งาน
          </p>
          <button
            onClick={() => setView('login')}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </div>

        {/* Developer Credit */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center text-xs text-gray-500 z-10">
          <a 
            href="https://thanitlab.framer.website/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
          >
            <span>พัฒนาโดย</span>
            <span className="font-semibold text-gray-600 group-hover:text-blue-600">Thanit Lab</span>
            <img 
              src="https://lh3.googleusercontent.com/d/1C3Tfeq-p3IPzGIapncHjL4vuljkfNTzn" 
              alt="Thanit Lab Logo" 
              className="h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans relative overflow-hidden network-bg">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10 relative z-10">
        <div className="flex flex-col items-center mb-8 text-center">
          <img 
            src="https://lh3.googleusercontent.com/d/1fuahKUV55Ki9C4KRpgsn_5NeEgq4e_Tl" 
            alt="TN Smart Grade Logo" 
            className="h-20 object-contain mb-4"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('via.placeholder.com')) {
                target.src = 'https://via.placeholder.com/150?text=Logo';
              }
            }}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-950 mb-2 tracking-tight">
            TN Smart Grade
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {view === 'login' 
              ? 'ระบบบันทึกคะแนนวัดผลประเมินผลการเรียนรู้ดิจิทัล'
              : 'ลงทะเบียนผู้ใช้งานใหม่'}
          </p>
        </div>

        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {view === 'register' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="ชื่อ-นามสกุล"
                  required
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="ชื่อผู้ใช้ (Username)"
                required
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="รหัสผ่าน (Password)"
                required
              />
            </div>
          </div>

          {view === 'login' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                  จดจำรหัสผ่าน
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {view === 'login' ? (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                เข้าสู่ระบบ
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                ลงทะเบียน
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center space-y-4">
          {view === 'login' ? (
            <button 
              onClick={() => { setView('register'); setError(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center mx-auto font-medium"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              ลงทะเบียนผู้ใช้งานใหม่
            </button>
          ) : (
            <button 
              onClick={() => { setView('login'); setError(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center mx-auto font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับไปหน้าเข้าสู่ระบบ
            </button>
          )}
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} TN Smart Grade. All rights reserved.
          </p>
        </div>
      </div>

      {/* Developer Credit */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center text-xs text-gray-500 z-10">
        <a 
          href="https://thanitlab.framer.website/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group"
        >
          <span>พัฒนาโดย</span>
          <span className="font-semibold text-gray-600 group-hover:text-blue-600">Thanit Lab</span>
          <img 
            src="https://lh3.googleusercontent.com/d/1C3Tfeq-p3IPzGIapncHjL4vuljkfNTzn" 
            alt="Thanit Lab Logo" 
            className="h-4 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
        </a>
      </div>
    </div>
  );
};
