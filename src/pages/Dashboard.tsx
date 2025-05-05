
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Link, 
  Image, 
  AudioWaveform, 
  Folder, 
  Shield, 
  AlertCircle, 
  Search, 
  Scan,
  Calendar,
  Users,
  Clock
} from 'lucide-react';
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
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Relatório de Investigação',
      description: 'Criação de relatórios com base em evidências multimídia',
      icon: <FileText className="h-12 w-12 text-green-600 dark:text-green-400" />,
      path: '/investigation-report',
      color: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Análise de Vínculo',
      description: 'Identificação de relações e padrões a partir de dados tabulares',
      icon: <Link className="h-12 w-12 text-purple-600 dark:text-purple-400" />,
      path: '/link-analysis',
      color: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Análise de Áudio',
      description: 'Transcrição e análise de áudios para criação de relatórios',
      icon: <AudioWaveform className="h-12 w-12 text-amber-600 dark:text-amber-400" />,
      path: '/audio-analysis',
      color: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Análise de Imagem',
      description: 'Aprimoramento, OCR e reconhecimento facial em imagens',
      icon: <Image className="h-12 w-12 text-red-600 dark:text-red-400" />,
      path: '/image-analysis',
      color: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      gradient: 'from-red-500 to-red-600',
    },
    {
      title: 'Gerenciamento de Casos',
      description: 'Organização e armazenamento de casos e evidências',
      icon: <Folder className="h-12 w-12 text-teal-600 dark:text-teal-400" />,
      path: '/case-management',
      color: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
      gradient: 'from-teal-500 to-teal-600',
    },
  ];

  // Dashboard statistics for quick overview
  const stats = [
    { 
      label: 'Casos Ativos', 
      value: currentCase ? 1 : 0, 
      icon: <Folder className="h-5 w-5" />, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    { 
      label: 'Ocorrências Analisadas', 
      value: 0, 
      icon: <FileText className="h-5 w-5" />, 
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    { 
      label: 'Pessoas Identificadas', 
      value: 0, 
      icon: <Scan className="h-5 w-5" />, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    { 
      label: 'Áudios Processados', 
      value: 0, 
      icon: <AudioWaveform className="h-5 w-5" />, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30'
    },
  ];

  const recentActivities = [
    { 
      type: 'Caso Criado',
      description: 'Investigação Criminal #2023-01',
      date: '2025-05-05T10:30:00',
      icon: <Folder className="h-4 w-4 text-teal-500" />
    },
    { 
      type: 'Ocorrência Analisada',
      description: 'B.O. 1234/2025 - Análise Completa',
      date: '2025-05-04T15:45:00',
      icon: <FileText className="h-4 w-4 text-blue-500" />
    },
    { 
      type: 'Áudio Processado', 
      description: 'Transcrição de Interrogatório',
      date: '2025-05-03T09:15:00',
      icon: <AudioWaveform className="h-4 w-4 text-amber-500" />
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-6 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Secur:AI</h1>
              <p className="text-blue-100">Sistema de Inteligência para Segurança Pública</p>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Button 
              onClick={() => navigate('/case-management')} 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-none text-white"
            >
              <Folder className="mr-2 h-4 w-4" />
              Gerenciar Casos
            </Button>
            <Button 
              onClick={() => navigate('/settings')} 
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 border-none text-white"
            >
              Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Case Warning or Current Case */}
      {!currentCase ? (
        <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg flex items-center justify-between shadow-sm">
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
        <Card className="border-blue-200 dark:border-blue-800 shadow-md overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
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
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Criado: {formatDate(currentCase.dateCreated)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Modificado: {formatDate(currentCase.lastModified)}</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/case-management')}
                variant="outline"
                className="whitespace-nowrap"
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
          <Card key={index} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Cards - Takes up 2/3 of the screen on large displays */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Módulos de Análise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <Card 
                key={index}
                onClick={() => navigate(module.path)}
                className={`overflow-hidden cursor-pointer transform transition-all hover:scale-[1.02] hover:shadow-lg border ${module.borderColor}`}
              >
                <div className={`h-1 bg-gradient-to-r ${module.gradient}`}></div>
                <CardContent className={`p-5 ${module.color}`}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Section - Takes up 1/3 of the screen on large displays */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Atividades Recentes
          </h2>
          
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              {recentActivities.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                  {recentActivities.map((activity, index) => (
                    <li key={index} className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-0.5">
                          {activity.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{activity.type}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma atividade recente</p>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                <Button variant="ghost" size="sm" className="w-full text-gray-600 dark:text-gray-300">
                  Ver todas as atividades
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Section */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mt-6 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Acesso Rápido
          </h2>
          
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 text-center"
                  onClick={() => navigate('/investigation-report')}
                >
                  <FileText className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="text-sm">Novo Relatório</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 text-center"
                  onClick={() => navigate('/audio-analysis')}
                >
                  <AudioWaveform className="h-8 w-8 mb-2 text-amber-600" />
                  <span className="text-sm">Analisar Áudio</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 text-center"
                  onClick={() => navigate('/image-analysis')}
                >
                  <Image className="h-8 w-8 mb-2 text-red-600" />
                  <span className="text-sm">Analisar Imagem</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col items-center justify-center h-24 text-center"
                  onClick={() => navigate('/occurrence-analysis')}
                >
                  <FileText className="h-8 w-8 mb-2 text-green-600" />
                  <span className="text-sm">Nova Ocorrência</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
