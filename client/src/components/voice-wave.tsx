import React, { useEffect, useRef, useState } from "react";

interface VoiceWaveProps {
  isActive?: boolean;
  numBars?: number;
  className?: string;
  barClassName?: string;
  // Audio analysis props
  audioIntensity?: number; // 0-1 scale
  analyzeAudio?: boolean;
  mode?: 'speaking' | 'listening' | 'inactive';
  intensityThresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Enhanced Voice Wave Animation Component with intensity-based color changes
 */
export const VoiceWave: React.FC<VoiceWaveProps> = ({
  isActive = false,
  numBars = 30,
  className = "",
  barClassName = "",
  audioIntensity = -1, // -1 means auto-generate intensity values
  analyzeAudio = false,
  mode = 'inactive',
  intensityThresholds = { low: 0.2, medium: 0.5, high: 0.8 }
}) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [averageIntensity, setAverageIntensity] = useState<number>(0);
  const [intensityLevel, setIntensityLevel] = useState<'low' | 'medium' | 'high'>('low');
  
  // Function to get color based on intensity and mode
  const getBarGradient = (intensity: number, mode: string): string => {
    if (mode === 'speaking') {
      if (intensity >= intensityThresholds.high) {
        return 'bg-gradient-to-t from-purple-600 via-purple-400 to-purple-300';
      } else if (intensity >= intensityThresholds.medium) {
        return 'bg-gradient-to-t from-purple-500 via-purple-400 to-purple-200';
      } else {
        return 'bg-gradient-to-t from-purple-400 via-purple-300 to-purple-100';
      }
    } else if (mode === 'listening') {
      if (intensity >= intensityThresholds.high) {
        return 'bg-gradient-to-t from-blue-600 via-blue-400 to-blue-300';
      } else if (intensity >= intensityThresholds.medium) {
        return 'bg-gradient-to-t from-blue-500 via-blue-400 to-blue-200';
      } else {
        return 'bg-gradient-to-t from-blue-400 via-blue-300 to-blue-100';
      }
    } else {
      return 'bg-white/30'; 
    }
  };

