import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatisticsPanelProps {
  data: CSVData;
}

const StatisticsPanel = ({ data }: StatisticsPanelProps) => {
  const getColumnStats = (header: string) => {
    const values = data.rows.map((row) => row[header]).filter((v) => v !== null && v !== undefined);
    const numericValues = values.filter((v) => typeof v === "number");
    
    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      const min = Math.min(...numericValues);
      const max = Math.max(...numericValues);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      return {
        type: "numeric",
        count: values.length,
        missing: data.rows.length - values.length,
        mean: mean.toFixed(2),
        min,
        max,
        median,
      };
    } else {
      const uniqueValues = new Set(values);
      return {
        type: "categorical",
        count: values.length,
        missing: data.rows.length - values.length,
        unique: uniqueValues.size,
      };
    }
  };

  const getMissingValues = () => {
    return data.headers.map((header) => {
      const missing = data.rows.filter((row) => row[header] === null || row[header] === undefined).length;
      return { column: header, missing, percentage: ((missing / data.rows.length) * 100).toFixed(1) };
    });
  };

  const getCategoricalSummary = () => {
    return data.headers.map((header) => {
      const values = data.rows.map((row) => row[header]).filter((v) => v !== null && v !== undefined);
      const isNumeric = values.every((v) => typeof v === "number");
      
      if (!isNumeric) {
        const valueCounts = values.reduce((acc: any, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});
        
        const sorted = Object.entries(valueCounts)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 5);
        
        return {
          column: header,
          unique: Object.keys(valueCounts).length,
          topValues: sorted,
        };
      }
      return null;
    }).filter(Boolean);
  };

  const getCorrelation = () => {
    const numericHeaders = data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number";
    });

    if (numericHeaders.length < 2) return [];

    const correlations: any[] = [];
    for (let i = 0; i < numericHeaders.length; i++) {
      for (let j = i + 1; j < numericHeaders.length; j++) {
        const col1 = numericHeaders[i];
        const col2 = numericHeaders[j];
        
        const values1 = data.rows.map(row => row[col1]).filter(v => typeof v === "number");
        const values2 = data.rows.map(row => row[col2]).filter(v => typeof v === "number");
        
        if (values1.length > 0 && values2.length > 0) {
          const correlation = calculateCorrelation(values1, values2);
          correlations.push({ col1, col2, correlation: correlation.toFixed(3) });
        }
      }
    }
    return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  };

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

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Statistical Analysis</h2>
      <Tabs defaultValue="summary">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary Statistics</TabsTrigger>
          <TabsTrigger value="categorical">Categorical Data</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="missing">Missing Values</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Missing</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.headers.map((header) => {
                  const stats = getColumnStats(header);
                  return (
                    <TableRow key={header}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell>{stats.type}</TableCell>
                      <TableCell>{stats.count}</TableCell>
                      <TableCell>{stats.missing}</TableCell>
                      <TableCell>
                        {stats.type === "numeric" ? (
                          <div className="text-sm">
                            Mean: {stats.mean} | Min: {stats.min} | Max: {stats.max}
                          </div>
                        ) : (
                          <div className="text-sm">Unique values: {stats.unique}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categorical" className="mt-4">
          <ScrollArea className="h-[400px]">
            {getCategoricalSummary().map((item: any) => (
              <div key={item.column} className="mb-6 pb-4 border-b border-border last:border-0">
                <h3 className="font-semibold text-foreground mb-2">
                  {item.column} ({item.unique} unique values)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Value</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.topValues.map(([value, count]: any) => (
                      <TableRow key={value}>
                        <TableCell className="font-medium">{String(value)}</TableCell>
                        <TableCell>{count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="correlation" className="mt-4">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column 1</TableHead>
                  <TableHead>Column 2</TableHead>
                  <TableHead>Correlation</TableHead>
                  <TableHead>Strength</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCorrelation().map((item, idx) => {
                  const absCorr = Math.abs(parseFloat(item.correlation));
                  const strength = absCorr > 0.7 ? "Strong" : absCorr > 0.4 ? "Moderate" : "Weak";
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.col1}</TableCell>
                      <TableCell className="font-medium">{item.col2}</TableCell>
                      <TableCell>{item.correlation}</TableCell>
                      <TableCell>{strength}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="missing" className="mt-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column</TableHead>
                  <TableHead>Missing Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getMissingValues().map((item) => (
                  <TableRow key={item.column}>
                    <TableCell className="font-medium">{item.column}</TableCell>
                    <TableCell>{item.missing}</TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default StatisticsPanel;
