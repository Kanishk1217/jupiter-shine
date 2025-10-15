import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { CSVData } from "@/pages/Index";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataPreviewProps {
  data: CSVData;
}

const ROWS_PER_PAGE = 10;

const DataPreview = ({ data }: DataPreviewProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(data.rows.length / ROWS_PER_PAGE);
  const startIdx = currentPage * ROWS_PER_PAGE;
  const endIdx = startIdx + ROWS_PER_PAGE;
  const displayRows = data.rows.slice(startIdx, endIdx);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Data Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {data.headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, idx) => (
              <TableRow key={idx}>
                {data.headers.map((header) => (
                  <TableCell key={header}>
                    {row[header] !== null && row[header] !== undefined
                      ? String(row[header])
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DataPreview;
