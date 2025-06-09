import { Play } from "lucide-react";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-netflix-dark/90 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-netflix-red/30 border-t-netflix-red rounded-full animate-spin mx-auto mb-4"></div>
          <Play className="text-netflix-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" size={24} />
        </div>
        <p className="text-netflix-text text-lg font-medium">Carregando conteúdo...</p>
        <p className="netflix-text-secondary text-sm mt-2">Preparando sua experiência de aprendizado</p>
      </div>
    </div>
  );
}
