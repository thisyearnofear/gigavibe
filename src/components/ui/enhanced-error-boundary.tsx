import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Music, Mic, Coins } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Badge } from './badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

// Define different types of errors the boundary can handle
export type ErrorType = 
  | 'web3'        // Web3 connection/transaction errors
  | 'farcaster'   // Farcaster API issues
  | 'zora'        // Zora protocol issues
  | 'ipfs'        // IPFS/FileCDN storage issues
  | 'audio'       // Audio recording/playback issues
  | 'general'     // General application errors
  | 'network';    // Network connectivity issues

// Service status types
export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown';

// Props for the enhanced error boundary
interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorType: ErrorType) => void;
  onRetry?: () => void;
  serviceStatuses?: Record<string, ServiceStatus>;
  showReportButton?: boolean;
  showRetryButton?: boolean;
  className?: string;
}

// State for the enhanced error boundary
interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: ErrorType;
  isRetrying: boolean;
  isReporting: boolean;
  expandedDetails: boolean;
}

/**
 * EnhancedErrorBoundary - A comprehensive error boundary that handles various
 * service failures gracefully and provides appropriate fallback UIs
 */
class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: 'general',
      isRetrying: false,
      isReporting: false,
      expandedDetails: false,
    };
  }

  // Detect errors during render
  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return { hasError: true, error };
  }

  // Handle caught errors
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Determine error type based on error message or stack trace
    const errorType = this.determineErrorType(error);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorType,
    });
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorType);
    }
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error caught by EnhancedErrorBoundary:', error, errorInfo);
    }
    
    // In production, this would send to error monitoring service
    this.logErrorToMonitoring(error, errorInfo, errorType);
  }

  // Determine the type of error based on message and stack
  private determineErrorType(error: Error): ErrorType {
    const errorString = error.message + (error.stack || '');
    
    if (/wallet|ethereum|web3|metamask|connect|sign|transaction/i.test(errorString)) {
      return 'web3';
    }
    
    if (/farcaster|cast|frame|neynar/i.test(errorString)) {
      return 'farcaster';
    }
    
    if (/zora|coin|mint|token|contract/i.test(errorString)) {
      return 'zora';
    }
    
    if (/ipfs|filecoin|storage|upload|cdn|grove/i.test(errorString)) {
      return 'ipfs';
    }
    
    if (/audio|record|microphone|playback|sound|media/i.test(errorString)) {
      return 'audio';
    }
    
    if (/network|fetch|api|timeout|offline/i.test(errorString)) {
      return 'network';
    }
    
    return 'general';
  }

  // Log error to monitoring service (placeholder)
  private logErrorToMonitoring(error: Error, errorInfo: ErrorInfo, errorType: ErrorType): void {
    // In a real implementation, this would send to Sentry, LogRocket, etc.
    // Example:
    // Sentry.captureException(error, {
    //   extra: {
    //     componentStack: errorInfo.componentStack,
    //     errorType,
    //   },
    //   tags: {
    //     errorType,
    //   },
    // });
  }

  // Handle retry button click
  private handleRetry = (): void => {
    this.setState({ isRetrying: true });
    
    // Call onRetry callback if provided
    if (this.props.onRetry) {
      Promise.resolve(this.props.onRetry())
        .then(() => {
          // Reset error state after successful retry
          this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            isRetrying: false,
          });
        })
        .catch((error) => {
          // Update error if retry failed
          this.setState({
            error,
            errorType: this.determineErrorType(error),
            isRetrying: false,
          });
        });
    } else {
      // Default behavior: just reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      });
    }
  };

  // Handle report button click
  private handleReport = (): void => {
    this.setState({ isReporting: true });
    
    // Simulate reporting process
    setTimeout(() => {
      this.setState({ isReporting: false });
      // Show toast or notification that error was reported
    }, 1000);
  };

  // Toggle expanded error details
  private toggleDetails = (): void => {
    this.setState(prevState => ({
      expandedDetails: !prevState.expandedDetails,
    }));
  };

  // Get service status badge
  private renderStatusBadge(status: ServiceStatus): ReactNode {
    switch (status) {
      case 'operational':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Degraded</Badge>;
      case 'down':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Down</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Unknown</Badge>;
    }
  }

  // Render appropriate error message based on error type
  private renderErrorMessage(): ReactNode {
    const { error, errorType } = this.state;
    const { serviceStatuses } = this.props;
    
    // Default error messages by type
    const errorMessages: Record<ErrorType, { title: string; description: string; icon: ReactNode }> = {
      web3: {
        title: 'Web3 Connection Issue',
        description: 'We couldn\'t connect to your wallet or blockchain services. Some features like minting Performance Coins may be unavailable.',
        icon: <Coins className="h-6 w-6 text-yellow-600" />,
      },
      farcaster: {
        title: 'Farcaster Connection Issue',
        description: 'We\'re having trouble connecting to Farcaster. Social sharing and discovery features may be limited.',
        icon: <Wifi className="h-6 w-6 text-yellow-600" />,
      },
      zora: {
        title: 'Zora Protocol Issue',
        description: 'We\'re having trouble connecting to Zora. Performance Coins and trading features may be unavailable.',
        icon: <Coins className="h-6 w-6 text-yellow-600" />,
      },
      ipfs: {
        title: 'Storage Connection Issue',
        description: 'We\'re having trouble with our decentralized storage. Uploading and accessing some audio files may be affected.',
        icon: <WifiOff className="h-6 w-6 text-yellow-600" />,
      },
      audio: {
        title: 'Audio System Issue',
        description: 'We\'re having trouble with audio recording or playback. Please check your microphone permissions and try again.',
        icon: <Mic className="h-6 w-6 text-yellow-600" />,
      },
      network: {
        title: 'Network Connection Issue',
        description: 'We\'re having trouble connecting to our servers. Please check your internet connection.',
        icon: <WifiOff className="h-6 w-6 text-yellow-600" />,
      },
      general: {
        title: 'Something Went Wrong',
        description: 'We\'ve encountered an unexpected error. Our team has been notified.',
        icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      },
    };
    
    const errorDetails = errorMessages[errorType];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {errorDetails.icon}
          <h3 className="text-lg font-medium">{errorDetails.title}</h3>
        </div>
        
        <p className="text-muted-foreground">{errorDetails.description}</p>
        
        {/* Show specific error message if available */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2 font-mono text-xs">
              {error.message}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Show service statuses if available */}
        {serviceStatuses && Object.keys(serviceStatuses).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Service Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(serviceStatuses).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span className="text-sm">{service}</span>
                  {this.renderStatusBadge(status)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render alternative content based on error type
  private renderAlternativeContent(): ReactNode {
    const { errorType } = this.state;
    
    // Show different alternative content based on error type
    switch (errorType) {
      case 'web3':
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Continue in Guest Mode</CardTitle>
              <CardDescription>
                You can still use most features without connecting a wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-green-600" />
                  <span>Browse and listen to challenges</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4 text-green-600" />
                  <span>Record your performances</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-muted-foreground">Mint Performance Coins (requires wallet)</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={this.handleRetry}>
                Continue as Guest
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'audio':
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Audio Troubleshooting</CardTitle>
              <CardDescription>
                Try these steps to fix audio issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>Check microphone permissions in your browser settings</li>
                <li>Make sure no other apps are using your microphone</li>
                <li>Try using headphones to prevent audio feedback</li>
                <li>Refresh the page and try again</li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={this.handleRetry}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        );
        
      case 'ipfs':
        return (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Storage Fallback Mode</CardTitle>
              <CardDescription>
                We'll temporarily store your recordings locally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your recordings will be stored locally and synchronized when our storage services are back online.
                You can continue using the app normally.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={this.handleRetry}>
                Continue in Fallback Mode
              </Button>
            </CardFooter>
          </Card>
        );
        
      default:
        return null;
    }
  }

  // Render the fallback UI when an error occurs
  private renderFallbackUI(): ReactNode {
    const { fallback, showReportButton = true, showRetryButton = true } = this.props;
    const { isRetrying, isReporting, expandedDetails, errorInfo } = this.state;
    
    // If custom fallback is provided, use it
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="p-4 rounded-lg border bg-background">
        <div className="space-y-6">
          {/* Error message */}
          {this.renderErrorMessage()}
          
          {/* Alternative content based on error type */}
          {this.renderAlternativeContent()}
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {showRetryButton && (
              <Button 
                onClick={this.handleRetry} 
                disabled={isRetrying}
                className="flex-1"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>
            )}
            
            {showReportButton && (
              <Button 
                variant="outline" 
                onClick={this.handleReport}
                disabled={isReporting}
                className="flex-1"
              >
                {isReporting ? 'Reporting...' : 'Report Issue'}
              </Button>
            )}
          </div>
          
          {/* Expandable technical details (for developers) */}
          {errorInfo && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={this.toggleDetails}
                className="text-xs"
              >
                {expandedDetails ? 'Hide Technical Details' : 'Show Technical Details'}
              </Button>
              
              {expandedDetails && (
                <div className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-[200px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { children, className } = this.props;
    const { hasError } = this.state;
    
    if (hasError) {
      return (
        <div className={className}>
          {this.renderFallbackUI()}
        </div>
      );
    }
    
    return children;
  }
}

export { EnhancedErrorBoundary };
