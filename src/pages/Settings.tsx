
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Save } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface ApiSettings {
  groqApiKey: string;
  groqApiEndpoint: string;
  whisperApiKey: string;
  whisperApiEndpoint: string;
}

const Settings = () => {
  const [settings, setSettings] = useState<ApiSettings>({
    groqApiKey: '',
    groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    whisperApiKey: '',
    whisperApiEndpoint: 'https://api.openai.com/v1/audio/transcriptions',
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
                  <Key className="mr-2 h-5 w-5" /> GROQ LLM
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Key className="mr-2 h-5 w-5" /> Whisper (Transcrição de Áudio)
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="whisperApiKey" className="text-sm font-medium">
                      Chave da API Whisper
                    </label>
                    <Input
                      id="whisperApiKey"
                      name="whisperApiKey"
                      type="password"
                      placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={settings.whisperApiKey}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="whisperApiEndpoint" className="text-sm font-medium">
                      Endpoint Whisper
                    </label>
                    <Input
                      id="whisperApiEndpoint"
                      name="whisperApiEndpoint"
                      placeholder="https://api.openai.com/v1/audio/transcriptions"
                      value={settings.whisperApiEndpoint}
                      onChange={handleChange}
                    />
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
