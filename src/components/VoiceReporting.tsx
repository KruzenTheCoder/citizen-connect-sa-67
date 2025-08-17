import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceReportingProps {
  onReportData: (data: {
    title: string;
    description: string;
    type: string;
    priority: string;
  }) => void;
}

const VoiceReporting: React.FC<VoiceReportingProps> = ({ onReportData }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processedData, setProcessedData] = useState<any>(null);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Speech Recognition Error',
          description: 'Please try again or type your report manually.',
          variant: 'destructive',
        });
        setIsRecording(false);
      };
    }
  }, [toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      setIsRecording(true);
      setTranscript('');
      
      toast({
        title: 'Recording Started',
        description: 'Speak clearly to report your incident.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: 'Recording Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      toast({
        title: 'Recording Stopped',
        description: 'Processing your report...',
      });
    }
  };

  const processTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No Speech Detected',
        description: 'Please try recording again.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call Edge Function to process speech with AI
      const { data, error } = await supabase.functions.invoke('process-voice-report', {
        body: { transcript: transcript.trim() }
      });

      if (error) throw error;

      setProcessedData(data);
      toast({
        title: 'Report Processed',
        description: 'AI has analyzed your voice report.',
      });
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process voice report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const submitReport = () => {
    if (processedData) {
      onReportData(processedData);
      setTranscript('');
      setProcessedData(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'bg-civic-red text-white';
      case 'high': return 'bg-civic-amber text-black';
      case 'medium': return 'bg-civic-emerald text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Incident Reporting
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative ${
              isRecording 
                ? 'bg-civic-red hover:bg-civic-red/80 text-white' 
                : 'bg-primary hover:bg-primary/80'
            }`}
            size="lg"
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-civic-red rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          {transcript && (
            <Button
              onClick={processTranscript}
              disabled={isRecording || isProcessing}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Process Report
                </>
              )}
            </Button>
          )}
        </div>

        {/* Status Indicator */}
        {isRecording && (
          <div className="text-center">
            <Badge className="bg-civic-red text-white animate-pulse">
              🔴 Recording in progress...
            </Badge>
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Speech Transcript:</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here..."
              className="min-h-24"
            />
          </div>
        )}

        {/* Processed Report */}
        {processedData && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <h3 className="font-semibold text-primary">AI-Processed Report:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title:</label>
                <p className="font-medium">{processedData.title}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Priority:</label>
                <Badge className={getPriorityColor(processedData.priority)}>
                  {processedData.priority}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type:</label>
                <p className="font-medium capitalize">{processedData.type}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description:</label>
              <p className="mt-1 text-sm">{processedData.description}</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProcessedData(null)}>
                Cancel
              </Button>
              <Button onClick={submitReport} className="bg-civic-emerald hover:bg-civic-emerald/80">
                Submit Report
              </Button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>💡 Tip: Speak clearly and describe the problem, location, and urgency</p>
          <p>🎯 Example: "There's a broken water pipe on Main Street near the school, water is flooding the road"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceReporting;