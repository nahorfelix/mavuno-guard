'use client';

import { useMemo, useState, type DragEvent, type FormEvent, type ChangeEvent } from 'react';

type TreeUploadFormProps = {
  onSubmit: (formData: FormData, imageFile: File) => Promise<void>;
  demoMode?: boolean;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function TreeUploadForm({ onSubmit, demoMode }: TreeUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [farmName, setFarmName] = useState('');
  const [county, setCounty] = useState('');
  const [landAcres, setLandAcres] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const fileHint = useMemo(() => {
    if (!file) return 'JPEG, PNG, or WebP image up to 20MB.';
    return `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }, [file]);

  const handleFiles = (selected: FileList | null) => {
    if (!selected?.length) return;
    const selectedFile = selected[0];

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Please choose a JPEG, PNG, or WebP image.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('Image must be 20MB or smaller.');
      return;
    }

    setError('');
    setFile(selectedFile);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a canopy image before running analysis.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file, file.name);
    if (farmName.trim()) formData.append('farm_name', farmName.trim());
    if (county.trim()) formData.append('county', county.trim());
    if (landAcres.trim()) formData.append('land_acres', landAcres.trim());
    if (notes.trim()) formData.append('notes', notes.trim());

    try {
      setLoading(true);
      await onSubmit(formData, file);
    } catch (submitError) {
      setError('Unable to submit the canopy image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tree Lab</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Upload canopy imagery</h2>
          <p className="mt-2 text-sm text-slate-600">
            Submit a tree cover photo to analyze counts, canopy coverage, and forest health.
          </p>
        </div>
        {demoMode ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Demo mode
          </span>
        ) : null}
      </div>

      <div
        className={`relative rounded-3xl border-2 p-6 text-center transition ${
          dragging ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-slate-50'
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          id="tree-image-upload"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
        />
        <div className="pointer-events-none">
          <p className="text-sm font-semibold text-slate-900">Drag and drop an image</p>
          <p className="mt-2 text-xs text-slate-500">{fileHint}</p>
          <p className="mt-4 text-xs text-slate-500">Or click to browse from your device.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Farm / field name
          <input
            type="text"
            value={farmName}
            onChange={(event) => setFarmName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="E.g. Northern Ridge"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          County / region
          <input
            type="text"
            value={county}
            onChange={(event) => setCounty(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="E.g. Machakos"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Land size (acres)
          <input
            type="number"
            value={landAcres}
            onChange={(event) => setLandAcres(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="12.5"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Notes
          <input
            type="text"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            placeholder="Optional details, e.g. recent pruning"
          />
        </label>
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? 'Analyzing canopy...' : 'Analyze tree canopy'}
      </button>
    </form>
  );
}
