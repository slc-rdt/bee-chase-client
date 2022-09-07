import { useRef } from 'react';
import toast from 'react-hot-toast';

type LoadOptions = {
  useToast?: boolean;
};

export default function useLoading(initLoadingState: boolean, initMessage: string = '') {
  const isLoading = useRef(initLoadingState);
  const message = useRef(initMessage);

  function load(msg: string, { useToast = true }: LoadOptions = {}) {
    isLoading.current = true;
    if (useToast) toast(msg, { icon: '🔄' });
    message.current = msg;
  }

  function finish(msg: string = '', { success = true, loading = false } = {}) {
    isLoading.current = loading;
    if (msg) {
      toast.dismiss();
      if (success) toast.success(msg);
      else toast.error(msg);
    }
    message.current = msg;
  }

  return [{ isLoading: isLoading.current, message: message.current, load, finish }];
}
