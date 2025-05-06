import React, { useState, useEffect } from 'react';
import { Upload, AudioWaveform, Mic, FileText, AlertCircle, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';
import { transcribeAudioWithGroq, makeGroqAIRequest } from '../services/groqService';
import { saveAudioTranscription, getAudioTranscriptionsByCaseId } from '../services/databaseService';

interface AudioFile {
  id: string;
  name: string;
  url: string;
  file: File;
  transcription?: string;
}

const AudioAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);

  // Check for existing transcriptions in the database when case changes
  useEffect(() => {
    if (currentCase) {
      checkForExistingTranscriptions();
    }
  }, [currentCase]);

  const checkForExistingTranscriptions = async () => {
    if (!currentCase) return;
    
    try {
      setIsCheckingDb(true);
      const transcriptions = await getAudioTranscriptionsByCaseId(currentCase.id);
      setIsCheckingDb(false);
      
      if (transcriptions.length > 0) {
        toast.info(`${transcriptions.length} transcrições encontradas no banco de dados para este caso`);
      }
    } catch (error) {
      console.error('Error checking for existing transcriptions:', error);
      setIsCheckingDb(false);
    }
  };

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
      url: audioUrl,
      file: file
    };
    
    setAudioFiles([...audioFiles, newAudio]);
    toast.success(`Áudio "${file.name}" adicionado com sucesso`);
  };

  const handleTranscribe = async (audio: AudioFile) => {
    setSelectedAudio(audio);
    setIsTranscribing(true);
    
    try {
      // Check if we already have this audio transcribed in the database
      if (currentCase) {
        const transcriptions = await getAudioTranscriptionsByCaseId(currentCase.id);
        const existingTranscription = transcriptions.find(t => t.filename === audio.name);
        
        if (existingTranscription) {
          // Use existing transcription from DB
          const updatedAudioFiles = audioFiles.map(a => 
            a.id === audio.id ? { ...a, transcription: existingTranscription.transcription } : a
          );
          
          setAudioFiles(updatedAudioFiles);
          setSelectedAudio({ ...audio, transcription: existingTranscription.transcription });
          toast.success('Transcrição recuperada do banco de dados');
          setIsTranscribing(false);
          return;
        }
      }
      
      console.log('Transcribing audio file:', audio.name);
      // Call GROQ Whisper API
      const transcription = await transcribeAudioWithGroq(audio.file);
      console.log('Transcription completed successfully');
      
      // Update the audio file with transcription
      const updatedAudioFiles = audioFiles.map(a => 
        a.id === audio.id ? { ...a, transcription } : a
      );
      
      setAudioFiles(updatedAudioFiles);
      setSelectedAudio({ ...audio, transcription });
      
      // Save to database if we have a case
      if (currentCase) {
        await saveAudioTranscription({
          caseId: currentCase.id,
          filename: audio.name,
          transcription,
          dateProcessed: new Date().toISOString()
        });
      }
      
      toast.success('Transcrição concluída com sucesso');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Erro ao transcrever áudio');
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateReport = async () => {
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
    
    try {
      // Use GROQ API to generate report
      const allTranscriptions = audiosWithTranscription
        .map(a => `## Arquivo: ${a.name}\n\n${a.transcription}`)
        .join('\n\n');
      
      const messages = [
        {
          role: "system",
          content: 
            "Você é um assistente especializado em análise de gravações de áudio. " +
            "Sua função é analisar transcrições de áudios e gerar um relatório detalhado. " +
            "O relatório deve incluir: 1) Informações gerais; 2) Arquivos analisados; " +
            "3) Identificação de interlocutores; 4) Transcrição consolidada; " +
            "5) Pontos de interesse; 6) Conclusões e recomendações. " +
            "Use formato Markdown para estruturar sua resposta."
        },
        {
          role: "user",
          content: `Caso: ${currentCase.title}\n\nAnalise as seguintes transcrições de áudio e gere um relatório detalhado:\n\n${allTranscriptions}`
        }
      ];
      
      console.log('Generating report based on audio transcriptions');
      const generatedReport = await makeGroqAIRequest(messages, 2048);
      setReport(generatedReport);
      
      // Save to case
      saveToCurrentCase({
        timestamp: new Date().toISOString(),
        audioFiles: audioFiles.map(a => ({
          name: a.name,
          hasTranscription: !!a.transcription
        })),
        report: generatedReport
      }, 'audioAnalysis');
      
      toast.success('Relatório gerado com sucesso');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <AudioWaveform className="mr-2 h-6 w-6" /> Análise de Áudio
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
                <CardDescription className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Database className="h-4 w-4" />
                  As transcrições são processadas e salvas no banco de dados local
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
                      {isGenerating ? 'Gerando relatório com IA...' : 'Gerar Relatório Consolidado'}
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
                      Transcrevendo áudio com Whisper via GROQ...
                    </p>
                  </div>
                ) : isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Analisando transcrições e gerando relatório com IA...
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
