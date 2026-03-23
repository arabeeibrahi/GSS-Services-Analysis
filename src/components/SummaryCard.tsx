import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  label: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export function SummaryCard({ title, value, label, valueColor, icon }: SummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center flex flex-col items-center justify-center">
      <h3 className="text-blue-700 text-sm font-semibold mb-3 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className={cn("text-3xl font-bold", valueColor || "text-blue-900")}>
        {value}
      </div>
      <div className="text-gray-500 text-xs mt-2 uppercase tracking-wider font-medium">
        {label}
      </div>
    </div>
  );
}
