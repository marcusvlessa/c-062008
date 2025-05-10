
import React, { useState } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { toast } from 'sonner';
import { Clipboard, Pencil, Send } from 'lucide-react';
import { makeGroqAIRequest } from '../services/groqService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ManualOccurrenceInputProps {
  onAnalysisComplete: (analysis: string) => void;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
}

const ManualOccurrenceInput = ({ 
  onAnalysisComplete, 
  isProcessing, 
  setIsProcessing 
}: ManualOccurrenceInputProps) => {
  const [manualText, setManualText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('upload');

  const handleAnalyzeManualText = async () => {
    if (!manualText.trim()) {
      toast.error('Por favor, insira o texto da ocorrência primeiro');
      return;
    }

    setIsProcessing(true);
    console.log('Starting analysis for manual text input');
    
    try {
      // Define GROQ API messages for analysis
      const messages = [
        {
          role: "system",
          content: 
            "Você é um assistente especializado em análise de boletins de ocorrência policiais. " +
            "Sua função é analisar o conteúdo de documentos de ocorrência e gerar um relatório " +
            "estruturado com: 1) Resumo do Incidente; 2) Dados da Vítima; 3) Dados do Suspeito; " +
            "4) Descrição Detalhada dos Fatos; 5) Sugestões para Investigação; 6) Despacho Sugerido. " +
            "7) Pontos de Atenção; 8) Detecção de possíveis contradições/inconsistências. " +
            "9) Classificação penal sugerida. 10) Correções necessárias no documento. " +
            "Use formato Markdown para estruturar sua resposta. " +
            "É fundamental criar um relatório detalhado, extraindo todas as informações úteis do documento " +
            "e evitando respostas genéricas. Foque em aspectos específicos do caso analisado."
        },
        {
          role: "user",
          content: `Analise o seguinte conteúdo de um boletim de ocorrência:\n\n${manualText}\n\nGere um relatório de análise completo, detalhado e específico para este caso. Inclua correções necessárias no documento se houver erros, imprecisões ou omissões importantes.`
        }
      ];
      
      console.log('Sending manual text for AI analysis');
      
      // Call the AI service
      const aiAnalysis = await makeGroqAIRequest(messages, 2048);
      
      console.log('Analysis completed successfully');
      
      // Pass analysis back to parent component
      onAnalysisComplete(aiAnalysis);
      
      toast.success('Análise concluída com sucesso');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Erro ao realizar análise: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setManualText(clipboardText);
      toast.success('Texto colado da área de transferência');
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      toast.error('Não foi possível acessar a área de transferência');
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5" /> Análise de Ocorrência
        </CardTitle>
        <CardDescription>
          Faça upload de um arquivo PDF ou digite/cole o texto da ocorrência para análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload de Arquivo</TabsTrigger>
            <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="flex justify-end mb-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePaste}
                className="flex items-center gap-1"
              >
                <Clipboard className="h-4 w-4" />
                <span>Colar da Área de Transferência</span>
              </Button>
            </div>
            <Textarea
              placeholder="Digite ou cole o texto da ocorrência aqui..."
              className="min-h-[200px] font-mono text-sm"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
            <Button
              onClick={handleAnalyzeManualText}
              disabled={!manualText.trim() || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Analisando com IA...' : 
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span>Analisar Texto</span>
                </div>
              }
            </Button>
          </TabsContent>
          
          <TabsContent value="upload">
            {/* Este conteúdo será gerenciado pelo componente principal */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ManualOccurrenceInput;
