import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, SkipForward, Home } from "lucide-react";
import type { LessonWithProgress } from "@shared/schema";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonWithProgress | null;
  onNextLesson: () => void;
}

export default function CompletionModal({ isOpen, onClose, lesson, onNextLesson }: CompletionModalProps) {
  if (!lesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-netflix-gray border-green-500/30 max-w-md">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="text-green-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-netflix-text mb-2">Parabéns! 🎉</h3>
          <p className="netflix-text-secondary mb-6">
            Você concluiu a aula "{lesson.title}"
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={onNextLesson}
              className="w-full bg-netflix-red hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              <SkipForward className="mr-2" size={18} />
              Próxima Aula
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full bg-netflix-light-gray hover:bg-netflix-text-secondary text-netflix-text hover:text-netflix-dark py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              <Home className="mr-2" size={18} />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
