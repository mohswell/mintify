"use client";

import React, { useState } from 'react';
import { Copy, RefreshCw, Key, Check, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/views/ui/card';
import { Button } from '@/components/views/ui/button';
import { Input } from '@/components/views/ui/input';
import notification from '@/lib/notification';
import { generateAccessToken } from '@/actions';

export default function AccessTokenPage() {
  const [token, setToken] = useState('');
  const [baseAppUrl, setBaseAppUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isBaseAppUrlCopied, setIsBaseAppUrlCopied] = useState(false);

  const handleGenerateToken = async () => {
    try {
      setIsGenerating(true);
      const { ok, data } = await generateAccessToken();

      if (ok && data.apiKey) {
        setToken(data.apiKey);
        setBaseAppUrl(data.baseAppUrl || '');  // Add base app URL 
        setIsCopied(false);
        setIsBaseAppUrlCopied(false);
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

  const handleCopyBaseAppUrl = async () => {
    if (baseAppUrl) {
      try {
        await navigator.clipboard.writeText(baseAppUrl);
        setIsBaseAppUrlCopied(true);
        notification({
          type: 'success',
          message: 'Base App URL copied to clipboard',
        });

        setTimeout(() => {
          setIsBaseAppUrlCopied(false);
        }, 2000);
      } catch (error) {
        notification({
          type: 'error',
          message: 'Failed to copy Base App URL',
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
            {/* Access Token Input */}
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

            {/* Base App URL Input */}
            <div className="flex items-center space-x-2 mt-4">
              <Input
                value={baseAppUrl}
                placeholder="Your Base App URL will appear here"
                readOnly
                className="flex-grow"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyBaseAppUrl}
                disabled={!baseAppUrl}
                className="transition-all duration-200"
              >
                {isBaseAppUrlCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Generate Token Button */}
            <Button
              onClick={handleGenerateToken}
              disabled={isGenerating}
              className="w-full mt-4"
            >
              {isGenerating ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Generate New Token"
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>🔒 Keep your token and base app URL secure. Do not share them with anyone.</p>
              <p className="mt-2">Tokens are valid for 10 years from generation.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}