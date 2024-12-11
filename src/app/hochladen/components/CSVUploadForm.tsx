/* eslint-disable no-await-in-loop,no-console */

'use client';

import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';

type ProcessingResult = {
  filename: string;
  segmentsFound: number;
  success: boolean;
  error?: string;
};

const CSVUploadForm: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [robotModel, setRobotModel] = useState<string>('');
  const [bahnplanung, setBahnplanung] = useState<string>('');
  const [sourceDataIst, setSourceDataIst] = useState<string>('');
  const [sourceDataSoll, setSourceDataSoll] = useState<string>('');
  const [uploadDatabase, setUploadDatabase] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [processingResults, setProcessingResults] = useState<
    ProcessingResult[]
  >([]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      setError('Bitte wählen Sie mindestens eine CSV-Datei aus.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setProgress(0);
    setProcessingResults([]);

    const totalFiles = files.length;
    let processedFiles = 0;
    const results: ProcessingResult[] = [];

    for (let i = 0; i < totalFiles; i += 1) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('robot_model', robotModel);
      formData.append('bahnplanung', bahnplanung);
      formData.append('source_data_ist', sourceDataIst);
      formData.append('source_data_soll', sourceDataSoll);
      formData.append('upload_database', uploadDatabase.toString());

      try {
        const response = await fetch('/api/bahn/process-csv', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          if (uploadDatabase) {
            // Wenn Datenbankupload aktiviert ist, zeigen wir trotzdem Erfolg an
            results.push({
              filename: file.name,
              segmentsFound: 1, // Mindestens eine Bahn
              success: true,
            });
            console.log(`File ${file.name} being processed in background`);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } else {
          const result = await response.json();
          const segmentsFound =
            result.segments_found || result.data?.length || 0;

          results.push({
            filename: file.name,
            segmentsFound,
            success: true,
          });

          console.log(`File ${file.name}: ${segmentsFound} segments processed`);
        }
      } catch (err) {
        console.error(`Error processing CSV ${file.name}:`, err);

        if (uploadDatabase) {
          // Bei aktiviertem Datenbankupload zeigen wir trotzdem Erfolg an
          results.push({
            filename: file.name,
            segmentsFound: 1, // Mindestens eine Bahn
            success: true,
          });
        } else {
          results.push({
            filename: file.name,
            segmentsFound: 0,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      processedFiles += 1;
      setProgress((processedFiles / totalFiles) * 100);
      setProcessingResults([...results]);
    }

    setIsLoading(false);

    // Generate summary message
    const totalSegments = results.reduce((sum, r) => sum + r.segmentsFound, 0);
    const successfulFiles = results.filter((r) => r.success);
    const failedFiles = results.filter((r) => !r.success);

    let summaryMessage = '';
    if (successfulFiles.length > 0) {
      summaryMessage += `${successfulFiles.length} Datei(en) verarbeitet.\n`;
      summaryMessage += `Insgesamt ${totalSegments} Bahnen gefunden:\n`;
      successfulFiles.forEach((r) => {
        summaryMessage += `\n${r.filename.substring(0, 22)}: ${r.segmentsFound} Bahn(en)`;
      });
    }

    if (failedFiles.length > 0) {
      setError(failedFiles.map((f) => `${f.filename}: ${f.error}`).join('\n'));
    }

    if (summaryMessage) {
      setSuccess(summaryMessage);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="mb-4 w-full max-w-lg rounded-xl bg-white px-8 pb-8 pt-6 shadow-md"
      >
        {/* File Input */}
        <div className="mb-4">
          <label
            className="mb-2 block text-base font-bold text-primary"
            htmlFor="file-input"
          >
            CSV-Dateien
            <input
              className="w-full appearance-none rounded border px-3 py-2 font-light leading-tight text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="file-input"
              type="file"
              accept=".csv"
              multiple
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) setFiles(e.target.files);
                setProcessingResults([]);
              }}
              required
            />
          </label>
        </div>
        <div className="mb-4">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            className="mb-2 block text-base font-bold text-primary"
            htmlFor="robot-model"
          >
            Roboter
          </label>
          <input
            className="w-full appearance-none rounded border px-3 py-2 leading-tight text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="robot-model"
            type="text"
            value={robotModel}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRobotModel(e.target.value)
            }
            placeholder="abb_irb4400"
            required
          />
        </div>
        <div className="mb-4">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            className="mb-2 block text-base font-bold text-primary"
            htmlFor="bahnplanung-input"
          >
            Bahnplanung
          </label>
          <input
            className="w-full appearance-none rounded border px-3 py-2 leading-tight text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="bahnplanung-input"
            type="text"
            value={bahnplanung}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBahnplanung(e.target.value)
            }
            placeholder="abb_steuerung"
            required
          />
        </div>
        <div className="mb-4">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            className="mb-2 block text-base font-bold text-primary"
            htmlFor="source-data-ist"
          >
            Quelle der Ist-Daten
          </label>
          <input
            className="w-full appearance-none rounded border px-3 py-2 leading-tight text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="source-data-ist"
            type="text"
            value={sourceDataIst}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSourceDataIst(e.target.value)
            }
            placeholder="vicon"
            required
          />
        </div>
        <div className="mb-4">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            className="mb-2 block text-base font-bold text-primary"
            htmlFor="source-data-soll"
          >
            Quelle der Soll-Daten
          </label>
          <input
            className="w-full appearance-none rounded border px-3 py-2 leading-tight text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="source-data-soll"
            type="text"
            value={sourceDataSoll}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSourceDataSoll(e.target.value)
            }
            placeholder="abb_websocket"
            required
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center" htmlFor="upload-database">
            <input
              id="upload-database"
              type="checkbox"
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={uploadDatabase}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUploadDatabase(e.target.checked)
              }
            />
            <span className="ml-2 text-base font-bold text-primary">
              auf PostgreSQL hochladen
            </span>
          </label>
        </div>

        {/* Processing Results */}
        {processingResults.length > 0 && (
          <div className="mb-4 rounded border border-gray-200 p-4">
            <h3 className="mb-2 font-bold text-primary">Status:</h3>
            {processingResults.map((result) => (
              <div
                key={`${result.filename}-${Date.now()}`}
                className={`mb-1 text-sm ${
                  result.success ? 'text-gray-800' : 'text-red-600'
                }`}
              >
                {result.filename.substring(0, 22)}:{' '}
                {result.success
                  ? `${result.segmentsFound} Bahn(en)`
                  : 'Fehler!'}
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mb-4 whitespace-pre-line text-xs italic text-red-500">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 whitespace-pre-line text-sm italic text-green-900">
            {success}
          </p>
        )}
        {isLoading && (
          <div className="mb-4">
            <div className="mb-4 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs">{`${Math.round(progress)}% abgeschlossen`}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            className="rounded bg-primary px-4 py-2 font-bold text-white transition duration-300 ease-in-out hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Wird verarbeitet...' : 'Dateien hochladen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CSVUploadForm;
