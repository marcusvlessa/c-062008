
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save, FileAudio, MessageSquare } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface ApiSettings {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<ApiSettings>({
    groqApiKey: '',
    groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    whisperModel: 'distil-whisper-large-v3-en',
    whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('securai-api-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('securai-api-settings', JSON.stringify(settings));
    toast.success('Configurações salvas com sucesso');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <SettingsIcon className="mr-2 h-6 w-6" /> Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configure as APIs e preferências do sistema
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <Tabs defaultValue="api-keys">
          <TabsList className="mb-6">
            <TabsTrigger value="api-keys">Chaves de API</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-keys">
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  As chaves de API são armazenadas apenas localmente no seu navegador 
                  e são necessárias para o funcionamento do sistema.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" /> GROQ LLM
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="groqApiKey" className="text-sm font-medium">
                      Chave da API GROQ
                    </label>
                    <Input
                      id="groqApiKey"
                      name="groqApiKey"
                      type="password"
                      placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.groqApiKey}
                      onChange={handleChange}
                    />
                    <p className="text-xs text-gray-500">
                      Ex: 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
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="groqApiEndpoint" className="text-sm font-medium">
                      Endpoint GROQ
                    </label>
                    <Input
                      id="groqApiEndpoint"
                      name="groqApiEndpoint"
                      placeholder="https://api.groq.com/openai/v1/chat/completions"
                      value={settings.groqApiEndpoint}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="groqModel" className="text-sm font-medium">
                      Modelo LLM
                    </label>
                    <Select 
                      value={settings.groqModel} 
                      onValueChange={(value) => handleSelectChange('groqModel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout (17B)</SelectItem>
                        <SelectItem value="mixtra-8x7b">Mixtra (8x7B)</SelectItem>
                        <SelectItem value="llama3-8b-8192">Llama 3 (8B)</SelectItem>
                        <SelectItem value="llama3-70b-8192">Llama 3 (70B)</SelectItem>
                        <SelectItem value="gemma-7b-it">Gemma (7B)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <FileAudio className="mr-2 h-5 w-5" /> GROQ Whisper (Transcrição de Áudio)
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A mesma chave de API GROQ é utilizada para o serviço de transcrição.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="whisperApiEndpoint" className="text-sm font-medium">
                      Endpoint Whisper
                    </label>
                    <Input
                      id="whisperApiEndpoint"
                      name="whisperApiEndpoint"
                      placeholder="https://api.groq.com/openai/v1/audio/transcriptions"
                      value={settings.whisperApiEndpoint}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="whisperModel" className="text-sm font-medium">
                      Modelo de Transcrição
                    </label>
                    <Select 
                      value={settings.whisperModel} 
                      onValueChange={(value) => handleSelectChange('whisperModel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distil-whisper-large-v3-en">Distil Whisper Large V3 (EN)</SelectItem>
                        <SelectItem value="distil-whisper-large-v3">Distil Whisper Large V3 (Multilingual)</SelectItem>
                        <SelectItem value="whisper-large-v3">Whisper Large V3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={saveSettings} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" /> Salvar Configurações
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                <h3 className="text-lg font-medium mb-2">Informações do Sistema</h3>
                <div className="space-y-1">
                  <p className="text-sm">Versão: 1.0.0</p>
                  <p className="text-sm">Modo de execução: Local</p>
                  <p className="text-sm">Armazenamento: LocalStorage</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">Notas importantes</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                  <li>O sistema está rodando localmente e os dados são armazenados no navegador</li>
                  <li>Fazer backup dos casos periodicamente é recomendado</li>
                  <li>As chaves de API são armazenadas apenas localmente</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
