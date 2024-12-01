import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CodeRendererProps {
    content: string;
    language?: string;
}

const CodeRenderer: React.FC<CodeRendererProps> = ({ content, language = 'typescript' }) => {
    const renderContent = useMemo(() => {
        // Split the content into code blocks and regular text
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        content.replace(codeBlockRegex, (match, lang, codeContent, index) => {
            // Add any text before the code block
            if (index > lastIndex) {
                parts.push(
                    <ReactMarkdown
                        key={`text-${lastIndex}`}
                        remarkPlugins={[remarkGfm]}
                    >
                        {content.slice(lastIndex, index)}
                    </ReactMarkdown>
                );
            }

            // Add the code block with syntax highlighting
            parts.push(
                <SyntaxHighlighter
                    key={`code-${index}`}
                    language={lang || language}
                    style={oneDark}
                    customStyle={{
                        margin: '10px 0',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                    }}
                >
                    {codeContent.trim()}
                </SyntaxHighlighter>
            );

            lastIndex = index + match.length;
            return match;
        });

        // Add any remaining text after the last code block
        if (lastIndex < content.length) {
            parts.push(
                <ReactMarkdown
                    key="final-text"
                    remarkPlugins={[remarkGfm]}
                >
                    {content.slice(lastIndex)}
                </ReactMarkdown>
            );
        }

        // If no code blocks were found, render entire content as markdown
        if (parts.length === 0) {
            return (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline ? (
                                <SyntaxHighlighter
                                    language={match?.[1] || language}
                                    style={oneDark}
                                    customStyle={{
                                        margin: '10px 0',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code
                                    className={className}
                                    {...props}
                                    style={{
                                        backgroundColor: 'rgba(135, 131, 120, 0.15)',
                                        padding: '0.2em 0.4em',
                                        borderRadius: '3px',
                                    }}
                                >
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            );
        }

        return parts;
    }, [content, language]);

    return (
        <div className="prose dark:prose-invert max-w-full">
            {renderContent}
        </div>
    );
};

export default CodeRenderer;