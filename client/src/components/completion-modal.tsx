import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import type { LessonWithProgress } from "@shared/schema";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: LessonWithProgress | null;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

export default function CompletionModal({ 
  isOpen, 
  onClose, 
  lesson, 
  onNextLesson,
  hasNextLesson = false 
}: CompletionModalProps) {
  if (!lesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-netflix-gray border-netflix-light-gray max-w-sm sm:max-w-md mx-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-netflix-text text-lg sm:text-xl mb-4">
            <CheckCircle className="text-green-500 mr-2 sm:mr-3" size={24} />
            <span className="hidden sm:inline">Aula Concluída!</span>
            <span className="sm:hidden">Concluída!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-netflix-text mb-2">
              {lesson.title}
            </h3>
            <p className="netflix-text-secondary text-sm sm:text-base">
              Parabéns! Você concluiu esta aula com sucesso.
            </p>
          </div>

          <div className="flex flex-col gap-3 ml-[83px] mr-[83px]">
            {hasNextLesson && onNextLesson && (
              <Button
                onClick={() => {
                  onNextLesson();
                  onClose();
                }}
                className="w-full bg-netflix-red hover:bg-red-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
              >
                <ArrowRight className="mr-2" size={16} />
                <span className="hidden sm:inline">Próxima Aula</span>
                <span className="sm:hidden">Próxima</span>
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full bg-netflix-light-gray hover:bg-netflix-text-secondary text-netflix-text hover:text-netflix-dark py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 font-medium text-sm sm:text-base"
            >
              <Home className="mr-2" size={16} />
              <span className="hidden sm:inline">Continuar Assistindo</span>
              <span className="sm:hidden">Continuar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}