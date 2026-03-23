import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  theme?: 'blue' | 'green';
}

export function Layout({ children, title, subtitle, theme = 'blue' }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const bgGradient = theme === 'blue' 
    ? 'bg-gradient-to-br from-[#003366] to-[#0066cc]' 
    : 'bg-gradient-to-br from-[#006633] to-[#009966]';

  const headerText = theme === 'blue' ? 'text-[#003366]' : 'text-[#006633]';
  const backBtnBg = theme === 'blue' ? 'bg-[#0066cc] hover:bg-[#003366]' : 'bg-[#009966] hover:bg-[#006633]';

  return (
    <div className={`min-h-screen ${bgGradient} p-4 md:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto">
        {!isHome && (
          <div className="bg-white p-8 rounded-2xl shadow-xl text-center mb-8 relative">
            <div className="inline-block bg-gradient-to-br from-[#E31837] to-[#ff3355] text-white text-3xl font-bold px-10 py-4 rounded-xl mb-6 tracking-widest shadow-lg">
              AVAYA
            </div>
            <h1 className={`text-4xl font-bold ${headerText} mb-3`}>{title}</h1>
            <p className="text-gray-600 text-lg mb-6">{subtitle}</p>
            
            <Link 
              to="/" 
              className={`inline-flex items-center gap-2 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${backBtnBg}`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Main Menu
            </Link>
          </div>
        )}

        {children}

        <div className="text-center text-white/80 mt-12 pb-8">
          <p className="font-semibold">Avaya GSS Services - {title}</p>
          <p className="text-sm mt-2">© {new Date().getFullYear()} | FL Region Analysis Enabled</p>
        </div>
      </div>
    </div>
  );
}
