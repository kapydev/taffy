import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useErrorCatching = () => {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMessage =
        event instanceof ErrorEvent
          ? event.message
          : event.reason?.message || 'An async error occurred';
      toast.error(`An error occurred: ${errorMessage}`);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', errorHandler);
    };
  }, []);
};
