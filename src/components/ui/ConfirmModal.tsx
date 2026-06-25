import { HelpCircle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Ya, Lanjutkan', 
  cancelText = 'Batal',
  isDestructive = false,
  isLoading = false,
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center relative">
          <button onClick={onCancel} disabled={isLoading} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 bg-[#FFB300]/20 text-[#C27F1C] rounded-full mx-auto mb-4 flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-medium flex justify-center items-center gap-2 transition-colors disabled:opacity-70 ${
                isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-[#8B5E3C] hover:bg-[#6F4A2E]'
              }`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
