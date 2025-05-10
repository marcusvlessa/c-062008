
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle, Check, Key, Robot, Settings as SettingsIcon, Shield } from 'lucide-react';
import { getApiSettings, saveApiSettings } from '../services/groqService';

interface ApiForm {
  groqApiKey: string;
  groqApiEndpoint: string;
  groqModel: string;
  whisperModel: string;
  whisperApiEndpoint: string;
  language: string;
}

const Settings = () => {
  const [apiForm, setApiForm] = useState<ApiForm>({
    groqApiKey: '',
    groqApiEndpoint: 'https://api.groq.com/openai/v1/chat/completions',
    groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    whisperModel: 'distil-whisper-large-v3',
    whisperApiEndpoint: 'https://api.groq.com/openai/v1/audio/transcriptions',
    language: 'pt'
  });
  
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showGroqKey, setShowGroqKey] = useState<boolean>(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    checkDarkMode();
  }, []);

  // Check if dark mode is enabled
  const checkDarkMode = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);
  };

  // Toggle dark mode
  const handleDarkModeToggle = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
    toast.success(`Modo ${!darkMode ? 'escuro' : 'claro'} ativado`);
  };

  // Load API settings
  const loadSettings = () => {
    const settings = getApiSettings();
    setApiForm(settings);
  };

  // Handle API form changes
  const handleApiFormChange = (field: keyof ApiForm, value: string) => {
    setApiForm(prev => ({ ...prev, [field]: value }));
  };

  // Save API settings
  const handleApiSave = () => {
    try {
      // Ensure required fields are filled
      if (!apiForm.groqApiEndpoint || !apiForm.groqModel || !apiForm.whisperApiEndpoint || !apiForm.whisperModel) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }
      
      saveApiSettings(apiForm);
      toast.success('Configurações de API salvas com sucesso');
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast.error('Erro ao salvar configurações de API');
    }
  };

  const groqModels = [
    { value: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout (17B)' },
    { value: 'meta-llama/llama-4-scout-8b-16e-instruct', label: 'Llama 4 Scout (8B)' },
    { value: 'meta-llama/llama-4-open-8b-16e-instruct', label: 'Llama 4 Open (8B)' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' }
  ];

  const whisperModels = [
    { value: 'distil-whisper-large-v3', label: 'Distil Whisper (Large)' },
    { value: 'distil-whisper-medium.en', label: 'Distil Whisper (Medium) - EN' },
    { value: 'whisper-large-v3', label: 'Whisper (Large v3)' }
  ];

  const languages = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'nl', label: 'Nederlands' },
    { value: 'ja', label: 'Japanese' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ru', label: 'Russian' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <SettingsIcon className="mr-2 h-6 w-6" /> Configurações
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Personalize as configurações de IA e aparência
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="ai" className="flex gap-2 items-center">
            <Robot size={18} /> Modelos de IA
          </TabsTrigger>
          <TabsTrigger value="app" className="flex gap-2 items-center">
            <Shield size={18} /> Aplicação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key size={18} /> Configurações de API
              </CardTitle>
              <CardDescription>
                Configure suas chaves de API para utilizar os recursos de inteligência artificial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groq-api-key">Chave de API da Groq</Label>
                <div className="relative">
                  <Input
                    id="groq-api-key"
                    type={showGroqKey ? 'text' : 'password'}
                    value={apiForm.groqApiKey}
                    onChange={(e) => handleApiFormChange('groqApiKey', e.target.value)}
                    placeholder="Adicione sua chave de API da Groq"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-3"
                    onClick={() => setShowGroqKey(!showGroqKey)}
                  >
                    {showGroqKey ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Obtenha sua chave em <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">console.groq.com/keys</a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groq-model">Modelo Groq para Análise de Texto</Label>
                <Select 
                  value={apiForm.groqModel} 
                  onValueChange={(value) => handleApiFormChange('groqModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {groqModels.map(model => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whisper-model">Modelo para Transcrição de Áudio</Label>
                <Select 
                  value={apiForm.whisperModel} 
                  onValueChange={(value) => handleApiFormChange('whisperModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {whisperModels.map(model => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma Padrão</Label>
                <Select 
                  value={apiForm.language} 
                  onValueChange={(value) => handleApiFormChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Label className="text-base font-medium">Configurações Avançadas</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="groq-endpoint">Endpoint da API Groq</Label>
                    <Input
                      id="groq-endpoint"
                      value={apiForm.groqApiEndpoint}
                      onChange={(e) => handleApiFormChange('groqApiEndpoint', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whisper-endpoint">Endpoint da API Whisper</Label>
                    <Input
                      id="whisper-endpoint"
                      value={apiForm.whisperApiEndpoint}
                      onChange={(e) => handleApiFormChange('whisperApiEndpoint', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {!apiForm.groqApiKey && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    Sem uma chave de API configurada, o sistema utilizará dados simulados (mock) para demonstração.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleApiSave} className="ml-auto">
                <Check className="mr-2 h-4 w-4" /> Salvar Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize as configurações visuais da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode" className="flex items-center gap-2">
                  Modo Escuro
                </Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sobre</CardTitle>
              <CardDescription>
                Informações sobre o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <h3 className="font-medium">SecurAI</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Versão 1.0.0</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sistema de análise inteligente de dados para investigação criminal usando inteligência artificial.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
