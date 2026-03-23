import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="bg-white p-10 rounded-2xl shadow-lg text-center mb-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-3">
        <UploadCloud className="w-8 h-8 text-blue-600" />
        Upload CSV File for Analysis
      </h2>
      <p className="text-gray-500 mb-6">Select your Service Request data file to begin analysis</p>
      
      <label className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl cursor-pointer transition-all shadow-md hover:shadow-lg font-semibold text-lg">
        <FileText className="w-5 h-5" />
        Choose CSV File
        <input 
          type="file" 
          className="hidden" 
          accept=".csv" 
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>

      {fileName && (
        <div className="mt-4 text-gray-600 font-medium flex items-center justify-center gap-2">
          <FileText className="w-4 h-4 text-blue-500" />
          {fileName}
        </div>
      )}

      {isLoading && (
        <div className="mt-6 flex items-center justify-center gap-3 text-blue-600 font-medium">
          <Loader2 className="w-6 h-6 animate-spin" />
          Processing data...
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-lg font-medium border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}
