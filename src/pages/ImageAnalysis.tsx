
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Search, Scan, AlertCircle, Database, Maximize2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { useCase } from '../contexts/CaseContext';
import { 
  analyzeImageWithGroq, 
  enhanceImageWithGroq
} from '../services/groqService';
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
  const [showFaceBox, setShowFaceBox] = useState<boolean>(true);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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
        setActiveTab('enhanced');
        toast.success('Análise recuperada do banco de dados');
        setIsProcessing(false);
        return;
      }
      
      // First, enhance the image
      const enhancedImageUrl = await enhanceImageWithGroq(image.original);
      
      // Then, analyze the enhanced image for text and objects
      const { ocrText, faces, licensePlates } = await analyzeImageWithGroq(enhancedImageUrl);
      
      // Create processed image object
      const processedImage: ProcessedImage = {
        ...image,
        enhanced: enhancedImageUrl,
        ocrText,
        faces,
        licensePlates
      };
      
      setImage(processedImage);
      setActiveTab('enhanced'); // Switch to enhanced tab automatically
      
      // Save to database
      await saveImageAnalysis({
        caseId: currentCase.id,
        filename: image.name,
        dataUrl: enhancedImageUrl,
        ocrText,
        faces,
        licensePlates,
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

  // Function to calibrate face box positions based on current image display size
  const calibrateFaceBoxPositions = (face: any, imgElement: HTMLImageElement | null) => {
    if (!imgElement || !imageContainerRef.current) return face.region;
    
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    const imgRect = imgElement.getBoundingClientRect();
    
    // Calculate scaling factors
    const scaleX = imgRect.width / imgElement.naturalWidth;
    const scaleY = imgRect.height / imgElement.naturalHeight;
    
    // Return adjusted coordinates
    return {
      x: face.region.x * scaleX,
      y: face.region.y * scaleY,
      width: face.region.width * scaleX,
      height: face.region.height * scaleY
    };
  };

  const renderFaceBoxes = () => {
    if (!image?.faces || !image.faces.length || !showFaceBox) return null;
    
    const imgElement = imageContainerRef.current?.querySelector('img');
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {image.faces.map((face) => {
          const adjustedRegion = calibrateFaceBoxPositions(face, imgElement as HTMLImageElement);
          
          return (
            <div
              key={face.id}
              className="absolute border-2 border-red-500"
              style={{
                left: `${adjustedRegion.x}px`,
                top: `${adjustedRegion.y}px`,
                width: `${adjustedRegion.width}px`,
                height: `${adjustedRegion.height}px`
              }}
            >
              <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-0.5 text-xs">
                Face {face.id} ({(face.confidence * 100).toFixed(1)}%)
              </div>
            </div>
          );
        })}
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
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Faces Detectadas: {image.faces.length}</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowFaceBox(!showFaceBox)}
                      >
                        {showFaceBox ? 'Ocultar Marcações' : 'Mostrar Marcações'}
                      </Button>
                    </div>
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
                <CardTitle className="flex justify-between items-center">
                  <span>Visualização da Imagem</span>
                  {image && image.enhanced && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="flex items-center gap-1"
                      onClick={() => window.open(activeTab === 'original' ? image.original : image.enhanced, '_blank')}
                    >
                      <Maximize2 size={16} />
                      <span>Ampliar</span>
                    </Button>
                  )}
                </CardTitle>
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
                  <div className="bg-gray-50 dark:bg-gray-900 p-1 rounded-md relative" ref={imageContainerRef}>
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
