
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
      speakerData?: string; // JSON string of speaker segments
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

// Parse PDF to text (enhanced with more realistic extraction)
export const parsePdfToText = async (pdfFile: File): Promise<string> => {
  // In a real implementation, we would use a library like pdf.js to extract text
  // This is an enhanced mock function
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Create more realistic content based on filename
      const fileName = pdfFile.name.toLowerCase();
      let mockContent = '';
      
      // Different mock content based on filename patterns
      if (fileName.includes('bo') || fileName.includes('ocorrencia') || fileName.includes('policia')) {
        mockContent = 
          `BOLETIM DE OCORRÊNCIA Nº ${Math.floor(Math.random() * 1000) + 1000}/2025\n` +
          `Delegacia: ${Math.floor(Math.random() * 100)}ª DP - São Paulo\n` +
          `Data do Registro: ${new Date().toLocaleDateString('pt-BR')}\n` +
          `Data do Fato: ${new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}\n\n` +
          `NATUREZA DA OCORRÊNCIA: Furto Qualificado (Art. 155, §4º, CP)\n\n` +
          `VÍTIMA:\n` +
          `Nome: Carlos Roberto da Silva\n` +
          `RG: 25.654.789-X SSP/SP\n` +
          `CPF: 123.456.789-00\n` +
          `Data de Nascimento: 15/03/1985\n` +
          `Endereço: Rua das Palmeiras, 123 - Jardim Europa - São Paulo/SP\n` +
          `Telefone: (11) 98765-4321\n\n` +
          `FATOS:\n` +
          `A vítima relatou que no dia da ocorrência, por volta das 14h30, teve seu veículo Toyota Corolla, cor prata, placa ABC-1234, ano 2022, arrombado enquanto estava estacionado na Av. Paulista, próximo ao número 1000. Foram subtraídos do interior do veículo um notebook marca Dell, modelo Inspiron, uma maleta com documentos pessoais e profissionais, e um telefone celular iPhone 13. A vítima afirma que estacionou o veículo às 13h15 e ao retornar às 14h30 constatou o crime. Câmeras de segurança de um estabelecimento comercial próximo podem ter registrado a ação.\n\n` +
          `TESTEMUNHAS:\n` +
          `1. Maria Oliveira - Comerciante local, presenciou um indivíduo suspeito próximo ao veículo.\n` +
          `2. João Pereira - Segurança do edifício em frente, informou que as câmeras de segurança podem ter captado imagens do ocorrido.\n\n` +
          `DILIGÊNCIAS SOLICITADAS:\n` +
          `- Requisição das imagens de câmeras de segurança\n` +
          `- Verificação de impressões digitais no veículo\n` +
          `- Averiguação de ocorrências similares na região\n\n` +
          `OBSERVAÇÕES ADICIONAIS:\n` +
          `Veículo modelo Toyota Corolla, cor prata, placa ABC-1234, ano 2022\n` +
          `Segundo a vítima, houve ocorrências semelhantes na região nas últimas semanas.\n` +
          `Foi informado que um suspeito foi visto no local: homem, aproximadamente 30 anos, 1,75m, vestindo jaqueta preta e boné.`;
      } else if (fileName.includes('laudo') || fileName.includes('pericia')) {
        mockContent = 
          `LAUDO DE EXAME PERICIAL Nº ${Math.floor(Math.random() * 1000) + 1000}/2025\n` +
          `Instituto de Criminalística - São Paulo\n` +
          `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n` +
          `SOLICITANTE: Delegacia de Polícia Civil - ${Math.floor(Math.random() * 100)}ª DP\n\n` +
          `OBJETO DO EXAME:\n` +
          `Veículo Toyota Corolla, cor prata, placa ABC-1234, ano 2022, chassi 9BRBL09F2P0123456\n\n` +
          `DESCRIÇÃO DO LOCAL:\n` +
          `O veículo foi encontrado estacionado na Av. Paulista, 1000, São Paulo/SP, apresentando sinais de arrombamento na porta do lado do motorista. O vidro traseiro esquerdo estava quebrado e havia sinais de violação no painel central.\n\n` +
          `EXAME REALIZADO:\n` +
          `Foi realizado exame minucioso no veículo, com coleta de impressões digitais e vestígios biológicos. Foram encontradas marcas de ferramentas usadas para arrombamento na fechadura da porta do motorista, compatíveis com chave de fenda modificada.\n\n` +
          `MATERIAL COLETADO:\n` +
          `- Impressões digitais na maçaneta e vidro do veículo\n` +
          `- Fibras encontradas no assento do motorista\n` +
          `- Amostra de substância desconhecida no console central\n\n` +
          `RESULTADOS:\n` +
          `1. As impressões digitais coletadas foram encaminhadas para análise comparativa no sistema AFIS.\n` +
          `2. As fibras encontradas são compatíveis com tecido sintético de cor preta, possivelmente proveniente de luvas ou vestimentas.\n` +
          `3. A substância desconhecida foi identificada como resíduo de cola utilizada em dispositivos "chupa-cabra" para clonagem de cartões.\n\n` +
          `CONCLUSÃO:\n` +
          `O veículo apresenta sinais evidentes de arrombamento realizado por pessoa com conhecimento técnico em sistemas de travamento automotivo. A presença de resíduos de cola sugere possível tentativa de instalação de dispositivo para clonagem de cartões, indicando grupo criminoso especializado em furtos e fraudes.\n\n` +
          `OBSERVAÇÕES ADICIONAIS:\n` +
          `O padrão de arrombamento é semelhante a outros 3 casos registrados na mesma região nos últimos 30 dias, sugerindo atuação do mesmo grupo criminoso.`;
      } else {
        mockContent = 
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
          `- Carteira com documentos\n` +
          `- Notebook HP EliteBook\n` +
          `- Relógio marca Citizen\n\n` +
          `VEÍCULO RELACIONADO\n` +
          `Placa: XYZ-5678\n` +
          `Modelo: Honda Civic\n` +
          `Ano: 2023\n` +
          `Cor: Preto`;
      }
        
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
  
  lines.forEach((line, index) => {
    // Replace multiple spaces with a single space
    const cleanLine = line.replace(/\s+/g, ' ').trim();
    // Add row number for reference
    csv += `${index+1},`;
    
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
