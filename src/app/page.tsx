'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Simple button component
const Button = ({ children, onClick, variant = "default", disabled = false, className = "" }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500";
  const variantClasses = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Simple card component
const Card = ({ children, className = "" }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 border-b border-gray-700">
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-xl font-semibold text-white">
    {children}
  </h3>
);

// Badge component
const Badge = ({ children, variant = "default" }) => {
  const variantClasses = {
    default: "bg-blue-600 text-white",
    secondary: "bg-gray-600 text-white",
    destructive: "bg-red-600 text-white",
    outline: "border border-gray-600 text-gray-300"
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
};

// Icons (using text emojis for simplicity)
const Camera = () => <span>📷</span>;
const CameraOff = () => <span>📷❌</span>;
const Video = () => <span>🎥</span>;
const VideoOff = () => <span>🎥❌</span>;
const Play = () => <span>▶️</span>;
const Pause = () => <span>⏸️</span>;
const Settings = () => <span>⚙️</span>;
const Activity = () => <span>📊</span>;
const AlertTriangle = () => <span>⚠️</span>;
const TrendingUp = () => <span>📈</span>;
const Car = () => <span>🚗</span>;
const MapPin = () => <span>📍</span>;

export default function CarOverspeedingDetection() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [speedLimit, setSpeedLimit] = useState(50);
  const [currentDetections, setCurrentDetections] = useState([]);
  const [violations, setViolations] = useState([]);
  const [fps, setFps] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const modelRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const vehicleTrackerRef = useRef(new Map());

  const initializeModel = async () => {
    try {
      setIsLoading(true);
      
      // Simulate model loading for demo
      setTimeout(() => {
        setModelLoaded(true);
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to load model:', error);
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
      setIsDetecting(false);
    }
  };

  const detectVehicles = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !modelRef.current || !isDetecting) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTimeRef.current;
    if (deltaTime > 0) {
      setFps(Math.round(1000 / deltaTime));
    }
    lastFrameTimeRef.current = currentTime;

    try {
      // Simulate detection for demo purposes
      const mockDetections = [
        {
          id: `car-${Math.random()}`,
          timestamp: new Date(),
          speed: Math.floor(Math.random() * 80) + 20,
          confidence: Math.random() * 0.3 + 0.7,
          vehicleType: ['car', 'truck', 'bus'][Math.floor(Math.random() * 3)]
        }
      ];

      // Draw mock bounding boxes
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00ff00';

      mockDetections.forEach((detection) => {
        const x = Math.random() * (canvas.width - 200);
        const y = Math.random() * (canvas.height - 150);
        const width = 200;
        const height = 150;
        
        ctx.strokeRect(x, y, width, height);
        ctx.fillText(`${detection.vehicleType} - ${detection.speed} km/h`, x, y - 5);

        if (detection.speed > speedLimit) {
          const violation = {
            id: `violation-${Date.now()}`,
            timestamp: new Date(),
            speed: detection.speed,
            speedLimit: speedLimit,
            vehicleType: detection.vehicleType,
            location: "Camera View"
          };

          setViolations(prev => [violation, ...prev].slice(0, 10));
        }
      });

      setCurrentDetections(mockDetections);

    } catch (error) {
      console.error('Detection error:', error);
    }

    animationRef.current = requestAnimationFrame(detectVehicles);
  }, [isDetecting, speedLimit]);

  const toggleDetection = () => {
    if (!isCameraOn || !modelLoaded) {
      alert('Please start camera and wait for model to load');
      return;
    }

    setIsDetecting(!isDetecting);
  };

  useEffect(() => {
    initializeModel();
    
    return () => {
      stopCamera();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isDetecting) {
      detectVehicles();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isDetecting, detectVehicles]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Car /> Real-Time Car Overspeeding Detection
          </h1>
          <p className="text-gray-300">AI-powered video analysis system for traffic monitoring</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video /> Live Video Feed
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={isCameraOn ? "default" : "secondary"}>
                      {isCameraOn ? "Camera Active" : "Camera Off"}
                    </Badge>
                    <Badge variant={isDetecting ? "destructive" : "secondary"}>
                      {isDetecting ? "Detecting" : "Idle"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                  
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <div className="text-center">
                        <VideoOff className="text-6xl mb-4 text-gray-400" />
                        <p className="text-gray-400">Camera is turned off</p>
                      </div>
                    </div>
                  )}
                  
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <div className="text-center">
                        <Activity className="text-6xl mb-4 text-blue-400 animate-pulse" />
                        <p className="text-blue-400">Loading AI Model...</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button
                    onClick={isCameraOn ? stopCamera : startCamera}
                    variant={isCameraOn ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isCameraOn ? (
                      <>
                        <CameraOff /> Stop Camera
                      </>
                    ) : (
                      <>
                        <Camera /> Start Camera
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={toggleDetection}
                    disabled={!isCameraOn || !modelLoaded}
                    variant={isDetecting ? "destructive" : "default"}
                    className="flex-1"
                  >
                    {isDetecting ? (
                      <>
                        <Pause /> Pause Detection
                      </>
                    ) : (
                      <>
                        <Play /> Start Detection
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings /> Detection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Speed Limit: {speedLimit} km/h
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="5"
                    value={speedLimit}
                    onChange={(e) => setSpeedLimit(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Model Status</span>
                  <Badge variant={modelLoaded ? "default" : "secondary"}>
                    {modelLoaded ? "Loaded" : "Loading..."}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current FPS</span>
                  <Badge variant="outline">{fps}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity /> Current Detections ({currentDetections.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto">
                  {currentDetections.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No vehicles detected</p>
                  ) : (
                    <div className="space-y-2">
                      {currentDetections.map((detection) => (
                        <div key={detection.id} className="bg-slate-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{detection.vehicleType}</span>
                            <Badge variant={detection.speed > speedLimit ? "destructive" : "secondary"}>
                              {detection.speed} km/h
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            Confidence: {Math.round(detection.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle /> Speed Violations ({violations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 overflow-y-auto">
                  {violations.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No violations detected</p>
                  ) : (
                    <div className="space-y-2">
                      {violations.slice(0, 10).map((violation) => (
                        <div key={violation.id} className="bg-red-900/20 border border-red-800 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{violation.vehicleType}</span>
                            <Badge variant="destructive">
                              {violation.speed} km/h
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            Limit: {violation.speedLimit} km/h
                          </div>
                          <div className="text-xs text-gray-400">
                            {violation.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp /> Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total Violations</span>
                  <span className="font-bold">{violations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Vehicles</span>
                  <span className="font-bold">{currentDetections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Detection Rate</span>
                  <span className="font-bold">{fps} FPS</span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-center text-sm text-gray-400">
                    <MapPin /> Camera Location: Main Road
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
