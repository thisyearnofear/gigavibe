import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useIsMobile } from "../../hooks/use-mobile";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useToast } from "../../hooks/use-toast";
import { Mic, Music, Trophy, Coins, ArrowRight, Check, X } from "lucide-react";

// Define the onboarding stages
type OnboardingStage = "guest" | "email" | "web3" | "complete";

// Define feature sets available at each stage
interface FeatureSet {
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
}

const ProgressiveOnboarding = () => {
  const [stage, setStage] = useState<OnboardingStage>("guest");
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [progress, setProgress] = useState(25);
  const isMobile = useIsMobile();
  const { completeOnboarding } = useOnboarding();
  const { toast } = useToast();

  // Features available at each stage
  const featureSets: Record<OnboardingStage, FeatureSet[]> = {
    guest: [
      {
        title: "Browse Challenges",
        description: "Discover vocal challenges and listen to performances",
        icon: <Music className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Vote on Performances",
        description: "Rate other singers and help discover talent",
        icon: <Trophy className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Record Performances",
        description: "Participate in challenges and show your talent",
        icon: <Mic className="h-6 w-6 text-muted-foreground" />,
        available: false,
      },
      {
        title: "Mint Performance Coins",
        description: "Create tokens for your performances and earn",
        icon: <Coins className="h-6 w-6 text-muted-foreground" />,
        available: false,
      },
    ],
    email: [
      {
        title: "Browse Challenges",
        description: "Discover vocal challenges and listen to performances",
        icon: <Music className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Vote on Performances",
        description: "Rate other singers and help discover talent",
        icon: <Trophy className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Record Performances",
        description: "Participate in challenges and show your talent",
        icon: <Mic className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Mint Performance Coins",
        description: "Create tokens for your performances and earn",
        icon: <Coins className="h-6 w-6 text-muted-foreground" />,
        available: false,
      },
    ],
    web3: [
      {
        title: "Browse Challenges",
        description: "Discover vocal challenges and listen to performances",
        icon: <Music className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Vote on Performances",
        description: "Rate other singers and help discover talent",
        icon: <Trophy className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Record Performances",
        description: "Participate in challenges and show your talent",
        icon: <Mic className="h-6 w-6 text-primary" />,
        available: true,
      },
      {
        title: "Mint Performance Coins",
        description: "Create tokens for your performances and earn",
        icon: <Coins className="h-6 w-6 text-primary" />,
        available: true,
      },
    ],
    complete: [],
  };

  // Update progress based on stage
  useEffect(() => {
    switch (stage) {
      case "guest":
        setProgress(25);
        break;
      case "email":
        setProgress(50);
        break;
      case "web3":
        setProgress(75);
        break;
      case "complete":
        setProgress(100);
        break;
    }
  }, [stage]);

  // Handle stage progression
  const advanceStage = () => {
    switch (stage) {
      case "guest":
        setStage("email");
        break;
      case "email":
        // Validate email before proceeding
        if (email && email.includes("@")) {
          handleEmailSignup();
          setStage("web3");
        } else {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
        }
        break;
      case "web3":
        setStage("complete");
        completeOnboarding();
        setIsOpen(false);
        break;
      case "complete":
        setIsOpen(false);
        break;
    }
  };

  // Handle email signup
  const handleEmailSignup = async () => {
    try {
      // In a real implementation, this would call your API to register the email
      toast({
        title: "Success!",
        description: "Your account has been created",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Skip to guest mode
  const skipToGuest = () => {
    setStage("guest");
    setIsOpen(false);
    toast({
      title: "Welcome to Guest Mode",
      description: "You can browse and vote on performances",
    });
  };

  // Skip to full experience (for experienced users)
  const skipToFull = () => {
    setStage("web3");
    // This would typically trigger your Web3 auth flow
  };

  // Close onboarding and continue as guest
  const closeOnboarding = () => {
    setIsOpen(false);
    if (stage === "guest") {
      toast({
        title: "Continuing as Guest",
        description: "You can browse and vote on performances",
      });
    }
  };

  // Render stage content
  const renderStageContent = () => {
    switch (stage) {
      case "guest":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Welcome to Gigavibe
              </DialogTitle>
              <DialogDescription>
                Discover, vote, and participate in vocal challenges. No account
                required to start.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <h3 className="font-medium">Available as Guest:</h3>
              {featureSets.guest.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {feature.available ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={skipToGuest}>
                Continue as Guest
              </Button>
              <Button onClick={advanceStage}>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );

      case "email":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Create Your Account
              </DialogTitle>
              <DialogDescription>
                Sign up to record your own performances and participate in
                challenges
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <h3 className="font-medium pt-2">Unlock These Features:</h3>
              {featureSets.email.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {feature.available ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStage("guest")}>
                Back
              </Button>
              <Button onClick={advanceStage}>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        );

      case "web3":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Connect Wallet (Optional)
              </DialogTitle>
              <DialogDescription>
                Connect your wallet to mint performance coins and access the
                full Gigavibe experience
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <h3 className="font-medium">Unlock the Full Experience:</h3>
              {featureSets.web3.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  {feature.available ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  You can always connect your wallet later from your profile
                  settings.
                </p>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setStage("email")}>
                Back
              </Button>
              <Button variant="outline" onClick={advanceStage}>
                Skip for Now
              </Button>
              <Button
                onClick={() => {
                  // This would typically trigger your Web3 auth flow
                  toast({
                    title: "Wallet Connection",
                    description: "Wallet connection dialog would appear here",
                  });
                  setTimeout(() => advanceStage(), 1000);
                }}
              >
                Connect Wallet
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return null;
    }
  };

  // Use Dialog for desktop and Sheet for mobile
  return (
    <>
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader className="mb-4">
              <div className="w-full mb-4">
                <Progress value={progress} className="h-2" />
              </div>
            </SheetHeader>
            {renderStageContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isOpen} onOpenChange={closeOnboarding}>
          <DialogContent className="sm:max-w-[500px]">
            <div className="w-full mb-4">
              <Progress value={progress} className="h-2" />
            </div>
            {renderStageContent()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ProgressiveOnboarding;
