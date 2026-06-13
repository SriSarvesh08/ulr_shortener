const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin`}
        />
      </div>
      {text && <p className="text-sm text-zinc-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
