'use client';
import { importAllDataFromJSON } from '@/utils/importStorage';

export default function ImportButton() {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importAllDataFromJSON(file, () => window.location.reload());
  };

  return (
    <div className="mt-4">
      <label className="block mb-2 font-medium">Importuj dane (JSON):</label>
      <input type="file" accept=".json" onChange={handleFile} />
    </div>
  );
}
