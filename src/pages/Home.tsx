import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, RefreshCw, ShieldCheck, Globe, Clock, FileSpreadsheet, Lock } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003366] via-[#0066cc] to-[#0099ff] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <div className="bg-white rounded-[2rem] p-8 md:p-16 shadow-2xl text-center max-w-5xl w-full">
        <div className="mb-10">
          <div className="inline-block bg-gradient-to-br from-[#E31837] to-[#ff3355] text-white text-5xl font-bold px-12 py-6 rounded-2xl tracking-[0.3em] shadow-[0_10px_30px_rgba(227,24,55,0.4)]">
            AVAYA
          </div>
        </div>
        
        <h1 className="text-[#003366] text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">
          Avaya GSS Services Analysis
        </h1>
        <p className="text-gray-500 text-xl mb-12 font-medium">
          Comprehensive Service Request Performance Dashboard
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <Link 
            to="/slo" 
            className="group block bg-gradient-to-br from-[#0066cc] to-[#0099ff] text-white p-10 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,102,204,0.4)] border-4 border-transparent hover:border-[#003366]/20"
          >
            <BarChart3 className="w-16 h-16 mx-auto mb-6 text-white/90 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-4">Response SLO Analysis</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Analyze Service Level Objective compliance, response times, and performance metrics by severity, FL Region, and time periods
            </p>
          </Link>
          
          <Link 
            to="/assignment" 
            className="group block bg-gradient-to-br from-[#009933] to-[#00cc66] text-white p-10 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,153,51,0.4)] border-4 border-transparent hover:border-[#006633]/20"
          >
            <RefreshCw className="w-16 h-16 mx-auto mb-6 text-white/90 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold mb-4">Assignment Analysis</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Track SR assignment patterns, delays, FL Region distribution, and assignment efficiency metrics
            </p>
          </Link>
        </div>
        
        <div className="mt-20 pt-12 border-t-2 border-gray-100">
          <h3 className="text-[#003366] text-2xl font-bold mb-10">Key Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <FeatureItem icon={<BarChart3 />} title="Real-time Analytics" desc="Interactive visualizations" />
            <FeatureItem icon={<ShieldCheck />} title="SLO Tracking" desc="Compliance monitoring" />
            <FeatureItem icon={<Globe />} title="FL Region Insights" desc="Regional performance view" />
            <FeatureItem icon={<Clock />} title="Delay Patterns" desc="Week & region analysis" />
            <FeatureItem icon={<FileSpreadsheet />} title="Easy Upload" desc="CSV file analysis" />
            <FeatureItem icon={<Lock />} title="Secure Processing" desc="Client-side only" />
          </div>
        </div>
        
        <div className="mt-16 text-gray-400 text-sm font-medium">
          <p>© {new Date().getFullYear()} Avaya GSS Services | Analytics Dashboard</p>
          <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-gray-50 hover:bg-gray-100 p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1">
      <div className="text-[#0066cc] flex justify-center mb-4 [&>svg]:w-10 [&>svg]:h-10">
        {icon}
      </div>
      <h4 className="text-[#003366] font-bold text-lg mb-2">{title}</h4>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
