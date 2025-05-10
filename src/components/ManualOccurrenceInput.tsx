
import React, { useState, useEffect } from 'react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { toast } from 'sonner';
import { Clipboard, Pencil, Send, AlertTriangle } from 'lucide-react';
import { makeGroqAIRequest, getGroqSettings } from '../services/groqService';
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
  const [activeTab, setActiveTab] = useState<string>('manual');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Check if API key is configured on component mount
  useEffect(() => {
    const settings = getGroqSettings();
    setHasApiKey(!!settings.groqApiKey);
  }, []);

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
      
      console.log('Sending manual text for AI analysis, API key available:', hasApiKey);
      
      // Force using the actual API if we have an API key
      const settings = getGroqSettings();
      if (!settings.groqApiKey) {
        console.warn('No GROQ API key configured, will use mock response');
        throw new Error('API key not configured');
      }
      
      // Call the AI service with a longer token limit for detailed analysis
      const aiAnalysis = await makeGroqAIRequest(messages, 4096);
      
      console.log('Analysis completed successfully');
      
      // Pass analysis back to parent component
      onAnalysisComplete(aiAnalysis);
      
      toast.success('Análise concluída com sucesso');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Erro ao realizar análise: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
      
      // Provide a fallback analysis message
      const fallbackAnalysis = `
# Análise do Boletim de Ocorrência (FALLBACK)

**Nota: Ocorreu um erro ao processar a análise completa. Este é um relatório simplificado.**

## Resumo do Incidente
Não foi possível processar o conteúdo do boletim de ocorrência devido a um erro técnico.

## Recomendações
- Verifique se a chave da API GROQ está configurada corretamente
- Tente novamente mais tarde
- Se o problema persistir, entre em contato com o suporte

*Este é um relatório de fallback gerado automaticamente quando ocorre um erro de processamento.*
`;
      
      onAnalysisComplete(fallbackAnalysis);
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
            {!hasApiKey && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Chave da API GROQ não configurada. Por favor, configure sua chave na aba de Configurações.
                  </p>
                </div>
              </div>
            )}
            {hasApiKey && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-green-800 dark:text-green-200">
                  Chave da API GROQ configurada. A análise será processada usando a API GROQ.
                </p>
              </div>
            )}
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
