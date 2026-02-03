import { BadgeCheck, BadgeInfo, BellRing } from 'lucide-react';
import { toast } from 'sonner';

export function toastInfo(title: string, description: string) {
  toast.info(title, {
    description,
    icon: <BadgeInfo className="text-blue-500 animate-scale-pulse" size={16} />,
    closeButton: true,
    duration: 5000,
  });
}

export function toastUpdateToDate(title: string, description: string) {
  toast.info(title, {
    description,
    icon: (
      <BadgeCheck className="text-green-600 animate-scale-pulse" size={16} />
    ),
    closeButton: true,
    duration: 5000,
  });
}

export function toastSuccess(title: string, description: string) {
  toast.success(title, {
    description,
    icon: <BellRing size={15} className="text-green-600 animate-bell-shake" />,
    closeButton: true,
    duration: 3600 * 1000,
  });
}
