import { useCallback } from "react";
import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  return (
    <Card className="p-12 text-center">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-16 hover:border-primary transition-colors cursor-pointer"
      >
        <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Upload CSV File</h2>
        <p className="text-muted-foreground mb-6">Drag and drop your CSV file here, or click to browse</p>
        <label className="inline-block">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />
          <span className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2 cursor-pointer">
            Choose File
          </span>
        </label>
      </div>
    </Card>
  );
};

export default FileUpload;
