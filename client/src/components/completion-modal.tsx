import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, SkipForward, Home } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
      <DialogContent className="bg-netflix-gray border-green-500/30 max-w-sm sm:max-w-md mx-3 sm:mx-auto">
        <VisuallyHidden>
          <DialogTitle>Aula Concluída</DialogTitle>
          <DialogDescription>Modal de conclusão de aula</DialogDescription>
        </VisuallyHidden>
        <div className="text-center p-3 sm:p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Check className="text-green-400" size={24} />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-netflix-text mb-2">Parabéns! 🎉</h3>
          <p className="netflix-text-secondary mb-4 sm:mb-6 text-sm sm:text-base">
            Você concluiu a aula "{lesson.title}"
          </p>
          
          <div className="space-y-2 sm:space-y-3">
            <Button 
              onClick={onNextLesson}
              className="w-full bg-netflix-red hover:bg-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <SkipForward className="mr-2" size={16} />
              Próxima Aula
            </Button>
            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full bg-netflix-light-gray hover:bg-netflix-text-secondary text-netflix-text hover:text-netflix-dark py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <Home className="mr-2" size={16} />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
