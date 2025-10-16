import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { useMemo } from "react";

interface CorrelationHeatmapProps {
  data: CSVData;
}

const CorrelationHeatmap = ({ data }: CorrelationHeatmapProps) => {
  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = Math.min(x.length, y.length);
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }
    
    return numerator / Math.sqrt(denomX * denomY);
  };

  const { correlationMatrix, numericHeaders } = useMemo(() => {
    const numericHeaders = data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });

    if (numericHeaders.length < 2) {
      return { correlationMatrix: [], numericHeaders: [] };
    }

    const matrix: number[][] = [];
    for (let i = 0; i < numericHeaders.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < numericHeaders.length; j++) {
        const col1 = numericHeaders[i];
        const col2 = numericHeaders[j];
        
        const values1 = data.rows.map(row => row[col1]).filter(v => typeof v === "number") as number[];
        const values2 = data.rows.map(row => row[col2]).filter(v => typeof v === "number") as number[];
        
        matrix[i][j] = calculateCorrelation(values1, values2);
      }
    }

    return { correlationMatrix: matrix, numericHeaders };
  }, [data]);

  const getColor = (value: number) => {
    const absValue = Math.abs(value);
    if (value > 0) {
      const intensity = Math.round(absValue * 255);
      return `rgb(${255 - intensity}, ${200 - intensity * 0.5}, ${200 - intensity * 0.5})`;
    } else {
      const intensity = Math.round(absValue * 255);
      return `rgb(${200 - intensity * 0.5}, ${200 - intensity * 0.5}, ${255 - intensity})`;
    }
  };

  if (numericHeaders.length < 2) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Correlation Heatmap</h2>
        <p className="text-muted-foreground">Need at least 2 numeric columns for correlation heatmap.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Correlation Heatmap</h2>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="border border-border p-2 bg-muted"></th>
                {numericHeaders.map((header) => (
                  <th key={header} className="border border-border p-2 bg-muted text-xs font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {numericHeaders.map((rowHeader, i) => (
                <tr key={rowHeader}>
                  <td className="border border-border p-2 bg-muted text-xs font-medium">
                    {rowHeader}
                  </td>
                  {numericHeaders.map((_, j) => {
                    const value = correlationMatrix[i][j];
                    return (
                      <td
                        key={j}
                        className="border border-border p-3 text-center text-xs"
                        style={{ backgroundColor: getColor(value) }}
                      >
                        {value.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
};

export default CorrelationHeatmap;
