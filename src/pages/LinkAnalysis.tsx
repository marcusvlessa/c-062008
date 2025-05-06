
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Database, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';

interface NetworkNode {
  id: string;
  label: string;
  group: string;
  size: number;
}

interface NetworkLink {
  source: string;
  target: string;
  value: number;
  type: string;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

const LinkAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [file, setFile] = useState<File | null>(null);
  const [graphImage, setGraphImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  
  useEffect(() => {
    if (networkData && canvasRef) {
      drawNetworkGraph(networkData, canvasRef);
    }
  }, [networkData, canvasRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileName = file.name.toLowerCase();
    
    if (!(fileName.endsWith('.csv') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx'))) {
      toast.error('Formato de arquivo não suportado. Por favor, selecione CSV, XLS ou XLSX.');
      return;
    }
    
    setFile(file);
    toast.success(`Arquivo "${file.name}" carregado com sucesso`);
  };

  const processData = () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }
    
    if (!currentCase) {
      toast.error('Por favor, selecione um caso antes de prosseguir');
      return;
    }
    
    setIsProcessing(true);
    
    // In a real implementation, we would parse the CSV/Excel file
    // For now, we'll generate mock network data
    setTimeout(() => {
      // Generate mock network data
      const mockNetworkData: NetworkData = {
        nodes: [
          { id: "1", label: "João Silva", group: "suspect", size: 10 },
          { id: "2", label: "Ana Souza", group: "victim", size: 8 },
          { id: "3", label: "Carlos Pereira", group: "suspect", size: 12 },
          { id: "4", label: "Empresa ABC", group: "location", size: 15 },
          { id: "5", label: "Maria Oliveira", group: "witness", size: 7 },
          { id: "6", label: "Pedro Santos", group: "witness", size: 7 },
          { id: "7", label: "Banco XYZ", group: "location", size: 14 },
          { id: "8", label: "Roberto Alves", group: "suspect", size: 9 },
          { id: "9", label: "Telefone +5511999999999", group: "evidence", size: 6 },
          { id: "10", label: "Telefone +5511888888888", group: "evidence", size: 6 },
          { id: "11", label: "Carro Placa ABC-1234", group: "evidence", size: 8 },
          { id: "12", label: "Endereço: Av. Principal, 123", group: "location", size: 10 }
        ],
        links: [
          { source: "1", target: "3", value: 5, type: "associate" },
          { source: "1", target: "9", value: 8, type: "owns" },
          { source: "1", target: "11", value: 7, type: "owns" },
          { source: "1", target: "4", value: 9, type: "works_at" },
          { source: "2", target: "7", value: 6, type: "client" },
          { source: "3", target: "10", value: 8, type: "owns" },
          { source: "3", target: "12", value: 10, type: "lives_at" },
          { source: "3", target: "8", value: 4, type: "associate" },
          { source: "4", target: "7", value: 12, type: "transaction" },
          { source: "5", target: "2", value: 3, type: "knows" },
          { source: "6", target: "2", value: 3, type: "knows" },
          { source: "6", target: "5", value: 2, type: "knows" },
          { source: "8", target: "12", value: 7, type: "visits" }
        ]
      };

      setNetworkData(mockNetworkData);
      
      // Generate a static image for visualization
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      setCanvasRef(canvas);
      
      drawNetworkGraph(mockNetworkData, canvas);
      
      // Convert canvas to data URL for display
      const dataUrl = canvas.toDataURL('image/png');
      setGraphImage(dataUrl);
      
      setIsProcessing(false);
      
      // Save to case
      saveToCurrentCase({
        timestamp: new Date().toISOString(),
        filename: file.name,
        graphImageUrl: dataUrl
      }, 'linkAnalysis');
      
      toast.success('Análise de vínculos processada com sucesso');
    }, 3000);
  };

  const drawNetworkGraph = (data: NetworkData, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fafc'; // Light background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw title
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('Análise de Vínculos', canvas.width/2, 30);
    
    // Set up graph parameters
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    
    // Create positions for nodes in a circle layout
    const nodePositions: {[key: string]: {x: number, y: number}} = {};
    data.nodes.forEach((node, i) => {
      const angle = (i / data.nodes.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      nodePositions[node.id] = { x, y };
    });
    
    // Draw links
    ctx.lineWidth = 1;
    data.links.forEach(link => {
      const sourcePos = nodePositions[link.source];
      const targetPos = nodePositions[link.target];
      
      // Determine link color based on type
      switch (link.type) {
        case 'associate':
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'; // Red
          break;
        case 'owns':
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Blue
          break;
        case 'works_at':
        case 'lives_at':
        case 'visits':
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'; // Green
          break;
        case 'knows':
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)'; // Yellow
          break;
        case 'client':
        case 'transaction':
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'; // Purple
          break;
        default:
          ctx.strokeStyle = 'rgba(75, 85, 99, 0.6)'; // Gray
      }
      
      // Draw line with width based on value
      ctx.lineWidth = Math.max(1, Math.min(5, link.value / 3));
      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
      ctx.stroke();
      
      // Draw link label
      ctx.font = '9px Arial';
      ctx.fillStyle = '#64748b';
      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;
      ctx.fillText(link.type, midX, midY);
    });
    
    // Draw nodes
    data.nodes.forEach(node => {
      const pos = nodePositions[node.id];
      
      // Determine node color based on group
      switch (node.group) {
        case 'suspect':
          ctx.fillStyle = '#ef4444'; // Red
          break;
        case 'victim':
          ctx.fillStyle = '#3b82f6'; // Blue
          break;
        case 'witness':
          ctx.fillStyle = '#10b981'; // Green
          break;
        case 'location':
          ctx.fillStyle = '#f59e0b'; // Yellow
          break;
        case 'evidence':
          ctx.fillStyle = '#8b5cf6'; // Purple
          break;
        default:
          ctx.fillStyle = '#64748b'; // Gray
      }
      
      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, Math.max(5, Math.min(15, node.size)), 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw node label
      ctx.font = 'bold 10px Arial';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, pos.x, pos.y + node.size + 10);
    });
    
    // Draw legend
    const legendX = 20;
    let legendY = 60;
    const types = ['suspect', 'victim', 'witness', 'location', 'evidence'];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const legends = ['Suspeito', 'Vítima', 'Testemunha', 'Local', 'Evidência'];
    
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';
    ctx.fillText('Legenda:', legendX, legendY - 20);
    
    types.forEach((type, i) => {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(legendX + 7, legendY, 7, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#1e293b';
      ctx.font = '11px Arial';
      ctx.fillText(legends[i], legendX + 20, legendY + 4);
      
      legendY += 20;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Análise de Vínculo
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Identifique conexões e relações a partir de dados tabulares
        </p>
      </div>

      {!currentCase ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione um caso antes de prosseguir com a análise de vínculo.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Upload de Dados
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos CSV, XLS ou XLSX contendo os dados para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      id="data-upload"
                      className="hidden"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileUpload}
                    />
                    <label 
                      htmlFor="data-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Database className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arraste um arquivo CSV, XLS ou XLSX aqui ou clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        O arquivo deve conter dados relacionais para análise de vínculos
                      </p>
                    </label>
                  </div>

                  {file && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <p className="text-green-800 dark:text-green-300 text-sm">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={processData}
                    disabled={!file || isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? 'Processando...' : 'Processar Dados'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                      1
                    </div>
                    <p>
                      Faça upload de um arquivo CSV, XLS ou XLSX contendo dados tabulares com informações relacionais.
                      O sistema espera colunas identificando entidades e suas relações.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                      2
                    </div>
                    <p>
                      O sistema processará os dados para identificar conexões, calculando proximidade por grau (conexões diretas)
                      e proximidade por frequência (número de interações).
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0">
                      3
                    </div>
                    <p>
                      Um grafo de vínculos será gerado visualmente, mostrando as entidades como nós e suas relações como conexões.
                      O tamanho e cor dos nós e conexões representam sua importância na rede.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" /> Visualização de Vínculos
                </CardTitle>
                <CardDescription>
                  Gráfico de relacionamentos entre entidades encontradas nos dados
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Processando dados e gerando visualização de vínculos...
                    </p>
                  </div>
                ) : graphImage ? (
                  <div className="h-full flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md flex-1 overflow-auto">
                      <img 
                        src={graphImage} 
                        alt="Gráfico de vínculos" 
                        className="max-w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Estatísticas dos Vínculos</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2">
                          <p className="text-xs">Entidades: <span className="font-semibold">12</span></p>
                          <p className="text-xs">Conexões: <span className="font-semibold">13</span></p>
                          <p className="text-xs">Grau Médio: <span className="font-semibold">2.2</span></p>
                          <p className="text-xs">Centralidade: <span className="font-semibold">0.38</span></p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => {
                          if (graphImage) {
                            const link = document.createElement('a');
                            link.download = 'analise-vinculos.png';
                            link.href = graphImage;
                            link.click();
                          }
                        }}
                      >
                        Salvar Imagem
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <LinkIcon className="h-16 w-16 opacity-20 mb-4" />
                    <p>Faça upload e processe um arquivo para visualizar os vínculos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkAnalysis;
