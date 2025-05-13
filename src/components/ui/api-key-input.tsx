
import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { toast } from 'sonner';
import { getGroqSettings, saveGroqSettings } from '../../services/groqService';
import { Key, CheckCircle } from 'lucide-react';

export function ApiKeyInput() {
  const [apiKey, setApiKey] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Initialize with existing API key if available
  useEffect(() => {
    const settings = getGroqSettings();
    if (settings.groqApiKey) {
      setApiKey(settings.groqApiKey);
    }
  }, []);
  
  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Por favor, insira uma chave de API válida');
      return;
    }
    
    if (!apiKey.startsWith('gsk_')) {
      toast.warning('A chave API GROQ normalmente começa com "gsk_". Verifique se ela está correta.');
    }
    
    const settings = getGroqSettings();
    saveGroqSettings({
      ...settings,
      groqApiKey: apiKey.trim()
    });
    
    toast.success('Chave da API salva com sucesso');
    setIsSuccess(true);
    
    // Test API key by dispatching a custom event
    document.dispatchEvent(new Event('apiKeyUpdated'));
    
    // Also trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    
    // Reset success indicator after 3 seconds
    setTimeout(() => setIsSuccess(false), 3000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configuração da API GROQ
        </CardTitle>
        <CardDescription>
          Adicione sua chave da API GROQ para habilitar as funcionalidades de IA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="Digite sua chave da API GROQ (ex: gsk_...)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSave} className="shrink-0">
            {isSuccess ? <CheckCircle className="h-5 w-5" /> : "Salvar"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        Obtenha sua chave em <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com/keys</a>
      </CardFooter>
    </Card>
  );
}
