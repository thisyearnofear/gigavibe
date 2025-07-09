import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

const UsageTracker = () => {
  return (
    <Card className="p-6 bg-white/70 backdrop-blur-sm shadow-sm border border-slate-200/50">
      <Alert variant="default" className="bg-blue-100 border-blue-300">
        <AlertCircle className="h-5 w-5 text-blue-700" />
        <AlertTitle className="text-blue-800 text-lg font-semibold">
          Analytics Coming Soon
        </AlertTitle>
        <AlertDescription className="text-blue-700">
          <p className="mb-2">
            The usage analytics feature is currently under development.
          </p>
          <p>
            This dashboard will provide detailed metrics on your AI usage,
            including costs, token consumption, and model performance.
          </p>
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Total Cost", value: "-" },
          { title: "Total Tokens", value: "-" },
          { title: "Avg Response", value: "-" },
          { title: "Requests", value: "-" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50"
          >
            <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
            <div className="text-xl font-semibold text-gray-500">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 h-60 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Model Usage</p>
            <p>Chart visualization coming soon</p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 h-60 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium mb-2">Cost Distribution</p>
            <p>Chart visualization coming soon</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UsageTracker;
