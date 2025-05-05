
import React, { useState } from 'react';
import { Upload, FileText, Database, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';

const LinkAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [file, setFile] = useState<File | null>(null);
  const [graphImage, setGraphImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
    
    // Use a placeholder visualization image for demo
    setTimeout(() => {
      // In a real implementation, this would generate a network graph based on the data
      setGraphImage('/lovable-uploads/0c6db754-b805-46e5-a4b8-319a9d8fef71.png'); // Using the uploaded placeholder image
      setIsProcessing(false);
      
      // Save to case
      saveToCurrentCase({
        timestamp: new Date().toISOString(),
        filename: file.name,
        graphImageUrl: '/lovable-uploads/0c6db754-b805-46e5-a4b8-319a9d8fef71.png'
      }, 'linkAnalysis');
      
      toast.success('Análise de vínculos processada com sucesso');
    }, 3000);
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
                        O arquivo deve conter dados relacionados para análise de vínculos
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
                          <p className="text-xs">Entidades: <span className="font-semibold">24</span></p>
                          <p className="text-xs">Conexões: <span className="font-semibold">37</span></p>
                          <p className="text-xs">Grau Médio: <span className="font-semibold">3.1</span></p>
                          <p className="text-xs">Centralidade: <span className="font-semibold">0.42</span></p>
                        </div>
                      </div>
                      <Button size="sm">Salvar Imagem</Button>
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
