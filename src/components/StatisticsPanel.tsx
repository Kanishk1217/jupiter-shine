import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Statistical Analysis</h2>
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary Statistics</TabsTrigger>
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
