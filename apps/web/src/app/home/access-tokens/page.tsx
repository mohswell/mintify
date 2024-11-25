"use client";

import React, { useState } from 'react';
import { Copy, RefreshCw, Key, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/views/ui/card';
import { Button } from '@/components/views/ui/button';
import { Input } from '@/components/views/ui/input';
import notification from '@/lib/notification';
import { generateAccessToken } from '@/actions';

// const generateAccessToken = () => {
//   // Mock token generation - TODO: replace with backend logic
//   return `at_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
// };

export default function AccessTokenPage() {
  const [token, setToken] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateToken = async () => {
    try {
      setIsGenerating(true);
      const { ok, data } = await generateAccessToken();

      if (ok && data.apiKey) {
        setToken(data.apiKey);
        setIsCopied(false);
        notification({
          type: 'success',
          message: 'Access Token generated successfully',
        });
      } else {
        throw new Error(data.message || 'Failed to generate token');
      }
    } catch (error) {
      notification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to generate token',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setIsCopied(true);
        notification({
          type: 'success',
          message: 'Access Token copied to clipboard',
        });

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } catch (error) {
        notification({
          type: 'error',
          message: 'Failed to copy token',
        });
      }
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
                className="transition-all duration-200"
              >
                {isCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
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