"use client";

import React, { useState } from 'react';
import { Copy, RefreshCw, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import notification from '@/lib/notification';

const generateAccessToken = () => {
  // Mock token generation - replace with actual backend logic
  return `at_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
};

export default function AccessTokenPage() {
  const [token, setToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateToken = () => {
    setIsGenerating(true);
    // Simulate async token generation
    setTimeout(() => {
      const newToken = generateAccessToken();
      setToken(newToken);
      setIsGenerating(false);
    }, 500);
  };

  const handleCopyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      notification({
        type: 'success',
        message: 'Access Token Copied to clipboard',
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-6 h-6" />
            Generate Access Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                value={token} 
                placeholder="Your access token will appear here"
                readOnly 
                className="flex-grow"
              />
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleCopyToken}
                disabled={!token}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleGenerateToken} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Generate New Token"
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>🔒 Keep your token secure. Do not share it with anyone.</p>
              <p className="mt-2">Tokens are valid for for 10 years from generation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}