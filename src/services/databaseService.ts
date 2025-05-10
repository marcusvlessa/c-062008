import { toast } from 'sonner';

// Simple text conversion functions that don't rely on PDF.js
export const convertTextToCSV = (text: string): string => {
  // Simple conversion - replace newlines with commas and escape quotes
  return text.replace(/\n/g, ',').replace(/"/g, '""');
};

export const convertCSVToText = (csv: string): string => {
  return csv.replace(/,/g, '\n').replace(/""/g, '"');
};

// Function to extract text from uploaded PDF files
export const parsePdfToText = async (file: File): Promise<string> => {
  try {
    console.info('Parsing file:', file.name);
    
    // For PDF files, use direct text extraction
    if (file.type === 'application/pdf') {
      // We'll implement a simpler solution that doesn't require external PDF library
      // Return placeholder text for PDF files for now
      return `Conteúdo extraído do arquivo PDF: ${file.name}\n\n` +
        `Este é um texto placeholder porque a biblioteca PDF.js não está disponível.\n` +
        `Em um ambiente de produção, este conteúdo seria extraído do PDF.\n\n` +
        `BOLETIM DE OCORRÊNCIA\n` +
        `Data: ${new Date().toLocaleDateString()}\n` +
        `Local: São Paulo - SP\n` +
        `Tipo: FURTO\n\n` +
        `VÍTIMA: João da Silva\n` +
        `RG: 12.345.678-9\n` +
        `CPF: 123.456.789-00\n\n` +
        `NARRATIVA: A vítima relata que teve seu celular furtado enquanto estava em um transporte público.` +
        `Não conseguiu identificar o autor. O aparelho é um smartphone marca XYZ, modelo ABC, cor preta.`;
    }
    
    // For text files, extract the content directly
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For other file types, return a placeholder message
    return `Arquivo ${file.name} processado. Conteúdo não disponível para visualização direta.`;
    
  } catch (error) {
    console.error('Error parsing file:', error);
    toast.error(`Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    throw error;
  }
};

// Save occurrence analysis to localStorage
export const saveOccurrenceData = async (data: {
  caseId: string;
  filename: string;
  content: string;
  analysis: string;
  dateProcessed: string;
}) => {
  try {
    const storageKey = 'securai-occurrences';
    const existingData = localStorage.getItem(storageKey);
    const occurrences = existingData ? JSON.parse(existingData) : [];
    
    // Check if entry already exists and update it
    const existingIndex = occurrences.findIndex(
      (o: any) => o.caseId === data.caseId && o.filename === data.filename
    );
    
    if (existingIndex >= 0) {
      occurrences[existingIndex] = data;
    } else {
      occurrences.push(data);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(occurrences));
    console.info('Occurrence data saved:', data.filename);
    return data;
  } catch (error) {
    console.error('Error saving occurrence data:', error);
    throw error;
  }
};

// Get occurrences by case ID
export const getOccurrencesByCaseId = async (caseId: string) => {
  try {
    const storageKey = 'securai-occurrences';
    const existingData = localStorage.getItem(storageKey);
    console.info('Retrieving occurrences for case:', caseId);
    
    if (!existingData) {
      console.info('No occurrences found in local storage');
      return [];
    }
    
    const occurrences = JSON.parse(existingData);
    return occurrences.filter((o: any) => o.caseId === caseId);
  } catch (error) {
    console.error('Error retrieving occurrences:', error);
    return [];
  }
};

// Save image analysis to localStorage
export const saveImageAnalysis = async (data: {
  caseId: string;
  filename: string;
  dataUrl: string;
  ocrText?: string;
  faces?: {
    id: number;
    confidence: number;
    region: { x: number; y: number; width: number; height: number };
  }[];
  licensePlates?: string[];
  enhancementTechnique?: string;
  confidenceScores?: { plate: string; scores: number[] };
  dateProcessed: string;
}) => {
  try {
    const storageKey = 'securai-image-analyses';
    const existingData = localStorage.getItem(storageKey);
    const analyses = existingData ? JSON.parse(existingData) : [];
    
    // Check if entry already exists and update it
    const existingIndex = analyses.findIndex(
      (a: any) => a.caseId === data.caseId && a.filename === data.filename
    );
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = data;
    } else {
      analyses.push(data);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(analyses));
    console.info('Image analysis saved:', data.filename);
    return data;
  } catch (error) {
    console.error('Error saving image analysis:', error);
    throw error;
  }
};

// Get image analyses by case ID
export const getImageAnalysesByCaseId = async (caseId: string) => {
  try {
    const storageKey = 'securai-image-analyses';
    const existingData = localStorage.getItem(storageKey);
    console.info('Retrieving image analyses for case:', caseId);
    
    if (!existingData) {
      console.info('No image analyses found');
      return [];
    }
    
    const analyses = JSON.parse(existingData);
    return analyses.filter((a: any) => a.caseId === caseId);
  } catch (error) {
    console.error('Error retrieving image analyses:', error);
    return [];
  }
};

// Save audio transcription to localStorage
export const saveAudioTranscription = async (data: {
  caseId: string;
  filename: string;
  transcription: string;
  speakerData: string;
  dateProcessed: string;
}) => {
  try {
    const storageKey = 'securai-audio-transcriptions';
    const existingData = localStorage.getItem(storageKey);
    const transcriptions = existingData ? JSON.parse(existingData) : [];
    
    // Check if entry already exists and update it
    const existingIndex = transcriptions.findIndex(
      (t: any) => t.caseId === data.caseId && t.filename === data.filename
    );
    
    if (existingIndex >= 0) {
      transcriptions[existingIndex] = data;
    } else {
      transcriptions.push(data);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(transcriptions));
    console.info('Audio transcription saved:', data.filename);
    return data;
  } catch (error) {
    console.error('Error saving audio transcription:', error);
    throw error;
  }
};

// Get audio transcriptions by case ID
export const getAudioTranscriptionsByCaseId = async (caseId: string) => {
  try {
    const storageKey = 'securai-audio-transcriptions';
    const existingData = localStorage.getItem(storageKey);
    console.info('Retrieving audio transcriptions for case:', caseId);
    
    if (!existingData) {
      console.info('No audio transcriptions found');
      return [];
    }
    
    const transcriptions = JSON.parse(existingData);
    return transcriptions.filter((t: any) => t.caseId === caseId);
  } catch (error) {
    console.error('Error retrieving audio transcriptions:', error);
    return [];
  }
};

// Save link analysis data to localStorage
export const saveLinkAnalysisData = async (data: {
  caseId: string;
  title: string;
  nodes: any[];
  edges: any[];
  dateProcessed: string;
}) => {
  try {
    const storageKey = 'securai-link-analyses';
    const existingData = localStorage.getItem(storageKey);
    const analyses = existingData ? JSON.parse(existingData) : [];
    
    // Check if entry already exists and update it
    const existingIndex = analyses.findIndex(
      (a: any) => a.caseId === data.caseId && a.title === data.title
    );
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = data;
    } else {
      analyses.push(data);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(analyses));
    console.info('Link analysis data saved:', data.title);
    return data;
  } catch (error) {
    console.error('Error saving link analysis data:', error);
    throw error;
  }
};

// Get link analyses by case ID
export const getLinkAnalysesByCaseId = async (caseId: string) => {
  try {
    const storageKey = 'securai-link-analyses';
    const existingData = localStorage.getItem(storageKey);
    console.info('Retrieving link analyses for case:', caseId);
    
    if (!existingData) {
      console.info('No link analyses found');
      return [];
    }
    
    const analyses = JSON.parse(existingData);
    return analyses.filter((a: any) => a.caseId === caseId);
  } catch (error) {
    console.error('Error retrieving link analyses:', error);
    return [];
  }
};

// Save case statistics
export const saveCaseStatistics = async (data: {
  caseId: string;
  statistics: {
    crimeTypes: { [key: string]: number };
    occurrencesAnalyzed: number;
    imagesAnalyzed: number;
    audiosTranscribed: number;
    lastUpdated: string;
  };
}) => {
  try {
    const storageKey = 'securai-case-statistics';
    const existingData = localStorage.getItem(storageKey);
    const statistics = existingData ? JSON.parse(existingData) : [];
    
    // Check if entry already exists and update it
    const existingIndex = statistics.findIndex((s: any) => s.caseId === data.caseId);
    
    if (existingIndex >= 0) {
      statistics[existingIndex] = data;
    } else {
      statistics.push(data);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(statistics));
    console.info('Case statistics saved for case:', data.caseId);
    return data;
  } catch (error) {
    console.error('Error saving case statistics:', error);
    throw error;
  }
};

// Get statistics for a specific case
export const getCaseStatistics = async (caseId: string) => {
  try {
    const storageKey = 'securai-case-statistics';
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      return null;
    }
    
    const statistics = JSON.parse(existingData);
    return statistics.find((s: any) => s.caseId === caseId) || null;
  } catch (error) {
    console.error('Error retrieving case statistics:', error);
    return null;
  }
};

// Update case crime types based on analyzed content
export const updateCaseCrimeTypes = async (caseId: string, crimeTypes: string[]) => {
  try {
    const stats = await getCaseStatistics(caseId);
    
    const updatedStats = {
      caseId,
      statistics: {
        crimeTypes: {},
        occurrencesAnalyzed: stats?.statistics.occurrencesAnalyzed || 0,
        imagesAnalyzed: stats?.statistics.imagesAnalyzed || 0,
        audiosTranscribed: stats?.statistics.audiosTranscribed || 0,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Update crime type counts
    if (stats?.statistics.crimeTypes) {
      updatedStats.statistics.crimeTypes = { ...stats.statistics.crimeTypes };
    }
    
    crimeTypes.forEach(crimeType => {
      if (updatedStats.statistics.crimeTypes[crimeType]) {
        updatedStats.statistics.crimeTypes[crimeType]++;
      } else {
        updatedStats.statistics.crimeTypes[crimeType] = 1;
      }
    });
    
    await saveCaseStatistics(updatedStats);
    console.info('Updated case crime types for case:', caseId);
  } catch (error) {
    console.error('Error updating case crime types:', error);
  }
};
