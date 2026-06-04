 'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ForestryCountCard } from '@/components/trees/ForestryCountCard';
import { TreeAnalysisResult } from '@/components/trees/TreeAnalysisResult';
import { TreeHistoryList } from '@/components/trees/TreeHistoryList';
import { TreeQuotaCard } from '@/components/trees/TreeQuotaCard';
import { TreeStatusBanner } from '@/components/trees/TreeStatusBanner';
import { TreeUploadForm } from '@/components/trees/TreeUploadForm';
import {
  normalizeForestryCountResponse,
  normalizeTreeAnalyzeResponse,
  normalizeTreeHistoryResponse,
  normalizeTreeQuotaResponse,
} from '@/lib/tree-normalizer';
import type {
  NormalizedTreeAnalysis,
  NormalizedTreeQuota,
  NormalizedTreeHistoryItem,
  NormalizedForestryCount,
} from '@/types/trees';

const fetchApi = async (endpoint: string) => {
  const response = await fetch(endpoint, { cache: 'no-store' });
  const json = await response.json();
  return { response, json };
};

export default function TreesPage() {
  const [analysis, setAnalysis] = useState<NormalizedTreeAnalysis | null>(null);
  const [quota, setQuota] = useState<NormalizedTreeQuota | null>(null);
  const [history, setHistory] = useState<NormalizedTreeHistoryItem[]>([]);
  const [countResult, setCountResult] = useState<NormalizedForestryCount | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState({ quota: false, history: false, count: false });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadQuota = async () => {
      setLoading((prev) => ({ ...prev, quota: true }));
      try {
        const { response, json } = await fetchApi('/api/trees/quota');
        if (!response.ok) {
          setError(json?.error?.message || 'Unable to load tree quota.');
          return;
        }
        setQuota(normalizeTreeQuotaResponse(json));
        setDemoMode(Boolean(json.demoMode || json.payload?.demoMode));
      } catch {
        setError('Unable to load tree quota.');
      } finally {
        setLoading((prev) => ({ ...prev, quota: false }));
      }
    };

    const loadHistory = async () => {
      setLoading((prev) => ({ ...prev, history: true }));
      try {
        const { response, json } = await fetchApi('/api/trees/history');
        if (!response.ok) {
          setError(json?.error?.message || 'Unable to load tree history.');
          return;
        }
        setHistory(normalizeTreeHistoryResponse(json));
        setDemoMode((current) => current || Boolean(json.demoMode || json.payload?.demoMode));
      } catch {
        setError('Unable to load tree history.');
      } finally {
        setLoading((prev) => ({ ...prev, history: false }));
      }
    };

    loadQuota();
    loadHistory();
  }, []);

  const handleAnalyze = async (formData: FormData, imageFile: File) => {
    setError('');
    setCountResult(null);

    try {
      const response = await fetch('/api/trees/analyze', {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || 'Unable to analyze tree canopy.');
      }

      const normalized = normalizeTreeAnalyzeResponse(json);
      if (!normalized) {
        throw new Error('Unexpected response from tree analysis.');
      }

      setAnalysis(normalized);
      setSelectedImage(imageFile);
      setDemoMode(Boolean(json.demoMode || json.payload?.demoMode || normalized.demoMode));
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Unable to analyze tree canopy.');
    }
  };

  const handleRunCount = async () => {
    if (!selectedImage) {
      setError('Upload an image before running forestry count.');
      return;
    }

    setError('');
    setLoading((prev) => ({ ...prev, count: true }));

    try {
      const formData = new FormData();
      formData.append('image', selectedImage, selectedImage.name);

      const response = await fetch('/api/forestry/count', {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || 'Unable to perform forestry count.');
      }

      const normalized = normalizeForestryCountResponse(json);
      if (!normalized) {
        throw new Error('Unexpected response from forestry count.');
      }

      setCountResult(normalized);
      setDemoMode(Boolean(json.demoMode || json.payload?.demoMode || normalized.demoMode));
    } catch (countError) {
      setError(countError instanceof Error ? countError.message : 'Unable to perform forestry count.');
    } finally {
      setLoading((prev) => ({ ...prev, count: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Tree Intelligence</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">Canopy analysis & forestry counting</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Upload canopy imagery from your farm to uncover tree density, coverage, and health guidance. Use the forestry count endpoint for a detailed tree inventory estimate.
          </p>
        </div>

        <TreeStatusBanner demoMode={demoMode} error={error} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <TreeUploadForm onSubmit={handleAnalyze} demoMode={demoMode} />
          <TreeAnalysisResult analysis={analysis} />
        </div>

        <div className="space-y-6">
          <TreeQuotaCard quota={quota} />
          <ForestryCountCard
            countResult={countResult}
            canRun={Boolean(selectedImage)}
            loading={loading.count}
            supported={quota?.supported ?? true}
            onRunCount={handleRunCount}
            message={countResult?.message}
          />
          <TreeHistoryList history={history} />
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
