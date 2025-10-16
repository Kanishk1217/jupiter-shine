import { useState } from "react";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import DataPreview from "@/components/DataPreview";
import StatisticsPanel from "@/components/StatisticsPanel";
import VisualizationPanel from "@/components/VisualizationPanel";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import DistributionPlots from "@/components/DistributionPlots";
import BoxPlots from "@/components/BoxPlots";
import MLAnalysis from "@/components/MLAnalysis";

export interface CSVData {
  headers: string[];
  rows: any[];
  fileName: string;
}

const Index = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0]);
          setCsvData({
            headers,
            rows: results.data,
            fileName: file.name,
          });
          toast({
            title: "File uploaded successfully",
            description: `Loaded ${results.data.length} rows`,
          });
        }
      },
      error: (error) => {
        toast({
          title: "Error parsing file",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleReset = () => {
    setCsvData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">CSV Data Analyzer</h1>
              <p className="text-muted-foreground mt-1">Upload and analyze any CSV file</p>
            </div>
            {csvData && (
              <Button onClick={handleReset} variant="outline">
                Upload New File
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!csvData ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-2">File: {csvData.fileName}</h2>
              <p className="text-muted-foreground">
                {csvData.rows.length} rows × {csvData.headers.length} columns
              </p>
            </Card>

            <DataPreview data={csvData} />
            <StatisticsPanel data={csvData} />
            <CorrelationHeatmap data={csvData} />
            <DistributionPlots data={csvData} />
            <VisualizationPanel data={csvData} />
            <BoxPlots data={csvData} />
            <MLAnalysis data={csvData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
