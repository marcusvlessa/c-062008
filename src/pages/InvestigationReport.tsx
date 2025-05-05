
import React, { useState } from 'react';
import { FileText, Upload, Image, FileVideo, AudioWaveform, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';

interface Evidence {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  name: string;
  preview?: string;
  content?: string;
}

const InvestigationReport = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleTextEvidenceAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const content = formData.get('textContent') as string;
    
    if (!content.trim()) {
      toast.error('O texto não pode estar vazio');
      return;
    }
    
    setEvidences([...evidences, {
      id: `text-${Date.now()}`,
      type: 'text',
      name: 'Texto de Evidência',
      content
    }]);
    
    // Reset form
    e.currentTarget.reset();
    toast.success('Texto adicionado como evidência');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const allowedTypes = {
      'image': ['image/jpeg', 'image/png', 'image/gif'],
      'video': ['video/mp4', 'video/webm', 'video/ogg'],
      'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg']
    };
    
    const file = files[0];
    if (!allowedTypes[type].includes(file.type)) {
      toast.error(`Formato de arquivo não suportado para ${type}`);
      return;
    }
    
    // Convert file to data URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidences([...evidences, {
        id: `${type}-${Date.now()}`,
        type,
        name: file.name,
        preview: reader.result as string
      }]);
      toast.success(`${type === 'image' ? 'Imagem' : type === 'video' ? 'Vídeo' : 'Áudio'} adicionado como evidência`);
    };
    reader.readAsDataURL(file);
  };

  const removeEvidence = (id: string) => {
    setEvidences(evidences.filter(ev => ev.id !== id));
    toast.success('Evidência removida');
  };

  const generateReport = () => {
    if (evidences.length === 0) {
      toast.error('Adicione pelo menos uma evidência para gerar o relatório');
      return;
    }
    
    if (!currentCase) {
      toast.error('Selecione um caso antes de gerar o relatório');
      return;
    }
    
    setIsGenerating(true);
    
    // Mock report generation
    setTimeout(() => {
      const mockReport = `# RELATÓRIO DE INVESTIGAÇÃO CRIMINAL
      
## 1. IDENTIFICAÇÃO DA INVESTIGAÇÃO
- **Caso Nº**: ${currentCase.id}
- **Título**: ${currentCase.title}
- **Data do Relatório**: ${new Date().toLocaleDateString('pt-BR')}

## 2. RESUMO DAS EVIDÊNCIAS ANALISADAS
${evidences.map((ev, idx) => `
### 2.${idx + 1}. ${ev.type === 'image' ? 'Imagem' : ev.type === 'video' ? 'Vídeo' : ev.type === 'audio' ? 'Áudio' : 'Texto'}: ${ev.name}
${ev.type === 'text' ? `Conteúdo: "${ev.content?.substring(0, 100)}${ev.content && ev.content.length > 100 ? '...' : ''}"` : 'Arquivo multimídia anexado ao caso.'}
`).join('\n')}

## 3. ANÁLISE DAS EVIDÊNCIAS
As evidências apresentadas sugerem uma conexão entre os eventos relatados na ocorrência inicial e os materiais coletados durante a investigação.

## 4. CONCLUSÕES PRELIMINARES
Com base nas evidências analisadas, é possível estabelecer uma linha de investigação que aponta para:
- Confirmação parcial dos fatos narrados na ocorrência inicial
- Identificação de novos elementos probatórios
- Necessidade de diligências complementares

## 5. RECOMENDAÇÕES
1. Realizar oitiva dos envolvidos mencionados nas evidências
2. Solicitar perícia técnica específica nos materiais audiovisuais
3. Cruzar informações com sistemas de inteligência policial

## 6. PRÓXIMOS PASSOS
- Elaboração de plano de diligências complementares
- Solicitação de mandados judiciais necessários
- Compartilhamento de informações com unidades especializadas

Relatório elaborado em ${new Date().toLocaleDateString('pt-BR')}.`;
      
      setReport(mockReport);
      setIsGenerating(false);
      
      toast.success('Relatório gerado com sucesso');
    }, 3000);
  };

  const saveReportToCase = () => {
    if (!report || !currentCase) {
      toast.error('Não há relatório para salvar ou nenhum caso selecionado');
      return;
    }
    
    // Save report to case
    saveToCurrentCase({
      timestamp: new Date().toISOString(),
      report,
      evidences: evidences.map(ev => ({
        type: ev.type,
        name: ev.name
      }))
    }, 'investigationReports');
    
    toast.success('Relatório salvo com sucesso no caso atual');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Relatório de Investigação
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Crie relatórios detalhados com base nas evidências coletadas
        </p>
      </div>

      {!currentCase ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione um caso antes de prosseguir com a criação do relatório.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Evidências</CardTitle>
                <CardDescription>
                  Adicione textos, imagens, vídeos e áudios para compor seu relatório
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="text">Texto</TabsTrigger>
                    <TabsTrigger value="image">Imagem</TabsTrigger>
                    <TabsTrigger value="video">Vídeo</TabsTrigger>
                    <TabsTrigger value="audio">Áudio</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text">
                    <form onSubmit={handleTextEvidenceAdd} className="space-y-4">
                      <Textarea 
                        name="textContent"
                        placeholder="Escreva ou cole o texto da evidência aqui..."
                        className="min-h-[200px]"
                      />
                      <Button type="submit">Adicionar Texto</Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="image">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                        <Input
                          type="file"
                          id="image-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'image')}
                        />
                        <label 
                          htmlFor="image-upload" 
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <Image className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Clique para fazer upload de uma imagem
                          </p>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="video">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                        <Input
                          type="file"
                          id="video-upload"
                          className="hidden"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e, 'video')}
                        />
                        <label 
                          htmlFor="video-upload" 
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <FileVideo className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Clique para fazer upload de um vídeo
                          </p>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audio">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                        <Input
                          type="file"
                          id="audio-upload"
                          className="hidden"
                          accept="audio/*"
                          onChange={(e) => handleFileUpload(e, 'audio')}
                        />
                        <label 
                          htmlFor="audio-upload" 
                          className="cursor-pointer flex flex-col items-center justify-center"
                        >
                          <AudioWaveform className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Clique para fazer upload de um áudio
                          </p>
                        </label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evidências Adicionadas</CardTitle>
              </CardHeader>
              <CardContent>
                {evidences.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                    <Upload className="h-10 w-10 mx-auto opacity-20 mb-2" />
                    <p>Nenhuma evidência adicionada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evidences.map((evidence) => (
                      <div 
                        key={evidence.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {evidence.type === 'image' && (
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                              {evidence.preview && <img src={evidence.preview} alt="" className="w-full h-full object-cover" />}
                            </div>
                          )}
                          
                          {evidence.type === 'video' && <FileVideo className="text-blue-500 h-5 w-5" />}
                          {evidence.type === 'audio' && <AudioWaveform className="text-green-500 h-5 w-5" />}
                          {evidence.type === 'text' && <FileText className="text-amber-500 h-5 w-5" />}
                          
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">{evidence.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{evidence.type}</p>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeEvidence(evidence.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={generateReport}
                      disabled={evidences.length === 0 || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? 'Gerando relatório...' : 'Gerar Relatório'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Relatório</span>
                  {report && (
                    <Button variant="outline" size="sm" onClick={saveReportToCase}>
                      Salvar no Caso
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Analisando evidências e gerando relatório...
                    </p>
                  </div>
                ) : report ? (
                  <Textarea
                    className="h-full min-h-[500px] font-mono"
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <FileText className="h-16 w-16 opacity-20 mb-4" />
                    <p>Adicione evidências e gere um relatório</p>
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

export default InvestigationReport;
