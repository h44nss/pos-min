import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info';

interface AlertModalProps {
  isOpen: boolean;
  type?: AlertType;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, type = 'info', title, message, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Info;
  const colorClass = type === 'success' ? 'text-green-600 bg-green-100' : type === 'error' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          
          <div className={`w-16 h-16 ${colorClass} rounded-full mx-auto mb-4 flex items-center justify-center`}>
            <Icon className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          
          <button 
            onClick={onClose}
            className="w-full bg-[#8B5E3C] hover:bg-[#6F4A2E] text-white py-3 rounded-xl font-medium transition-colors"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
