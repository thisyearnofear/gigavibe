'use client';

interface PitchWheelProps {
  cents: number;
  isInTune: boolean;
  isListening: boolean;
  size?: 'normal' | 'large';
}

export function PitchWheel({ cents, isInTune, isListening, size = 'normal' }: PitchWheelProps) {
  const wheelSize = size === 'large' ? 200 : 150;
  const radius = wheelSize / 2 - 20;
  const centerX = wheelSize / 2;
  const centerY = wheelSize / 2;
  
  // Calculate needle position (-50 to +50 cents maps to -90 to +90 degrees)
  const angle = Math.max(-90, Math.min(90, (cents / 50) * 90));
  const needleLength = radius - 10;
  
  // Convert angle to radians for calculation
  const angleRad = (angle * Math.PI) / 180;
  const needleX = centerX + needleLength * Math.sin(angleRad);
  const needleY = centerY - needleLength * Math.cos(angleRad);

  // Create tick marks
  const ticks = [];
  for (let i = -50; i <= 50; i += 10) {
    const tickAngle = (i / 50) * 90;
    const tickAngleRad = (tickAngle * Math.PI) / 180;
    const tickLength = i % 20 === 0 ? 15 : 8;
    const tickStartRadius = radius - tickLength;
    
    const x1 = centerX + tickStartRadius * Math.sin(tickAngleRad);
    const y1 = centerY - tickStartRadius * Math.cos(tickAngleRad);
    const x2 = centerX + radius * Math.sin(tickAngleRad);
    const y2 = centerY - radius * Math.cos(tickAngleRad);
    
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i === 0 ? '#10b981' : '#6b7280'}
        strokeWidth={i === 0 ? 3 : i % 20 === 0 ? 2 : 1}
      />
    );
  }

  // Create arc background
  const arcPath = `M ${centerX - radius * Math.sin(Math.PI / 2)} ${centerY - radius * Math.cos(Math.PI / 2)} A ${radius} ${radius} 0 0 1 ${centerX + radius * Math.sin(Math.PI / 2)} ${centerY - radius * Math.cos(Math.PI / 2)}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <svg width={wheelSize} height={wheelSize} className="drop-shadow-sm">
          {/* Background arc */}
          <path
            d={arcPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* In-tune zone */}
          <path
            d={`M ${centerX - radius * Math.sin(Math.PI / 18)} ${centerY - radius * Math.cos(Math.PI / 18)} A ${radius} ${radius} 0 0 1 ${centerX + radius * Math.sin(Math.PI / 18)} ${centerY - radius * Math.cos(Math.PI / 18)}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Tick marks */}
          {ticks}
          
          {/* Center dot */}
          <circle
            cx={centerX}
            cy={centerY}
            r="4"
            fill="#374151"
          />
          
          {/* Needle */}
          {isListening && (
            <line
              x1={centerX}
              y1={centerY}
              x2={needleX}
              y2={needleY}
              stroke={isInTune ? '#10b981' : '#f59e0b'}
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-200"
            />
          )}
          
          {/* Needle tip */}
          {isListening && (
            <circle
              cx={needleX}
              cy={needleY}
              r="3"
              fill={isInTune ? '#10b981' : '#f59e0b'}
              className="transition-all duration-200"
            />
          )}
        </svg>
        
        {/* Center status indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
            !isListening 
              ? 'bg-gray-300' 
              : isInTune 
                ? 'bg-green-500 shadow-lg shadow-green-200' 
                : 'bg-orange-500 shadow-lg shadow-orange-200'
          }`} />
        </div>
      </div>
      
      {/* Cents display */}
      <div className="text-center">
        <div className={`text-2xl font-mono font-bold transition-colors ${
          !isListening 
            ? 'text-gray-400' 
            : isInTune 
              ? 'text-green-600' 
              : 'text-orange-600'
        }`}>
          {isListening ? (cents > 0 ? '+' : '') + cents : '--'}
        </div>
        <div className="text-sm text-gray-600">cents</div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between w-full max-w-xs text-xs text-gray-500">
        <span>♭ Flat</span>
        <span className="font-medium text-green-600">Perfect</span>
        <span>Sharp ♯</span>
      </div>
    </div>
  );
}
