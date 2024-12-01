import React from 'react';

const TokenUsage = ({ tokenUsage }) => (
  <div className="text-xs text-gray-500 mt-2">
    Tokens Used:
    <ul>
      <li>Total: {tokenUsage.totalTokens}</li>
      <li>Input: {tokenUsage.inputTokens}</li>
      <li>Output: {tokenUsage.outputTokens}</li>
    </ul>
  </div>
);

export default TokenUsage;