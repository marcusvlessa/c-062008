
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Link, Image, AudioWaveform, Folder } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCase } from '../contexts/CaseContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentCase } = useCase();

  const modules = [
    {
      title: 'Análise de Ocorrência',
      description: 'Processamento de PDFs e HTMLs de ocorrências para sugestões de investigação',
      icon: <FileText className="h-12 w-12 text-blue-600" />,
      path: '/occurrence-analysis',
    },
    {
      title: 'Relatório de Investigação',
      description: 'Criação de relatórios com base em evidências multimídia',
      icon: <FileText className="h-12 w-12 text-green-600" />,
      path: '/investigation-report',
    },
    {
      title: 'Análise de Vínculo',
      description: 'Identificação de relações e padrões a partir de dados tabulares',
      icon: <Link className="h-12 w-12 text-purple-600" />,
      path: '/link-analysis',
    },
    {
      title: 'Análise de Áudio',
      description: 'Transcrição e análise de áudios para criação de relatórios',
      icon: <AudioWaveform className="h-12 w-12 text-amber-600" />,
      path: '/audio-analysis',
    },
    {
      title: 'Análise de Imagem',
      description: 'Aprimoramento, OCR e reconhecimento facial em imagens',
      icon: <Image className="h-12 w-12 text-red-600" />,
      path: '/image-analysis',
    },
    {
      title: 'Gerenciamento de Casos',
      description: 'Organização e armazenamento de casos e evidências',
      icon: <Folder className="h-12 w-12 text-teal-600" />,
      path: '/case-management',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Secur:AI - Sistema de Inteligência para Segurança Pública
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Plataforma de análise avançada para investigação criminal e gestão de ocorrências.
        </p>
      </div>

      {!currentCase ? (
        <div className="mb-6 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200">
            Nenhum caso selecionado. Por favor, crie ou selecione um caso para começar.
          </p>
          <Button 
            className="mt-2" 
            variant="outline"
            onClick={() => navigate('/case-management')}
          >
            Ir para Gerenciamento de Casos
          </Button>
        </div>
      ) : (
        <div className="mb-6 p-4 border border-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-md">
          <p className="text-blue-800 dark:text-blue-200">
            Caso atual: <strong>{currentCase.title}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(module.path)}
          >
            <div className="p-6">
              <div className="mb-4">
                {module.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {module.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {module.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
