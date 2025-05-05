
import React, { useState } from 'react';
import { Upload, AudioWaveform, Mic, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  transcription?: string;
}

const AudioAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('audio/')) {
      toast.error('Por favor, selecione um arquivo de áudio');
      return;
    }
    
    // Create object URL for the audio file
    const audioUrl = URL.createObjectURL(file);
    
    const newAudio: AudioFile = {
      id: `audio-${Date.now()}`,
      name: file.name,
      url: audioUrl
    };
    
    setAudioFiles([...audioFiles, newAudio]);
    toast.success(`Áudio "${file.name}" adicionado com sucesso`);
  };

  const handleTranscribe = (audio: AudioFile) => {
    setSelectedAudio(audio);
    setIsTranscribing(true);
    
    // Check for API key
    const settings = localStorage.getItem('securai-api-settings');
    if (!settings) {
      toast.error('Chave de API não configurada. Configure nas Configurações.');
      setIsTranscribing(false);
      return;
    }
    
    // In a real implementation, we would send the audio to Whisper API
    // For now, we'll simulate a transcription after a delay
    setTimeout(() => {
      const mockTranscription = `[00:00:05] Interlocutor 1: Olá, estamos gravando esse áudio para teste do sistema de transcrição.

[00:00:12] Interlocutor 2: Entendido. Vamos simular uma conversa para ver se o sistema consegue identificar os diferentes interlocutores.

[00:00:20] Interlocutor 1: Exatamente. O sistema deve ser capaz de separar automaticamente as falas e atribuir a diferentes pessoas.

[00:00:31] Interlocutor 2: E também deve registrar o tempo de cada fala, para facilitar a localização posteriormente na gravação original.

[00:00:40] Interlocutor 3: Eu sou um terceiro interlocutor entrando na conversa para testar se o sistema consegue identificar mais de duas pessoas.

[00:00:52] Interlocutor 1: Perfeito, isso ajudará bastante nas investigações que envolvem múltiplos suspeitos ou testemunhas.`;
      
      // Update the audio file with transcription
      const updatedAudioFiles = audioFiles.map(a => 
        a.id === audio.id ? { ...a, transcription: mockTranscription } : a
      );
      
      setAudioFiles(updatedAudioFiles);
      setSelectedAudio({ ...audio, transcription: mockTranscription });
      setIsTranscribing(false);
      
      toast.success('Transcrição concluída com sucesso');
    }, 3000);
  };

  const generateReport = () => {
    const audiosWithTranscription = audioFiles.filter(a => a.transcription);
    
    if (audiosWithTranscription.length === 0) {
      toast.error('Não há transcrições disponíveis para gerar o relatório');
      return;
    }
    
    if (!currentCase) {
      toast.error('Selecione um caso antes de gerar o relatório');
      return;
    }
    
    setIsGenerating(true);
    
    // Mock report generation
    setTimeout(() => {
      const mockReport = `# RELATÓRIO DE ANÁLISE DE ÁUDIO
      
## 1. INFORMAÇÕES GERAIS
- **Caso Nº**: ${currentCase.id}
- **Título**: ${currentCase.title}
- **Data do Relatório**: ${new Date().toLocaleDateString('pt-BR')}
- **Quantidade de Áudios**: ${audiosWithTranscription.length}

## 2. ARQUIVOS ANALISADOS
${audiosWithTranscription.map((audio, idx) => `
### 2.${idx + 1}. ${audio.name}
- **Duração estimada**: ${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} minutos
- **Formato**: ${audio.name.split('.').pop()?.toUpperCase() || 'MP3'}
- **Qualidade da gravação**: ${['Excelente', 'Boa', 'Razoável'][Math.floor(Math.random() * 3)]}
`).join('\n')}

## 3. IDENTIFICAÇÃO DE INTERLOCUTORES
Foram identificados **3 interlocutores** distintos nas gravações analisadas:
- **Interlocutor 1**: Voz masculina, tom grave, fala pausada
- **Interlocutor 2**: Voz masculina, tom médio, fala rápida
- **Interlocutor 3**: Voz feminina, tom agudo, fala articulada

## 4. TRANSCRIÇÃO CONSOLIDADA
${audiosWithTranscription.map(audio => audio.transcription).join('\n\n')}

## 5. PONTOS DE INTERESSE NA CONVERSA
1. [00:00:20] - Menção a "sistema" - potencial referência a esquema organizacional
2. [00:00:52] - Referência a "investigações" e "múltiplos suspeitos"

## 6. CONCLUSÕES E RECOMENDAÇÕES
- Realizar a oitiva dos interlocutores identificados
- Confrontar as informações obtidas com outras evidências do caso
- Aprofundar investigação sobre os pontos de interesse identificados

Relatório elaborado em ${new Date().toLocaleDateString('pt-BR')}.`;
      
      setReport(mockReport);
      setIsGenerating(false);
      
      toast.success('Relatório gerado com sucesso');
    }, 3000);
  };

  const saveToCase = () => {
    if (!report || !currentCase) {
      toast.error('Não há relatório para salvar ou nenhum caso selecionado');
      return;
    }
    
    // Save report to case
    saveToCurrentCase({
      timestamp: new Date().toISOString(),
      audioFiles: audioFiles.map(a => ({
        name: a.name,
        hasTranscription: !!a.transcription
      })),
      report
    }, 'audioAnalysis');
    
    toast.success('Análise de áudio salva com sucesso no caso atual');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Análise de Áudio
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Transcreva e analise áudios para criar relatórios detalhados
        </p>
      </div>

      {!currentCase ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione um caso antes de prosseguir com a análise de áudio.
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
                  <Upload className="h-5 w-5" /> Upload de Áudio
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos de áudio para transcrição e análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      id="audio-upload"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                    />
                    <label 
                      htmlFor="audio-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <Mic className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arraste arquivos de áudio aqui ou clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Formatos suportados: MP3, WAV, OGG, etc.
                      </p>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Áudios</CardTitle>
              </CardHeader>
              <CardContent>
                {audioFiles.length === 0 ? (
                  <div className="text-center p-6 text-gray-500 dark:text-gray-400">
                    <AudioWaveform className="h-10 w-10 mx-auto opacity-20 mb-2" />
                    <p>Nenhum áudio adicionado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audioFiles.map((audio) => (
                      <div 
                        key={audio.id} 
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedAudio?.id === audio.id
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">{audio.name}</h4>
                          {audio.transcription && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                              Transcrito
                            </span>
                          )}
                        </div>
                        
                        <audio src={audio.url} controls className="w-full h-8 mb-3" />
                        
                        <div className="flex justify-end">
                          <Button
                            variant={audio.transcription ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleTranscribe(audio)}
                            disabled={isTranscribing}
                          >
                            {audio.transcription ? 'Transcrever Novamente' : 'Transcrever'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      onClick={generateReport} 
                      disabled={!audioFiles.some(a => a.transcription) || isGenerating}
                      className="w-full mt-4"
                    >
                      {isGenerating ? 'Gerando relatório...' : 'Gerar Relatório Consolidado'}
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
                  <span>{selectedAudio ? 'Transcrição' : 'Relatório de Áudio'}</span>
                  {report && !selectedAudio && (
                    <Button variant="outline" size="sm" onClick={saveToCase}>
                      Salvar no Caso
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {isTranscribing ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Transcrevendo áudio com Whisper...
                    </p>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Analisando transcrições e gerando relatório...
                    </p>
                  </div>
                ) : selectedAudio && selectedAudio.transcription ? (
                  <div className="h-full flex flex-col">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 flex-1 overflow-auto">
                      <pre className="whitespace-pre-wrap text-sm">{selectedAudio.transcription}</pre>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedAudio(null)}
                      >
                        Voltar para o Relatório
                      </Button>
                    </div>
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
                    <p className="text-center">
                      Faça upload de áudios, transcreva-os e gere um relatório consolidado
                    </p>
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

export default AudioAnalysis;
