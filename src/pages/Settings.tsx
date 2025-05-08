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
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Loaded API settings:', { 
          ...parsedSettings, 
          groqApiKey: parsedSettings.groqApiKey ? '****' : 'Not set' 
        });
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
        toast.error('Erro ao carregar configurações salvas');
      }
    } else {
      console.log('No saved settings found, using defaults');
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
    try {
      localStorage.setItem('securai-api-settings', JSON.stringify(settings));
      console.log('Settings saved successfully:', { 
        ...settings, 
        groqApiKey: settings.groqApiKey ? '****' : 'Not set' 
      });
      toast.success('Configurações salvas com sucesso');
      
      // Clear application data to force fresh API calls with new settings
      if (window.confirm('Deseja limpar os dados em cache para usar as novas configurações?')) {
        // Clear specific localStorage items except settings and case data
        const keysToKeep = [
          'securai-api-settings',
          'securai-cases',
          'securai-current-case'
        ];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !keysToKeep.includes(key) && key.startsWith('securai-')) {
            localStorage.removeItem(key);
          }
        }
        
        toast.info('Cache limpo. As próximas operações usarão as novas configurações.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const clearApiKey = () => {
    if (window.confirm('Tem certeza que deseja remover a chave de API? O sistema usará dados de demonstração.')) {
      setSettings(prev => ({ ...prev, groqApiKey: '' }));
      toast.info('Chave de API removida. O sistema agora usará dados de demonstração.');
    }
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
                
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Dica:</strong> Se você não tiver uma chave de API, o sistema funcionará em modo de demonstração com dados simulados.
                  </p>
                </div>
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
                    <div className="flex gap-2">
                      <Input
                        id="groqApiKey"
                        name="groqApiKey"
                        type="password"
                        placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                        value={settings.groqApiKey}
                        onChange={handleChange}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearApiKey}
                        className="whitespace-nowrap"
                      >
                        Remover Chave
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Ex: 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
                    </p>
                    {!settings.groqApiKey && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Sem chave configurada. O sistema usará dados de demonstração.
                      </p>
                    )}
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
                  <p className="text-sm">Modo de execução: {settings.groqApiKey ? 'API Externa' : 'Demonstração (Mock)'}</p>
                  <p className="text-sm">Armazenamento: LocalStorage</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">Notas importantes</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-yellow-800 dark:text-yellow-200">
                  <li>O sistema está rodando localmente e os dados são armazenados no navegador</li>
                  <li>Fazer backup dos casos periodicamente é recomendado</li>
                  <li>As chaves de API são armazenadas apenas localmente</li>
                  <li>Se não configurar uma chave de API, o sistema funcionará em modo de demonstração</li>
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