  // Set up audio analyzer
  useEffect(() => {
    if (analyzeAudio && isActive) {
      let audioContext: AudioContext | null = null;
      let analyzerNode: AnalyserNode | null = null;
      let microphone: MediaStreamAudioSourceNode | null = null;
      
      const initAudioAnalyzer = async () => {
        try {
          // Get microphone access
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Create audio context and analyzer
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          analyzerNode = audioContext.createAnalyser();
          analyzerNode.fftSize = 256;
          
          // Create buffer for frequency data
          const bufferLength = analyzerNode.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          // Connect microphone to analyzer
          microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyzerNode);
          
          // Store references
          analyzerRef.current = analyzerNode;
          dataArrayRef.current = dataArray;
        } catch (error) {
          console.error("Failed to access microphone:", error);
        }
      };
      
      initAudioAnalyzer();
      
      // Clean up
      return () => {
        if (microphone) microphone.disconnect();
        if (audioContext) audioContext.close();
        analyzerRef.current = null;
        dataArrayRef.current = null;
      };
    }
  }, [analyzeAudio, isActive]);

  // Animation effect
  useEffect(() => {
    if (!isActive) {
      // Reset bars
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "10%";
        if (bar) bar.className = bar.className.replace(/bg-gradient-to-t from-.*? to-.*?/, 'bg-white/30');
      });
      return;
    }
    
    // Create array of bars with refs
    barsRef.current = Array(numBars).fill(null);
    
    // Function to analyze audio and update visualization
    const analyzeAndAnimate = () => {
      // Get real audio data if available
      let intensityValues: number[] = [];
      
      if (analyzeAudio && analyzerRef.current && dataArrayRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current);
        const data = dataArrayRef.current;
        
        // Calculate scaled intensity values for each bar
        const step = Math.floor(data.length / numBars);
        for (let i = 0; i < numBars; i++) {
          const dataIndex = i * step;
          if (dataIndex < data.length) {
            // Normalize to 0-1 scale
            intensityValues[i] = data[dataIndex] / 255;
          } else {
            intensityValues[i] = 0;
          }
        }
        
        // Calculate average intensity
        const sum = intensityValues.reduce((a, b) => a + b, 0);
        const newAvgIntensity = sum / intensityValues.length;
        setAverageIntensity(newAvgIntensity);
        
        // Set intensity level based on thresholds
        if (newAvgIntensity >= intensityThresholds.high) {
          setIntensityLevel('high');
        } else if (newAvgIntensity >= intensityThresholds.medium) {
          setIntensityLevel('medium');
        } else {
          setIntensityLevel('low');
        }
      } else {
        // Generate simulated intensity values if no audio analysis
        intensityValues = Array.from({ length: numBars }, (_, index) => {
          const centerIndex = Math.floor(numBars / 2);
          const distanceFromCenter = Math.abs(index - centerIndex);
          const maxHeightFactor = 1 - (distanceFromCenter / centerIndex) * 0.6;
          
          // Calculate a random height with distribution weighted toward center
          const minIntensity = 0.1;
          const randomFactor = Math.random() * 0.6 + 0.2; // Random between 0.2-0.8
          return minIntensity + randomFactor * maxHeightFactor * (1 - minIntensity);
        });
        
        // Simulate intensity changes
        const simulatedIntensity = Math.random() * 0.7 + 0.3; // Random between 0.3-1.0
        setAverageIntensity(simulatedIntensity);
        
        // Set intensity level
        if (simulatedIntensity >= intensityThresholds.high) {
          setIntensityLevel('high');
        } else if (simulatedIntensity >= intensityThresholds.medium) {
          setIntensityLevel('medium');
        } else {
          setIntensityLevel('low');
        }
      }
      
      // Apply intensity values to bars
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        // Use provided or generated intensity value
        let intensity = audioIntensity >= 0 ? audioIntensity : intensityValues[index];
        
        // Scale intensity to height percentage
        const minHeight = 10;
        const heightPercentage = minHeight + intensity * (100 - minHeight);
        
        // Apply height with smooth transition
        bar.style.height = `${heightPercentage}%`;
        
        // Apply color based on intensity and mode
        const newClass = getBarGradient(intensity, mode);
        
        // Update class if changed
        if (!bar.className.includes(newClass)) {
          // Remove existing gradient classes and add new one
          bar.className = bar.className.replace(/bg-gradient-to-t from-.*? (via-.*? )?to-.*?/, newClass);
        }
        
        // Apply opacity based on intensity
        bar.style.opacity = (0.5 + intensity * 0.5).toString();
      });
      
      // Continue animation
      animationRef.current = requestAnimationFrame(analyzeAndAnimate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(analyzeAndAnimate);
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationRef.current);
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "10%";
      });
    };
  }, [isActive, numBars, audioIntensity, analyzeAudio, mode, intensityThresholds]);

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`flex items-end justify-center gap-[2px] h-20 ${className}`}
        aria-label="Voice visualization"
        role="img"
      >
        {Array.from({ length: numBars }).map((_, index) => (
          <div
            key={index}
            ref={el => barsRef.current[index] = el}
            className={`w-[3px] rounded-full transition-all duration-100 ease-out
              ${isActive ? getBarGradient(averageIntensity, mode) : 'bg-white/30'} 
              ${barClassName}`}
            style={{
              height: '10%',
              opacity: isActive ? Math.max(0.5, averageIntensity) : 0.5
            }}
          />
        ))}
      </div>
      {isActive && (
        <div className="text-xs font-mono mt-1 text-slate-500">
          {mode === 'listening' ? 'Listening...' : mode === 'speaking' ? 'Speaking...' : 'Inactive'}
        </div>
      )}
    </div>
  );
};

export default VoiceWave;