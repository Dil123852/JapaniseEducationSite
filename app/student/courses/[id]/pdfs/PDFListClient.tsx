'use client';

import { useState } from 'react';
import { PDF } from '@/app/lib/db/pdfs';
import { supabase } from '@/app/lib/supabaseClient';

interface Props {
  pdfs: PDF[];
  studentId: string;
}

export default function PDFListClient({ pdfs, studentId }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (pdf: PDF) => {
    setDownloading(pdf.id);
    try {
      await supabase
        .from('pdf_downloads')
        .insert({
          pdf_id: pdf.id,
          student_id: studentId,
        });
      window.open(pdf.file_url, '_blank');
    } catch (err) {
      alert('Failed to record download');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pdfs.map((pdf) => (
        <div
          key={pdf.id}
          className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
        >
          <h3 className="text-lg font-medium text-slate-800 mb-2 line-clamp-2">
            {pdf.title}
          </h3>
          {pdf.file_size && (
            <p className="text-xs text-slate-500 mb-4">
              {(pdf.file_size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          <button
            onClick={() => handleDownload(pdf)}
            disabled={downloading === pdf.id}
            className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50 min-h-[44px]"
          >
            {downloading === pdf.id ? 'Downloading...' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  );
}

