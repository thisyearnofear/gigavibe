
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIPlayground from '@/components/AIPlayground';
import UsageTracker from '@/components/UsageTracker';

const AIChat = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="playground">AI Playground</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="playground" className="h-[calc(100vh-180px)]">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 h-full">
              <AIPlayground />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <UsageTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIChat;
