'use client';

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          fontFamily: 'inherit',
          direction: 'rtl',
        },
        success: {
          style: {
            background: '#059669', // Emerald 600
          },
        },
        error: {
          style: {
            background: '#dc2626', // Red 600
          },
        },
      }}
    />
  );
}
