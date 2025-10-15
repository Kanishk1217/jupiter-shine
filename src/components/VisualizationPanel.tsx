import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface VisualizationPanelProps {
  data: CSVData;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

const VisualizationPanel = ({ data }: VisualizationPanelProps) => {
  const numericColumns = useMemo(() => {
    return data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });
  }, [data]);

  const [selectedColumn, setSelectedColumn] = useState<string>(numericColumns[0] || "");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar");

  const chartData = useMemo(() => {
    if (!selectedColumn) return [];
    
    const valueMap = new Map<any, number>();
    data.rows.forEach((row) => {
      const value = row[selectedColumn];
      if (value !== null && value !== undefined) {
        valueMap.set(value, (valueMap.get(value) || 0) + 1);
      }
    });

    return Array.from(valueMap.entries())
      .map(([name, value]) => ({ name: String(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data, selectedColumn]);

  if (numericColumns.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Visualizations</h2>
        <p className="text-muted-foreground">No numeric columns found for visualization</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Visualizations</h2>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-foreground">Column</label>
          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.headers.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block text-foreground">Chart Type</label>
          <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={120}
                fill="hsl(var(--primary))"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default VisualizationPanel;
