import React from 'react';
import { Icons } from './Icons';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <Icons name="spinner" className={`${sizeClasses[size]} animate-spin text-orange-500`} />
      {text && <p className="mt-4 text-lg font-semibold text-white">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">{content}</div>
    );
  }

  return content;
};

export const LoadingOverlay: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};
