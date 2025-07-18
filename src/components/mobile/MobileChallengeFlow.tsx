import React from "react";
import { Challenge } from "../../types/challenge.types";

interface MobileChallengeFlowProps {
  challenge: Challenge;
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

/**
 * MobileChallengeFlow - A streamlined, single-page challenge flow optimized for mobile devices
 *
 * This component is currently a placeholder and will be implemented in a future update.
 */
const MobileChallengeFlow: React.FC<MobileChallengeFlowProps> = ({
  challenge,
  onComplete,
  onCancel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h2 className="text-2xl font-bold text-white mb-4">{challenge.title}</h2>
      <p className="text-slate-400 mb-6 text-center">
        Mobile challenge flow is coming soon!
      </p>
      <button
        onClick={onCancel}
        className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
};

export default MobileChallengeFlow;
