import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { progressService } from "@/lib/progress";
import { queryClient } from "@/lib/queryClient";
import { Play, Pause, SkipBack, SkipForward, Maximize, Check } from "lucide-react";
import type { LessonWithProgress } from "@shared/schema";

interface VideoPlayerProps {
  lesson: LessonWithProgress;
  onComplete: () => void;
}

export default function VideoPlayer({ lesson, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);

  const completeLessonMutation = useMutation({
    mutationFn: () => progressService.markLessonComplete(lesson.id, lesson.moduleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      onComplete();
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: (progressPercentage: number) => 
      progressService.updateProgress(lesson.id, lesson.moduleId, progressPercentage),
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setCurrentTime(video.currentTime);
      setProgress(currentProgress);
      
      // Update progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0) {
        updateProgressMutation.mutate(currentProgress);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [lesson.id, lesson.moduleId, updateProgressMutation]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    // Check if fullscreen is supported before trying to use it
    if (video.requestFullscreen) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        video.requestFullscreen().catch(() => {
          // Fallback: just maximize the video within its container
          console.log("Fullscreen not supported in this environment");
        });
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="lg:col-span-2">
      <Card className="bg-netflix-gray shadow-2xl">
        <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
          <video
            ref={videoRef}
            src={lesson.videoUrl || undefined}
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          
          {/* Custom Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-4">
            <div className="mb-2">
              <Progress value={progress} className="h-1" />
            </div>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:text-netflix-red hover:bg-transparent p-1 sm:p-2"
                >
                  <SkipBack size={16} className="sm:w-5 sm:h-5" />
                </Button>
                <Button
                  onClick={togglePlay}
                  className="bg-netflix-red hover:bg-red-700 rounded-full p-2 sm:p-3"
                >
                  {isPlaying ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => skipTime(10)}
                  className="text-white hover:text-netflix-red hover:bg-transparent p-1 sm:p-2"
                >
                  <SkipForward size={16} className="sm:w-5 sm:h-5" />
                </Button>
                <span className="text-xs sm:text-sm hidden sm:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <select 
                  value={playbackRate}
                  onChange={(e) => changePlaybackRate(Number(e.target.value))}
                  className="bg-black/50 text-white text-xs sm:text-sm rounded px-1 sm:px-2 py-1 border-none"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-netflix-red hover:bg-transparent p-1 sm:p-2"
                >
                  <Maximize size={16} className="sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-netflix-text mb-2">{lesson.title}</h4>
              <p className="netflix-text-secondary mb-4">{lesson.description}</p>
            </div>
            <Button
              onClick={() => completeLessonMutation.mutate()}
              disabled={completeLessonMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white ml-4"
            >
              <Check className="mr-2" size={16} />
              {completeLessonMutation.isPending ? "Salvando..." : "Marcar como Concluída"}
            </Button>
          </div>
          
          {/* Lesson Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="netflix-text-secondary">Progresso da Aula</span>
              <span className="text-netflix-red font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
