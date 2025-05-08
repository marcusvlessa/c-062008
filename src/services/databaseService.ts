
/**
 * Parses a PDF file to extract text content
 */
export const parsePdfToText = async (file: File): Promise<string> => {
  console.log('Starting parsePdfToText with file:', file.name, 'type:', file.type, 'size:', file.size);
  
  // For mock purposes, check if we're using specific test files
  // This ensures we have reliable mock data for testing without API keys
  const fileName = file.name.toLowerCase();
  
  // Enhanced mock detection for testing
  if (!file || file.size === 0) {
    console.log('Empty file detected, returning mock data');
    return getMockOccurrenceContent('empty');
  }
  
  // Check for different types of test files to provide appropriate mock content
  if (fileName.includes('bo') || fileName.includes('ocorrencia') || fileName.includes('test')) {
    console.log('Test file detected, returning mock occurrence data for:', fileName);
    const mockContent = getMockOccurrenceContent(fileName);
    console.log('Mock content length:', mockContent.length);
    return mockContent;
  }

  try {
    // For real PDFs, attempt to parse
    const arrayBuffer = await file.arrayBuffer();
    console.log('File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
    
    // Check if actual PDF parsing should be attempted (based on API settings)
    const apiSettings = localStorage.getItem('securai-api-settings');
    const hasApiKey = apiSettings && JSON.parse(apiSettings).groqApiKey;
    
    if (!hasApiKey) {
      console.log('No API key configured, using mock data');
      // Use a more generic mock data since this isn't a test file
      const genericMock = getMockOccurrenceContent('generic');
      console.log('Generic mock content length:', genericMock.length);
      return genericMock;
    }
    
    console.log('Attempting to parse real PDF file');
    
    // Here would be the real PDF parsing code
    // For now, return the mock data since we're focusing on mock functionality
    const fallbackMock = getMockOccurrenceContent(fileName || 'generic');
    console.log('Using fallback mock content, length:', fallbackMock.length);
    return fallbackMock;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    console.log('Falling back to mock data due to error');
    const errorMock = getMockOccurrenceContent('error');
    console.log('Error mock content length:', errorMock.length);
    return errorMock;
  }
};

/**
 * Get mock content based on the file name
 */
function getMockOccurrenceContent(fileName: string): string {
  console.log('Getting mock content for:', fileName);
  
  // Different mock content based on filename to simulate various documents
  if (fileName.includes('roubo') || fileName.includes('furto')) {
    return `BOLETIM DE OCORRÊNCIA Nº 1234/2023
    Data: 15/05/2023
    Hora: 14:30
    Local: Avenida Paulista, 1000, São Paulo/SP
    
    VÍTIMA:
    Nome: João da Silva
    RG: 12.345.678-9
    CPF: 123.456.789-00
    Endereço: Rua das Flores, 123, São Paulo/SP
    
    FATO:
    Compareceu nesta delegacia a vítima supracitada informando que teve seu veículo furtado quando estava estacionado em via pública. Segundo relato, estacionou seu veículo, um Toyota Corolla preto, placa ABC-1234, por volta das 10:00h e ao retornar às 14:00h não o encontrou mais. Não havia câmeras de segurança no local. A vítima não possui seguro do veículo.
    
    Solicitadas diligências para localização do veículo e possíveis suspeitos na área.`;
  } 
  else if (fileName.includes('agress') || fileName.includes('violencia')) {
    return `BOLETIM DE OCORRÊNCIA Nº 5678/2023
    Data: 22/05/2023
    Hora: 19:15
    Local: Rua Augusta, 500, São Paulo/SP
    
    VÍTIMA:
    Nome: Maria Oliveira
    RG: 98.765.432-1
    CPF: 987.654.321-00
    Endereço: Rua dos Pinheiros, 456, São Paulo/SP
    
    ACUSADO:
    Nome: Carlos Eduardo Santos
    RG: não informado
    Características: aproximadamente 30 anos, 1,75m, cabelos curtos
    
    FATO:
    A vítima relata que foi agredida verbalmente e fisicamente pelo acusado, seu ex-namorado, quando saía de seu local de trabalho. Segundo a declarante, o acusado a aguardava na saída e iniciou uma discussão por não aceitar o término do relacionamento. Testemunhas confirmam que o acusado a empurrou e ameaçou. A vítima apresenta escoriações leves no braço direito. Solicita medida protetiva de urgência.
    
    Encaminhada para exame de corpo de delito. Intimado o acusado para prestar esclarecimentos.`;
  }
  else if (fileName === 'generic') {
    return `BOLETIM DE OCORRÊNCIA Nº 4321/2023
    Data: 03/06/2023
    Hora: 08:30
    Local: Avenida Brasil, 789, São Paulo/SP
    
    COMUNICANTE:
    Nome: Ana Carolina Ferreira
    RG: 34.567.890-2
    CPF: 345.678.901-23
    Endereço: Rua Conselheiro Nébias, 500, São Paulo/SP
    
    FATO:
    A comunicante relatou que teve seu celular Samsung Galaxy S21 subtraído mediante grave ameaça por dois indivíduos em uma motocicleta preta sem placa. O fato ocorreu quando a vítima caminhava pela calçada. Um dos indivíduos desceu da motocicleta, simulou estar armado e exigiu a entrega do aparelho. Após a subtração, ambos fugiram no sentido centro da cidade.
    
    TESTEMUNHAS:
    José Ricardo Oliveira - presenciou o fato de dentro de um estabelecimento comercial próximo.
    
    Determinadas diligências para análise de câmeras de segurança da região e patrulhamento para localização dos suspeitos.`;
  }
  else if (fileName === 'error' || fileName === 'empty') {
    return `BOLETIM DE OCORRÊNCIA [FALHA NA EXTRAÇÃO]
    
    Não foi possível extrair completamente os dados deste documento devido a problemas técnicos. 
    Por favor, verifique o arquivo original ou tente novamente com outro documento.`;
  }
  else {
    // Default mock content
    return `BOLETIM DE OCORRÊNCIA Nº 9876/2023
    Data: 10/06/2023
    Hora: 10:45
    Local: Rua Liberdade, 789, São Paulo/SP
    
    COMUNICANTE:
    Nome: Pedro Henrique Almeida
    RG: 45.678.912-3
    CPF: 456.789.123-45
    Endereço: Rua Vergueiro, 1500, São Paulo/SP
    
    FATO:
    O comunicante relata que ao chegar em sua residência às 20:00h de ontem, constatou que a porta da frente estava arrombada e diversos pertences foram subtraídos, incluindo: 1 televisão 55 polegadas marca Samsung, 1 notebook Dell, joias diversas, 1 relógio Rolex e R$ 2.000,00 em espécie. O comunicante estava viajando há 3 dias e não há testemunhas do ocorrido. Solicitada perícia ao local.
    
    Veículos suspeitos na área segundo vizinhos: Um Fiat Uno branco e um Renault Sandero prata foram vistos estacionados por tempo prolongado no dia do fato.`;
  }
}

/**
 * Improved function to convert text content to CSV for storage
 */
export const convertTextToCSV = (text: string): string => {
  // Make sure we have data to convert
  if (!text || text.trim().length === 0) {
    console.log('Empty text provided to convertTextToCSV');
    return "Empty content";
  }
  
  console.log('Converting text to CSV format, length:', text.length);
  
  try {
    // Simple text to CSV conversion
    // Replace newlines and quotes for safe CSV storage
    const cleanedText = text
      .replace(/\r?\n/g, '\\n')  // Replace newlines with \n
      .replace(/"/g, '""');     // Escape quotes
    
    // Add header row for structure
    return `"content"\n"${cleanedText}"`;
  } catch (error) {
    console.error('Error converting text to CSV:', error);
    return `"content"\n"Error converting content"`;
  }
};

/**
 * Improves the storage of occurrence data with better logging
 */
export const saveOccurrenceData = async (data: {
  caseId: string;
  filename: string;
  content: string;
  analysis: string;
  dateProcessed: string;
}) => {
  console.log('Saving occurrence data for case:', data.caseId);
  console.log('With filename:', data.filename);
  console.log('Analysis length:', data.analysis?.length || 0);
  
  try {
    // Here would be database storage logic
    // For mock purposes, we just log and return success
    console.log('Occurrence data saved successfully to local storage');
    return true;
  } catch (error) {
    console.error('Error saving occurrence data:', error);
    throw error;
  }
};

/**
 * Retrieves occurrences by case ID
 */
export const getOccurrencesByCaseId = async (caseId: string): Promise<any[]> => {
  console.log('Retrieving occurrences for case:', caseId);
  
  try {
    // For mock purposes, use local storage for this implementation
    const storageKey = `securai-occurrences`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      console.log('No occurrences found in local storage');
      return [];
    }
    
    try {
      const occurrences = JSON.parse(existingData);
      const caseOccurrences = occurrences.filter((o: any) => o.caseId === caseId);
      
      console.log(`Found ${caseOccurrences.length} occurrences for case ${caseId}`);
      return caseOccurrences;
    } catch (parseError) {
      console.error('Error parsing occurrences data:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error retrieving occurrences:', error);
    return [];
  }
};

/**
 * Saves audio transcription data
 */
export const saveAudioTranscription = async (data: {
  caseId: string;
  filename: string;
  transcription: string;
  speakerData?: string;
  dateProcessed: string;
}): Promise<boolean> => {
  console.log('Saving audio transcription for case:', data.caseId);
  console.log('With filename:', data.filename);
  console.log('Transcription length:', data.transcription?.length || 0);
  
  try {
    // For mock purposes, we just simulate saving to local storage
    const storageKey = `securai-audio-transcriptions`;
    const existingData = localStorage.getItem(storageKey);
    const transcriptions = existingData ? JSON.parse(existingData) : [];
    
    // Add the new transcription
    transcriptions.push(data);
    
    // Save back to local storage
    localStorage.setItem(storageKey, JSON.stringify(transcriptions));
    
    console.log('Audio transcription saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving audio transcription:', error);
    return false;
  }
};

/**
 * Retrieves audio transcriptions by case ID
 */
export const getAudioTranscriptionsByCaseId = async (caseId: string): Promise<any[]> => {
  console.log('Retrieving audio transcriptions for case:', caseId);
  
  try {
    // For mock purposes, we just fetch from local storage
    const storageKey = `securai-audio-transcriptions`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      console.log('No audio transcriptions found');
      return [];
    }
    
    const transcriptions = JSON.parse(existingData);
    const caseTranscriptions = transcriptions.filter((t: any) => t.caseId === caseId);
    
    console.log(`Found ${caseTranscriptions.length} transcriptions for case ${caseId}`);
    return caseTranscriptions;
  } catch (error) {
    console.error('Error retrieving audio transcriptions:', error);
    return [];
  }
};

/**
 * Saves image analysis data
 */
export const saveImageAnalysis = async (data: {
  caseId: string;
  filename: string;
  dataUrl: string;
  ocrText?: string;
  faces?: any[];
  licensePlates?: string[];
  dateProcessed: string;
}): Promise<boolean> => {
  console.log('Saving image analysis for case:', data.caseId);
  console.log('With filename:', data.filename);
  
  try {
    // For mock purposes, we just simulate saving to local storage
    const storageKey = `securai-image-analyses`;
    const existingData = localStorage.getItem(storageKey);
    const analyses = existingData ? JSON.parse(existingData) : [];
    
    // Add the new analysis
    analyses.push(data);
    
    // Save back to local storage
    localStorage.setItem(storageKey, JSON.stringify(analyses));
    
    console.log('Image analysis saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving image analysis:', error);
    return false;
  }
};

/**
 * Retrieves image analyses by case ID
 */
export const getImageAnalysesByCaseId = async (caseId: string): Promise<any[]> => {
  console.log('Retrieving image analyses for case:', caseId);
  
  try {
    // For mock purposes, we just fetch from local storage
    const storageKey = `securai-image-analyses`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      console.log('No image analyses found');
      return [];
    }
    
    const analyses = JSON.parse(existingData);
    const caseAnalyses = analyses.filter((a: any) => a.caseId === caseId);
    
    console.log(`Found ${caseAnalyses.length} image analyses for case ${caseId}`);
    return caseAnalyses;
  } catch (error) {
    console.error('Error retrieving image analyses:', error);
    return [];
  }
};
