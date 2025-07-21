'use client';

import { useState, useRef,  useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Loader2, AlertTriangle, Clock, CheckCircle, DollarSign, Upload, Image, X, Check } from 'lucide-react';
import { processVoiceToText, formatIssueWithAI, analyzeImageWithAI } from '@/lib/ai-processor';
import { commonIssues } from '@/lib/tata-models';

interface IssueFormProps {
  vehicleModel: string;
  preservedData?: {
    issueText: string;
    aiAnalysis: any;
    uploadedImage: File | null;
    imagePreview: string | null;
  };
  onDataChange?: (data: any) => void;
  onSubmit: (issue: any) => void;
}

export default function IssueForm({ vehicleModel, preservedData, onDataChange, onSubmit }: IssueFormProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [issueText, setIssueText] = useState(preservedData?.issueText || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<any>(preservedData?.aiAnalysis || null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(preservedData?.uploadedImage || null);
  const [imagePreview, setImagePreview] = useState<string | null>(preservedData?.imagePreview || null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        issueText,
        aiAnalysis,
        uploadedImage,
        imagePreview
      });
    }
  }, [issueText, aiAnalysis, uploadedImage, imagePreview, onDataChange]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsProcessing(true);
        
        try {
          const transcribedText = await processVoiceToText(audioBlob);
          setIssueText(transcribedText);
          const analysis = await formatIssueWithAI(transcribedText, vehicleModel);
          setAiAnalysis(analysis);
        } catch (error) {
          console.error('Voice processing failed:', error);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
        // Automatically analyze the image when uploaded
        analyzeImageAutomatically(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImageAutomatically = async (file: File) => {
    setIsAnalyzingImage(true);
    try {
      const analysis = await analyzeImageWithAI(file, vehicleModel);
      setIssueText(analysis.description);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Image analysis failed:', error);
      alert('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    // Don't clear the analysis when removing image, let user decide
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextSubmit = async () => {
    if (!issueText.trim()) return;
    
    setIsProcessing(true);
    try {
      const analysis = await formatIssueWithAI(issueText, vehicleModel);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('AI processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const submitIssue = async () => {
    setIsSubmitting(true);
    
    const issueData = {
      description: aiAnalysis?.formattedIssue || issueText,
      category: aiAnalysis?.category || selectedCategory,
      severity: aiAnalysis?.severity || 'medium',
      suggestedActions: aiAnalysis?.suggestedActions || [],
      possibleCauses: aiAnalysis?.possibleCauses || [],
      urgencyLevel: aiAnalysis?.urgencyLevel || 'Within 1 week',
      estimatedCost: aiAnalysis?.estimatedCost || 'Contact service center',
      vehicleModel,
      status: 'open',
      createdAt: new Date(),
      hasImage: !!uploadedImage,
    };

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });

      if (response.ok) {
        const savedIssue = await response.json();
        
        // Show success animation
        setIsSubmitted(true);
        
        // Reset form after animation
        setTimeout(() => {
          onSubmit(savedIssue);
          setIssueText('');
          setAiAnalysis(null);
          setSelectedCategory('');
          setUploadedImage(null);
          setImagePreview(null);
          setIsSubmitted(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit issue:', error);
      alert('Failed to submit issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success animation overlay
  if (isSubmitted) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Issue Submitted Successfully!</h3>
            <p className="text-green-100">Your vehicle issue has been recorded and analyzed.</p>
          </div>
        </div>
        <CardHeader>
          <CardTitle>Report New Issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 opacity-20">
          <div className="h-32 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold">Report New Issue</span>
            <p className="text-sm text-blue-100 font-normal">Describe your vehicle problem</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Image Upload Section */}

        {/* Text Input Section */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Describe your issue</Label>
          <div className="flex gap-2">
            <Textarea
              placeholder="Describe the issue with your vehicle..."
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              className="flex-1 border-2 border-gray-200 focus:border-blue-400 rounded-lg bg-white/80 min-h-[80px]"
              rows={3}
            />
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingImage}
                className="h-10 w-10 flex-shrink-0"
                title="Upload and analyze image"
              >
                {isAnalyzingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Image className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="h-10 w-10 flex-shrink-0"
                title="Voice recording"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleTextSubmit}
                disabled={!issueText.trim() || isProcessing}
                className="h-10 w-10 flex-shrink-0"
                title="Analyze text"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-4">
              <img 
                src={imagePreview} 
                alt="Issue preview" 
                className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            Recording... Click stop when done
          </div>
        )}

        {/* Processing Status */}
        {(isProcessing || isAnalyzingImage) && (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isAnalyzingImage ? 'Analyzing image with AI...' : 'Gemini AI is analyzing your issue...'}
          </div>
        )}

        {/* Quick Categories */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">Quick Issue Categories</Label>
          <div className="flex flex-wrap gap-2">
            {commonIssues.map((issue) => (
              <Badge
                key={issue}
                variant={selectedCategory === issue ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => setSelectedCategory(issue)}
              >
                {issue}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                Gemini AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-700">Formatted Issue Description:</Label>
                <p className="text-sm bg-white/60 rounded-lg p-2 mt-1">{aiAnalysis.formattedIssue}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Category:</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">{aiAnalysis.category}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Severity Level:</Label>
                  <div className="mt-1 flex items-center gap-2">
                    {aiAnalysis.severity === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {aiAnalysis.severity === 'medium' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {aiAnalysis.severity === 'low' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    <Badge variant={aiAnalysis.severity === 'high' ? 'destructive' : aiAnalysis.severity === 'medium' ? 'default' : 'secondary'}>
                      {aiAnalysis.severity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-700">Urgency Level:</Label>
                  <p className="text-sm bg-white/60 rounded-lg p-2 mt-1 font-medium">{aiAnalysis.urgencyLevel}</p>
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    Estimated Cost:
                  </Label>
                  <p className="text-sm bg-white/60 rounded-lg p-2 mt-1 font-medium">{aiAnalysis.estimatedCost}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-semibold text-gray-700">Possible Causes:</Label>
                <ul className="text-xs list-disc list-inside space-y-1 bg-white/60 rounded-lg p-2 mt-1">
                  {aiAnalysis.possibleCauses.map((cause: string, index: number) => (
                    <li key={index} className="text-gray-700">{cause}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <Label className="text-xs font-semibold text-gray-700">Recommended Actions:</Label>
                <ul className="text-xs list-disc list-inside space-y-1 bg-white/60 rounded-lg p-2 mt-1">
                  {aiAnalysis.suggestedActions.map((action: string, index: number) => (
                    <li key={index} className="text-gray-700">{action}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button 
          onClick={submitIssue} 
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg py-3 text-lg font-semibold" 
          disabled={!issueText.trim() || isProcessing || isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting Issue...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Submit Issue Report
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}