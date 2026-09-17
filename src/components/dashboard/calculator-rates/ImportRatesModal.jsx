import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/apiClient";

export default function ImportRatesModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const handleDownloadTemplate = () => {
    window.open('/api/calculator-rates/template', '_blank');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) {
      toast.warning("Please select a CSV file first.");
      return;
    }

    setIsVerifying(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validate_only', '1');

      const response = await apiFetch('/calculator-rates/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to validate file');
      }

      const result = await response.json();
      setValidationResult(result);
      toast.success(`File validated: ${result.valid_rows} valid rows out of ${result.total_rows}.`);
    } catch (error) {
      toast.error("Validation error: " + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validate_only', '0');

      const response = await apiFetch('/calculator-rates/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to import rates');
      }

      const result = await response.json();
      toast.success(result.message || "Rates imported successfully!");
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error("Import error: " + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Calculator Rates</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing DC and FBR valuation rates. Missing cities, societies, phases, and blocks will be auto-created. Download the sample CSV template below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Download Sample Template</p>
              <p className="text-xs text-muted-foreground">Sample CSV template with realistic hierarchy test structure</p>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="w-4 h-4 mr-1.5" /> Download Sample CSV
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import_file">Select CSV File (.csv)</Label>
            <Input
              id="import_file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {file && !validationResult && (
            <div className="flex justify-end">
              <Button onClick={handleValidate} disabled={isVerifying}>
                {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Validate File
              </Button>
            </div>
          )}

          {validationResult && (
            <div className="space-y-4 border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-semibold text-base">Validation Summary</h3>
                <div className="flex gap-3 text-sm">
                  <span className="text-muted-foreground">Total: <b>{validationResult.total_rows}</b></span>
                  <span className="text-green-600 font-medium">Valid: <b>{validationResult.valid_rows}</b></span>
                  <span className="text-red-600 font-medium">Invalid: <b>{validationResult.invalid_rows}</b></span>
                  <span className="text-orange-600 font-medium">Duplicates: <b>{validationResult.duplicate_rows}</b></span>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {validationResult.details.map((detail, idx) => (
                  <div key={idx} className={`p-2 rounded text-xs border ${detail.is_valid ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/20 dark:text-green-300' : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/20 dark:text-red-300'}`}>
                    <div className="flex justify-between font-semibold">
                      <span>Row {detail.row}: {detail.city} &gt; {detail.society} &gt; {detail.phase} {detail.block ? `(${detail.block})` : ''} - {detail.property_type}</span>
                      <span>{detail.is_valid ? 'Valid' : 'Invalid'}</span>
                    </div>
                    {detail.errors.length > 0 && (
                      <ul className="list-disc list-inside mt-1 text-red-600 dark:text-red-400">
                        {detail.errors.map((err, eIdx) => (
                          <li key={eIdx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleImport}
                  disabled={validationResult.valid_rows === 0 || isImporting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Import Valid Rows ({validationResult.valid_rows})
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isVerifying || isImporting}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
