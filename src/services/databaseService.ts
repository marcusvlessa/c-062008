
/**
 * Service for managing SQLite database operations
 * In a browser environment, we're using IndexedDB to simulate SQLite
 */
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { toast } from 'sonner';

interface SecurAIDB extends DBSchema {
  occurrences: {
    key: string;
    value: {
      id: string;
      caseId: string;
      filename: string;
      content: string;
      analysis: string;
      dateProcessed: string;
    };
    indexes: { 'by-case': string };
  };
  audioTranscriptions: {
    key: string;
    value: {
      id: string;
      caseId: string;
      filename: string;
      transcription: string;
      dateProcessed: string;
    };
    indexes: { 'by-case': string };
  };
  imageAnalysis: {
    key: string;
    value: {
      id: string;
      caseId: string;
      filename: string;
      dataUrl: string;
      ocrText?: string;
      faces?: any[];
      licensePlates?: string[];
      dateProcessed: string;
    };
    indexes: { 'by-case': string };
  };
}

// Database connection
let db: IDBPDatabase<SecurAIDB> | null = null;

// Initialize the database
export const initDatabase = async (): Promise<IDBPDatabase<SecurAIDB>> => {
  if (db) return db;
  
  try {
    db = await openDB<SecurAIDB>('securai-db', 1, {
      upgrade(database) {
        // Create occurrences store
        const occurrencesStore = database.createObjectStore('occurrences', { keyPath: 'id' });
        occurrencesStore.createIndex('by-case', 'caseId');
        
        // Create audio transcriptions store
        const audioStore = database.createObjectStore('audioTranscriptions', { keyPath: 'id' });
        audioStore.createIndex('by-case', 'caseId');
        
        // Create image analysis store
        const imageStore = database.createObjectStore('imageAnalysis', { keyPath: 'id' });
        imageStore.createIndex('by-case', 'caseId');
      }
    });
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    toast.error('Erro ao inicializar banco de dados local');
    throw error;
  }
};

// Save occurrence data
export const saveOccurrenceData = async (data: Omit<SecurAIDB['occurrences']['value'], 'id'>) => {
  try {
    const database = await initDatabase();
    const id = `occurrence-${Date.now()}`;
    await database.put('occurrences', { ...data, id });
    return id;
  } catch (error) {
    console.error('Failed to save occurrence data:', error);
    throw error;
  }
};

// Get occurrences by case ID
export const getOccurrencesByCaseId = async (caseId: string) => {
  try {
    const database = await initDatabase();
    return await database.getAllFromIndex('occurrences', 'by-case', caseId);
  } catch (error) {
    console.error('Failed to get occurrences:', error);
    throw error;
  }
};

// Save audio transcription data
export const saveAudioTranscription = async (data: Omit<SecurAIDB['audioTranscriptions']['value'], 'id'>) => {
  try {
    const database = await initDatabase();
    const id = `audio-${Date.now()}`;
    await database.put('audioTranscriptions', { ...data, id });
    return id;
  } catch (error) {
    console.error('Failed to save audio transcription:', error);
    throw error;
  }
};

// Get audio transcriptions by case ID
export const getAudioTranscriptionsByCaseId = async (caseId: string) => {
  try {
    const database = await initDatabase();
    return await database.getAllFromIndex('audioTranscriptions', 'by-case', caseId);
  } catch (error) {
    console.error('Failed to get audio transcriptions:', error);
    throw error;
  }
};

// Save image analysis data
export const saveImageAnalysis = async (data: Omit<SecurAIDB['imageAnalysis']['value'], 'id'>) => {
  try {
    const database = await initDatabase();
    const id = `image-${Date.now()}`;
    await database.put('imageAnalysis', { ...data, id });
    return id;
  } catch (error) {
    console.error('Failed to save image analysis:', error);
    throw error;
  }
};

// Get image analyses by case ID
export const getImageAnalysesByCaseId = async (caseId: string) => {
  try {
    const database = await initDatabase();
    return await database.getAllFromIndex('imageAnalysis', 'by-case', caseId);
  } catch (error) {
    console.error('Failed to get image analyses:', error);
    throw error;
  }
};

// Parse PDF to text (simplified mock implementation for browser)
export const parsePdfToText = async (pdfFile: File): Promise<string> => {
  // In a real implementation, we would use a library like pdf.js to extract text
  // This is a simplified mock function
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Mock extracted content with filename and basic info
      const mockContent = 
        `BOLETIM DE OCORRÊNCIA\n` +
        `Arquivo: ${pdfFile.name}\n` +
        `Tamanho: ${(pdfFile.size / 1024).toFixed(2)} KB\n` +
        `Data: 06/05/2025\n\n` +
        `DESCRIÇÃO DA OCORRÊNCIA\n` +
        `Este é um texto extraído de um arquivo PDF com informações sobre uma ocorrência policial.\n` +
        `Envolve suspeita de furto na região central da cidade. Testemunhas relataram ter visto\n` +
        `um indivíduo de aproximadamente 30 anos, 1,75m, vestindo jaqueta preta.\n\n` +
        `PARTES ENVOLVIDAS\n` +
        `- João da Silva (vítima)\n` +
        `- Maria Oliveira (testemunha)\n\n` +
        `OBJETOS SUBTRAÍDOS\n` +
        `- Celular modelo iPhone 13\n` +
        `- Carteira com documentos`;
        
      resolve(mockContent);
    };
    reader.readAsText(pdfFile);
  });
};

// Convert text to CSV format
export const convertTextToCSV = (text: string): string => {
  // Simple conversion splitting by newlines and creating CSV rows
  const lines = text.split('\n').filter(line => line.trim());
  let csv = '';
  
  lines.forEach(line => {
    // Replace multiple spaces with a single space
    const cleanLine = line.replace(/\s+/g, ' ').trim();
    // Split by common separators like ":" or "-" if they exist
    if (cleanLine.includes(':')) {
      const [key, value] = cleanLine.split(':', 2);
      csv += `"${key.trim()}","${value.trim()}"\n`;
    } else if (cleanLine.startsWith('-')) {
      csv += `"item","${cleanLine.substring(1).trim()}"\n`;
    } else {
      csv += `"text","${cleanLine}"\n`;
    }
  });
  
  return csv;
};
