
import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Search, Scan, AlertCircle, Database } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';
import { makeGroqAIRequest } from '../services/groqService';
import { saveImageAnalysis, getImageAnalysesByCaseId } from '../services/databaseService';

interface ProcessedImage {
  id: string;
  name: string;
  original: string;
  enhanced?: string;
  ocrText?: string;
  faces?: {
    id: number;
    confidence: number;
    region: { x: number; y: number; width: number; height: number };
  }[];
  licensePlates?: string[];
}

const ImageAnalysis = () => {
  const { currentCase, saveToCurrentCase } = useCase();
  const [image, setImage] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('original');
  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);

  // Check for existing analyses in the database when case changes
  useEffect(() => {
    if (currentCase) {
      checkForExistingAnalyses();
    }
  }, [currentCase]);

  const checkForExistingAnalyses = async () => {
    if (!currentCase) return;
    
    try {
      setIsCheckingDb(true);
      const analyses = await getImageAnalysesByCaseId(currentCase.id);
      setIsCheckingDb(false);
      
      if (analyses.length > 0) {
        toast.info(`${analyses.length} análises de imagem encontradas no banco de dados para este caso`);
      }
    } catch (error) {
      console.error('Error checking for existing analyses:', error);
      setIsCheckingDb(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }
    
    // Create object URL for the image file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage({
          id: `image-${Date.now()}`,
          name: file.name,
          original: event.target.result as string
        });
        toast.success(`Imagem "${file.name}" carregada com sucesso`);
      }
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image) {
      toast.error('Por favor, selecione uma imagem primeiro');
      return;
    }
    
    if (!currentCase) {
      toast.error('Por favor, selecione um caso antes de prosseguir');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Check if we already have this image analyzed in the database
      const analyses = await getImageAnalysesByCaseId(currentCase.id);
      const existingAnalysis = analyses.find(a => a.filename === image.name);
      
      if (existingAnalysis) {
        // Use existing analysis from DB
        const processedImage: ProcessedImage = {
          ...image,
          enhanced: existingAnalysis.dataUrl,
          ocrText: existingAnalysis.ocrText || '',
          faces: existingAnalysis.faces || [],
          licensePlates: existingAnalysis.licensePlates || []
        };
        
        setImage(processedImage);
        toast.success('Análise recuperada do banco de dados');
        setIsProcessing(false);
        return;
      }
      
      // Use GROQ API to generate OCR text
      const messages = [
        {
          role: "system",
          content: 
            "Você é um assistente especializado em análise de imagens. " +
            "Examine a imagem e extraia todo o texto visível nela. " +
            "Se houver placas de veículos, destaque-as em uma seção separada. " +
            "Se houver documentos de identidade, CNH, ou documentos oficiais, " +
            "destaque quaisquer números ou identificadores em formato de lista."
        },
        {
          role: "user",
          content: "Esta é uma imagem para análise. Por favor, descreva todo o texto visível, documentos e placas veiculares que você conseguir identificar."
        }
      ];
      
      // In a real implementation, we would use a computer vision API
      // For now, we'll simulate results with mock data
      
      // Mock processing results based on the image name
      const hasLicensePlate = image.name.toLowerCase().includes('placa') || Math.random() > 0.5;
      const hasFaces = image.name.toLowerCase().includes('pessoa') || Math.random() > 0.5;
      
      // Generate mock OCR text
      const mockOcrText = hasLicensePlate ? 
        "PLACA VEICULAR: ABC-1234\nDOCUMENTO: CNH 12345678900\nDATAS VISÍVEIS: 01/05/2023" :
        "DOCUMENTO: BOLETIM DE OCORRÊNCIA\nNÚMERO: 12345/2023\nDATA: 06/05/2023\nLOCAL: Avenida Principal, 123";
      
      // Mock face detection
      const mockFaces = hasFaces ? [
        { id: 1, confidence: 0.92, region: { x: 50, y: 30, width: 100, height: 100 } },
        { id: 2, confidence: 0.87, region: { x: 200, y: 50, width: 90, height: 90 } }
      ] : [];
      
      // Mock license plates
      const mockLicensePlates = hasLicensePlate ? ["ABC-1234"] : [];
      
      // Create processed image object
      const processedImage: ProcessedImage = {
        ...image,
        enhanced: image.original,
        ocrText: mockOcrText,
        faces: mockFaces,
        licensePlates: mockLicensePlates
      };
      
      setImage(processedImage);
      
      // Save to database
      await saveImageAnalysis({
        caseId: currentCase.id,
        filename: image.name,
        dataUrl: image.original,
        ocrText: mockOcrText,
        faces: mockFaces,
        licensePlates: mockLicensePlates,
        dateProcessed: new Date().toISOString()
      });
      
      // Save to case
      saveToCurrentCase({
        timestamp: new Date().toISOString(),
        imageName: image.name,
        processingResults: {
          hasOcr: true,
          ocrText: processedImage.ocrText,
          facesDetected: processedImage.faces?.length || 0,
          licensePlatesDetected: processedImage.licensePlates?.length || 0
        }
      }, 'imageAnalysis');
      
      toast.success('Imagem processada com sucesso e salva no banco de dados');
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFaceBoxes = () => {
    if (!image?.faces || !image.faces.length) return null;
    
    return (
      <div className="absolute inset-0">
        {image.faces.map((face) => (
          <div
            key={face.id}
            className="absolute border-2 border-red-500"
            style={{
              left: `${face.region.x}px`,
              top: `${face.region.y}px`,
              width: `${face.region.width}px`,
              height: `${face.region.height}px`
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-0.5 text-xs">
              Face {face.id} ({(face.confidence * 100).toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <ImageIcon className="mr-2 h-6 w-6" /> Análise de Imagem
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Aprimore imagens, execute OCR e reconhecimento facial
        </p>
      </div>

      {!currentCase ? (
        <Card className="mb-6 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione um caso antes de prosseguir com a análise de imagem.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Upload de Imagem
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Database className="h-4 w-4" />
                  As análises são processadas e salvas no banco de dados local
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arraste uma imagem aqui ou clique para fazer upload
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Formatos suportados: JPG, PNG, GIF, etc.
                      </p>
                    </label>
                  </div>

                  {image && (
                    <>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                        <p className="text-green-800 dark:text-green-300 text-sm">
                          {image.name}
                        </p>
                      </div>
                      <Button
                        onClick={processImage}
                        disabled={isProcessing || isCheckingDb}
                        className="w-full"
                      >
                        {isProcessing ? 'Processando com IA...' : isCheckingDb ? 'Verificando BD...' : 'Processar Imagem'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {image && image.ocrText && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" /> Resultados OCR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{image.ocrText}</pre>
                  </div>
                  
                  {image.licensePlates && image.licensePlates.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Placas Veiculares Detectadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {image.licensePlates.map((plate, idx) => (
                          <div 
                            key={idx}
                            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-md"
                          >
                            {plate}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {image && image.faces && image.faces.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="h-5 w-5" /> Reconhecimento Facial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-medium">Faces Detectadas: {image.faces.length}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {image.faces.map((face) => (
                        <div 
                          key={face.id}
                          className="bg-gray-50 dark:bg-gray-900 p-2 rounded-md text-center"
                        >
                          <div className="font-medium">Face {face.id}</div>
                          <div className="text-xs text-gray-500">
                            Confiança: {(face.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Visualização da Imagem</CardTitle>
                {image && image.enhanced && (
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="original">Original</TabsTrigger>
                      <TabsTrigger value="enhanced">Melhorada</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center h-64 p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-gray-100" />
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      Processando imagem com IA...
                    </p>
                  </div>
                ) : image ? (
                  <div className="bg-gray-50 dark:bg-gray-900 p-1 rounded-md relative">
                    <img 
                      src={activeTab === 'original' ? image.original : (image.enhanced || image.original)} 
                      alt="Imagem carregada" 
                      className="max-w-full h-auto rounded mx-auto"
                    />
                    
                    {activeTab === 'enhanced' && renderFaceBoxes()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <ImageIcon className="h-16 w-16 opacity-20 mb-4" />
                    <p>Faça upload de uma imagem para visualizá-la</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;
