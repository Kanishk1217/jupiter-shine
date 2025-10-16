import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface BoxPlotsProps {
  data: CSVData;
}

const BoxPlots = ({ data }: BoxPlotsProps) => {
  const { numericColumns, categoricalColumns } = useMemo(() => {
    const numeric = data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });

    const categorical = data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "string";
    });

    return { numericColumns: numeric, categoricalColumns: categorical };
  }, [data]);

  const [selectedNumeric, setSelectedNumeric] = useState(numericColumns[0] || "");
  const [selectedCategorical, setSelectedCategorical] = useState(categoricalColumns[0] || "");

  const boxPlotData = useMemo(() => {
    if (!selectedNumeric || !selectedCategorical) return [];

    const grouped = data.rows.reduce((acc: any, row) => {
      const category = row[selectedCategorical];
      const value = row[selectedNumeric];
      
      if (typeof value === "number" && category !== null && category !== undefined) {
        if (!acc[category]) acc[category] = [];
        acc[category].push(value);
      }
      return acc;
    }, {});

    return Object.entries(grouped).map(([category, values]: [string, any]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const median = sorted[Math.floor(sorted.length * 0.5)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];

      return { category, min, q1, median, q3, max };
    });
  }, [data, selectedNumeric, selectedCategorical]);

  if (numericColumns.length === 0 || categoricalColumns.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Box Plots</h2>
        <p className="text-muted-foreground">
          Need both numeric and categorical columns for box plots.
        </p>
      </Card>
    );
  }

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-foreground">Box Plot Analysis</h2>
        <div className="flex gap-2">
          <Select value={selectedNumeric} onValueChange={setSelectedNumeric}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Numeric" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategorical} onValueChange={setSelectedCategorical}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoricalColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="category" 
            dataKey="category" 
            name="Category"
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis type="number" dataKey="median" name="Value" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Min" data={boxPlotData} dataKey="min" fill="#8884d8" />
          <Scatter name="Q1" data={boxPlotData} dataKey="q1" fill="#82ca9d">
            {boxPlotData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
          <Scatter name="Median" data={boxPlotData} dataKey="median" fill="#ffc658">
            {boxPlotData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
          <Scatter name="Q3" data={boxPlotData} dataKey="q3" fill="#ff8042">
            {boxPlotData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
          <Scatter name="Max" data={boxPlotData} dataKey="max" fill="#8dd1e1" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default BoxPlots;
