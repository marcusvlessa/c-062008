
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Link, Image, AudioWaveform, Folder, Shield, AlertCircle, Search, Scan } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCase } from '../contexts/CaseContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentCase } = useCase();

  const modules = [
    {
      title: 'Análise de Ocorrência',
      description: 'Processamento de PDFs e HTMLs de ocorrências para sugestões de investigação',
      icon: <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      path: '/occurrence-analysis',
      color: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Relatório de Investigação',
      description: 'Criação de relatórios com base em evidências multimídia',
      icon: <FileText className="h-12 w-12 text-green-600 dark:text-green-400" />,
      path: '/investigation-report',
      color: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      title: 'Análise de Vínculo',
      description: 'Identificação de relações e padrões a partir de dados tabulares',
      icon: <Link className="h-12 w-12 text-purple-600 dark:text-purple-400" />,
      path: '/link-analysis',
      color: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Análise de Áudio',
      description: 'Transcrição e análise de áudios para criação de relatórios',
      icon: <AudioWaveform className="h-12 w-12 text-amber-600 dark:text-amber-400" />,
      path: '/audio-analysis',
      color: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Análise de Imagem',
      description: 'Aprimoramento, OCR e reconhecimento facial em imagens',
      icon: <Image className="h-12 w-12 text-red-600 dark:text-red-400" />,
      path: '/image-analysis',
      color: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    {
      title: 'Gerenciamento de Casos',
      description: 'Organização e armazenamento de casos e evidências',
      icon: <Folder className="h-12 w-12 text-teal-600 dark:text-teal-400" />,
      path: '/case-management',
      color: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
    },
  ];

  // Dashboard statistics for quick overview
  const stats = [
    { label: 'Casos Ativos', value: currentCase ? 1 : 0, icon: <Folder className="h-5 w-5" />, color: 'text-blue-600' },
    { label: 'Ocorrências Analisadas', value: 0, icon: <FileText className="h-5 w-5" />, color: 'text-green-600' },
    { label: 'Pessoas Identificadas', value: 0, icon: <Scan className="h-5 w-5" />, color: 'text-purple-600' },
    { label: 'Áudios Processados', value: 0, icon: <AudioWaveform className="h-5 w-5" />, color: 'text-amber-600' },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-500" />
          Secur:AI - Sistema de Inteligência para Segurança Pública
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Plataforma de análise avançada para investigação criminal e gestão de ocorrências
        </p>
      </div>

      {!currentCase ? (
        <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            <p className="text-yellow-800 dark:text-yellow-200">
              Nenhum caso selecionado. Por favor, crie ou selecione um caso para começar.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/case-management')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-700 dark:hover:bg-yellow-600"
          >
            <Folder className="mr-2 h-4 w-4" />
            Gerenciar Casos
          </Button>
        </div>
      ) : (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              Caso Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{currentCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {currentCase.description || "Sem descrição"}
                </p>
              </div>
              <Button 
                onClick={() => navigate('/case-management')}
                variant="outline"
              >
                <Search className="mr-2 h-4 w-4" />
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Módulos de Análise</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card 
            key={index}
            onClick={() => navigate(module.path)}
            className={`overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-lg border ${module.borderColor}`}
          >
            <div className={`h-2 ${module.borderColor === 'border-blue-200 dark:border-blue-800' ? 'bg-blue-500' : 
                              module.borderColor === 'border-green-200 dark:border-green-800' ? 'bg-green-500' :
                              module.borderColor === 'border-purple-200 dark:border-purple-800' ? 'bg-purple-500' :
                              module.borderColor === 'border-amber-200 dark:border-amber-800' ? 'bg-amber-500' :
                              module.borderColor === 'border-red-200 dark:border-red-800' ? 'bg-red-500' : 'bg-teal-500'}`}>
            </div>
            <CardContent className={`p-6 ${module.color}`}>
              <div className="mb-4">
                {module.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {module.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {module.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
