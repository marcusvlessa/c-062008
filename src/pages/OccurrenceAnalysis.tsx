
import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';

const OccurrenceAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      if (!['application/pdf', 'text/html'].includes(selectedFile.type)) {
        toast.error('Por favor, selecione um arquivo PDF ou HTML');
        return;
      }
      
      setFile(selectedFile);
      
      // For demonstration, we'll just show the file name
      // In a real implementation, you would parse the PDF/HTML content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // In a real app, you would parse PDF/HTML here
        setFileContent(`Conteúdo carregado do arquivo: ${selectedFile.name}`);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }

    if (!currentCase) {
      toast.error('Por favor, selecione um caso antes de prosseguir');
      return;
    }

    setIsLoading(true);

    // Simulate API call to LLM
    setTimeout(() => {
      // Mock analysis result
      const mockAnalysis = 
        `# Análise de Ocorrência\n\n` +
        `## Resumo do Incidente\n` +
        `Ocorrência registrada em 05/05/2023 relacionada a possível furto de veículo na região central.\n\n` +
        `## Sugestões para Investigação\n` +
        `1. Solicitar imagens de câmeras de segurança do local\n` +
        `2. Verificar histórico de ocorrências similares na região\n` +
        `3. Realizar oitiva com testemunhas mencionadas no B.O.\n\n` +
        `## Despacho Sugerido\n` +
        `Determino que seja realizada diligência para coleta de imagens de vigilância no local dos fatos, bem como contato com testemunhas para esclarecimentos adicionais.`;
        
      setAnalysis(mockAnalysis);
      
      // Save to case
      saveToCurrentCase({
        timestamp: new Date().toISOString(),
        filename: file.name,
        analysis: mockAnalysis
      }, 'occurrenceAnalysis');
      
      setIsLoading(false);
      toast.success('Análise concluída com sucesso');
    }, 2000);
  };

  const saveAnalysis = () => {
    if (!analysis || !currentCase) {
      toast.error('Não há análise para salvar ou nenhum caso selecionado');
      return;
    }

    // Save analysis to case
    saveToCurrentCase({
      timestamp: new Date().toISOString(),
      filename: file?.name || 'Análise manual',
      analysis: analysis
    }, 'occurrenceAnalysis');
    
    toast.success('Análise salva com sucesso no caso atual');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Análise de Ocorrência
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Faça upload de documentos de ocorrências para análise automática e sugestões
        </p>
      </div>

      {!currentCase ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione um caso antes de prosseguir com a análise de ocorrência.
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
                  <Upload className="h-5 w-5" /> Upload de Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.html"
                      onChange={handleFileChange}
                    />
                    <label 
                      htmlFor="file-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <FileText className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arraste um arquivo PDF ou HTML aqui ou clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Tamanho máximo: 10MB
                      </p>
                    </label>
                  </div>

                  {file && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="text-green-800 dark:text-green-300 text-sm">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyzeClick}
                    disabled={!file || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Analisando...' : 'Analisar Ocorrência'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {fileContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Documento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{fileContent}</pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Análise e Sugestões</span>
                  {analysis && (
                    <Button variant="outline" size="sm" onClick={saveAnalysis}>
                      Salvar no Caso
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Processando documentos e gerando análise...
                    </p>
                  </div>
                ) : analysis ? (
                  <Textarea
                    className="min-h-[400px] font-mono"
                    value={analysis}
                    onChange={(e) => setAnalysis(e.target.value)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                    <FileText className="h-16 w-16 opacity-20 mb-4" />
                    <p>Faça upload de um documento para gerar análise e sugestões</p>
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

export default OccurrenceAnalysis;
