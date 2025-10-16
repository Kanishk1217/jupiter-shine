import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface DistributionPlotsProps {
  data: CSVData;
}

const DistributionPlots = ({ data }: DistributionPlotsProps) => {
  const numericColumns = useMemo(() => {
    return data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });
  }, [data]);

  const [selectedColumn, setSelectedColumn] = useState(numericColumns[0] || "");

  const distributionData = useMemo(() => {
    if (!selectedColumn) return [];

    const values = data.rows
      .map((row) => row[selectedColumn])
      .filter((v) => typeof v === "number") as number[];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 20;
    const binSize = (max - min) / bins;

    const histogram = Array(bins).fill(0);
    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    return histogram.map((count, i) => ({
      range: `${(min + i * binSize).toFixed(0)}-${(min + (i + 1) * binSize).toFixed(0)}`,
      count,
    }));
  }, [data, selectedColumn]);

  if (numericColumns.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Distribution Plots</h2>
        <p className="text-muted-foreground">No numeric columns found for distribution analysis.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Distribution Plot</h2>
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {numericColumns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={distributionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DistributionPlots;
