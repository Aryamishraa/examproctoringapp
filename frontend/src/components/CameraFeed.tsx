import React, { useRef, useEffect, useState } from 'react';
import { Camera, AlertTriangle } from 'lucide-react';
import { studentMonitoringService } from '../services/StudentMonitoringService';
import { User } from '../App';

interface CameraFeedProps {
  user?: User;
  onCameraStatusChange?: (status: boolean) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ user, onCameraStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [faceDetected, setFaceDetected] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [lastVisibilityStatus, setLastVisibilityStatus] = useState(true);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setIsActive(true);
          onCameraStatusChange?.(true);
          setError('');
          // Register stream and video element with monitoring service for real snapshot capture
          if (user?.studentId) {
            try {
              studentMonitoringService.registerStudentVideoStream(user.studentId, mediaStream);
              if (videoRef.current) {
                studentMonitoringService.registerStudentVideoElement(user.studentId, videoRef.current);
              }
            } catch (err) {
              console.warn('Could not register video stream with monitoring service', err);
            }
          }
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Camera access denied. Please allow camera permissions for exam monitoring.');
        setIsActive(false);
        onCameraStatusChange?.(false);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        // Unregister from monitoring service and stop tracks
        if (user?.studentId) {
          try {
            studentMonitoringService.unregisterStudentVideoStream(user.studentId);
            studentMonitoringService.unregisterStudentVideoElement(user.studentId);
          } catch (err) {
            console.warn('Error unregistering video from monitoring service', err);
          }
        }
        stream.getTracks().forEach(track => track.stop());
        onCameraStatusChange?.(false);
      }
    };
  }, []);

  useEffect(() => {
    // Monitor stream state - detect when video tracks are stopped
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const onTrackEnded = () => {
          setIsActive(false);
          onCameraStatusChange?.(false);
        };
        
        videoTrack.addEventListener('ended', onTrackEnded);
        return () => videoTrack.removeEventListener('ended', onTrackEnded);
      }
    }
  }, [stream, onCameraStatusChange]);

  useEffect(() => {
    // Face detection using experimental FaceDetector API when available,
    // otherwise fall back to simple 90% random simulation.
    if (isActive) {
      let interval: number;
      const canvas = document.createElement('canvas');
      const detector: any = ('FaceDetector' in window) ? new (window as any).FaceDetector() : null;

      let consecutiveMisses = 0;
      let consecutiveHits = 0;

      const checkFrame = async () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);

        let faceFound = false;
        if (detector) {
          try {
            const faces = await detector.detect(canvas);
            faceFound = faces.length > 0;
          } catch {
            faceFound = false; // Fallback to false so detection accurately fails if face cannot be found
          }
        } else {
          faceFound = false; // Fallback to false if API not supported
        }

        if (!faceFound) {
          consecutiveMisses++;
          consecutiveHits = 0;
        } else {
          consecutiveHits++;
          consecutiveMisses = 0;
        }

        // Debounce face detection to prevent rapid fluctuating statuses
        if (consecutiveMisses >= 5) {
          setFaceDetected(prev => {
            if (prev && user?.studentId) {
              studentMonitoringService.recordActivity(
                user.studentId,
                'student_not_visible',
                'Student not visible in camera',
                'high'
              );
            }
            return false;
          });
        } else if (consecutiveHits >= 3) {
          setFaceDetected(prev => {
            if (!prev && user?.studentId) {
              studentMonitoringService.recordActivity(
                user.studentId,
                'camera_on',
                'Student visible in camera',
                'low'
              );
            }
            return true;
          });
        }
      };

      interval = window.setInterval(checkFrame, 400); // slightly slower check to save CPU and aid debounce

      return () => clearInterval(interval);
    }
  }, [isActive, user?.studentId]);

  if (error) {
    return (
      <div className="relative">
        <div className="w-full h-32 bg-red-100 rounded-lg overflow-hidden relative flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-red-600 px-2">{error}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-center text-red-600">
          ⚠ Camera Required for Exam
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full h-32 bg-gray-900 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Face detection overlay */}
        {faceDetected && isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-24 border-2 border-green-400 rounded-lg relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-green-400"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-green-400"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-green-400"></div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-green-400"></div>
            </div>
          </div>
        )}
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex space-x-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span className="text-xs text-white font-medium">
            {isActive ? 'RECORDING' : 'OFFLINE'}
          </span>
        </div>

        {/* Recording indicator */}
        {isActive && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">REC</span>
            </div>
          </div>
        )}
      </div>
      
      <div className={`mt-2 text-xs text-center font-medium ${
        faceDetected && isActive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isActive ? (
          faceDetected ? '✓ Face Detected' : '⚠ No Face Detected'
        ) : (
          '⚠ Camera Offline'
        )}
      </div>
    </div>
  );
};

export default CameraFeed;