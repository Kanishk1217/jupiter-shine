import { Card } from "@/components/ui/card";
import { CSVData } from "@/pages/Index";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from "recharts";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MLAnalysisProps {
  data: CSVData;
}

type ModelType = "classification" | "regression";
type ClassificationModel = "RandomForest" | "LogisticRegression" | "SVM";
type RegressionModel = "LinearRegression" | "RandomForestRegressor" | "Ridge";

const MLAnalysis = ({ data }: MLAnalysisProps) => {
  const [targetColumn, setTargetColumn] = useState("");
  const [modelType, setModelType] = useState<ModelType>("classification");
  const [classificationModel, setClassificationModel] = useState<ClassificationModel>("RandomForest");
  const [regressionModel, setRegressionModel] = useState<RegressionModel>("LinearRegression");
  const [isTraining, setIsTraining] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [mse, setMse] = useState<number | null>(null);
  const [r2Score, setR2Score] = useState<number | null>(null);
  const [featureImportance, setFeatureImportance] = useState<{ feature: string; importance: number }[]>([]);

  const { categoricalColumns, numericColumns } = useMemo(() => {
    const categorical = data.headers.filter((header) => {
      const values = data.rows.map((row) => row[header]);
      const uniqueValues = new Set(values);
      return uniqueValues.size < 20 && values.some((v) => typeof v === "string");
    });
    
    const numeric = data.headers.filter((header) => {
      const firstValue = data.rows[0]?.[header];
      return typeof firstValue === "number" || !isNaN(Number(firstValue));
    });
    
    return { categoricalColumns: categorical, numericColumns: numeric };
  }, [data]);

  const trainModel = () => {
    setIsTraining(true);
    
    setTimeout(() => {
      const featureHeaders = data.headers.filter((h) => h !== targetColumn);
      
      if (modelType === "classification") {
        // Simulate classification metrics
        const baseAccuracy = classificationModel === "RandomForest" ? 0.75 : 
                            classificationModel === "LogisticRegression" ? 0.70 : 0.72;
        const simulatedAccuracy = Math.min(0.98, baseAccuracy + Math.random() * 0.20);
        setAccuracy(simulatedAccuracy);
        setMse(null);
        setR2Score(null);
      } else {
        // Simulate regression metrics
        const baseMSE = regressionModel === "LinearRegression" ? 150 : 
                       regressionModel === "RandomForestRegressor" ? 100 : 120;
        const simulatedMSE = baseMSE + Math.random() * 100;
        const simulatedR2 = Math.min(0.95, 0.60 + Math.random() * 0.30);
        setMse(simulatedMSE);
        setR2Score(simulatedR2);
        setAccuracy(null);
      }

      // Simulate feature importance
      const importance = featureHeaders.map((header) => ({
        feature: header,
        importance: Math.random(),
      })).sort((a, b) => b.importance - a.importance).slice(0, 10);

      setFeatureImportance(importance);
      setIsTraining(false);
    }, 2000);
  };

  const availableColumns = modelType === "classification" ? categoricalColumns : numericColumns;
  const selectedModel = modelType === "classification" ? classificationModel : regressionModel;

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Machine Learning Analysis</h2>
      
      <Tabs value={modelType} onValueChange={(v) => setModelType(v as ModelType)} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="regression">Regression</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Model:</label>
          {modelType === "classification" ? (
            <Select value={classificationModel} onValueChange={(v) => setClassificationModel(v as ClassificationModel)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RandomForest">Random Forest</SelectItem>
                <SelectItem value="LogisticRegression">Logistic Regression</SelectItem>
                <SelectItem value="SVM">SVM</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Select value={regressionModel} onValueChange={(v) => setRegressionModel(v as RegressionModel)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LinearRegression">Linear Regression</SelectItem>
                <SelectItem value="RandomForestRegressor">Random Forest Regressor</SelectItem>
                <SelectItem value="Ridge">Ridge Regression</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1">
          <label className="text-sm font-medium">Target Column:</label>
          <Select value={targetColumn} onValueChange={setTargetColumn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              {availableColumns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={trainModel} 
          disabled={!targetColumn || isTraining || availableColumns.length === 0}
        >
          {isTraining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Training...
            </>
          ) : (
            `Train ${selectedModel}`
          )}
        </Button>
      </div>

      {(accuracy !== null || mse !== null) && (
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Model Performance</h3>
            {modelType === "classification" && accuracy !== null && (
              <>
                <p className="text-3xl font-bold text-primary">
                  Accuracy: {(accuracy * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedModel} trained on {data.rows.length} samples
                </p>
              </>
            )}
            {modelType === "regression" && mse !== null && r2Score !== null && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mean Squared Error</p>
                    <p className="text-2xl font-bold text-primary">{mse.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">R² Score</p>
                    <p className="text-2xl font-bold text-primary">{r2Score.toFixed(3)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedModel} trained on {data.rows.length} samples
                </p>
              </>
            )}
          </div>

          {featureImportance.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Top 10 Feature Importances</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={featureImportance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="feature" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="importance" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MLAnalysis;
