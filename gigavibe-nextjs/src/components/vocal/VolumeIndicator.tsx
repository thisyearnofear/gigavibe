'use client';

interface VolumeIndicatorProps {
  volume: number;
  isListening: boolean;
  showLabel?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export function VolumeIndicator({ 
  volume, 
  isListening, 
  showLabel = false,
  orientation = 'horizontal'
}: VolumeIndicatorProps) {
  const normalizedVolume = Math.min(100, Math.max(0, volume));
  const volumeLevel = normalizedVolume / 100;
  
  // Determine volume level for color coding
  const getVolumeColor = () => {
    if (!isListening) return 'bg-gray-300';
    if (normalizedVolume < 20) return 'bg-red-400';
    if (normalizedVolume < 40) return 'bg-orange-400';
    if (normalizedVolume < 80) return 'bg-green-400';
    return 'bg-blue-400';
  };

  const getVolumeStatus = () => {
    if (!isListening) return 'Silent';
    if (normalizedVolume < 20) return 'Too Quiet';
    if (normalizedVolume < 40) return 'Quiet';
    if (normalizedVolume < 80) return 'Good';
    return 'Loud';
  };

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center space-y-2">
        {showLabel && (
          <div className="text-sm font-medium text-gray-700">Volume</div>
        )}
        
        <div className="relative w-6 h-32 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-all duration-200 ${getVolumeColor()}`}
            style={{ height: `${volumeLevel * 100}%` }}
          />
          
          {/* Volume level indicators */}
          <div className="absolute inset-0 flex flex-col justify-between py-1">
            {[80, 60, 40, 20].map((level) => (
              <div 
                key={level}
                className="w-full h-px bg-white/50"
              />
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-700">
            {Math.round(normalizedVolume)}%
          </div>
          <div className="text-xs text-gray-600">
            {getVolumeStatus()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Volume</span>
          <span className="text-sm text-gray-600">{getVolumeStatus()}</span>
        </div>
      )}
      
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`absolute left-0 top-0 bottom-0 transition-all duration-200 ${getVolumeColor()}`}
          style={{ width: `${volumeLevel * 100}%` }}
        />
        
        {/* Volume level indicators */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {[20, 40, 60, 80].map((level) => (
            <div 
              key={level}
              className="w-px h-full bg-white/50"
            />
          ))}
        </div>
        
        {/* Current volume indicator */}
        {isListening && (
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white/80 transition-all duration-200"
            style={{ left: `${volumeLevel * 100}%` }}
          />
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Quiet</span>
        <span className="font-medium">{Math.round(normalizedVolume)}%</span>
        <span>Loud</span>
      </div>
    </div>
  );
}
