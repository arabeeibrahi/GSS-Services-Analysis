import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AiInsightsProps {
  metricsSummary: string;
  context: string;
}

export function AiInsights({ metricsSummary, context }: AiInsightsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert data analyst for Avaya GSS Services. 
      Analyze the following ${context} metrics and provide a brief, professional executive summary with 3 key actionable insights.
      
      Metrics Data:
      ${metricsSummary}
      
      Format your response in Markdown with clear headings and bullet points. Keep it concise.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsights(response.text || 'No insights generated.');
    } catch (err: any) {
      setError(err.message || 'Failed to generate insights. Please check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg border border-indigo-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Gemini AI Insights
          </h2>
          <p className="text-indigo-700/80 mt-1">Get an AI-powered executive summary of your current metrics</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isLoading ? 'Analyzing...' : 'Generate Insights'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 mb-4">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {insights && (
        <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm prose prose-indigo max-w-none">
          <div dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />
        </div>
      )}
    </div>
  );
}
