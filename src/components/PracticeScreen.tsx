import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PracticeScreen = () => {
  return (
    <div className="space-y-6 p-6">
      <Alert variant="default" className="bg-purple-100 border-purple-300">
        <AlertCircle className="h-5 w-5 text-purple-700" />
        <AlertTitle className="text-purple-800 text-lg font-semibold">
          Feature Coming Soon
        </AlertTitle>
        <AlertDescription className="text-purple-700">
          <p className="mb-2">
            The practice exercises feature is currently under development.
          </p>
          <p>
            This section will allow you to practice vocal exercises, track your
            progress, and improve your singing skills.
          </p>
        </AlertDescription>
      </Alert>

      <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
          Practice Session
        </h2>

        <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-8 mb-4 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-purple-600 mb-3">
              Coming Soon
            </h3>
            <p className="text-gray-600">
              Personalized vocal exercises based on your skill level and
              progress will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;
