"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-slate max-w-none text-slate-800 leading-relaxed font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight border-b border-slate-200 pb-3 mt-2 mb-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-8 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-slate-900 mt-6 mb-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-base font-bold text-slate-800 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed my-4" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-extrabold text-slate-950" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-slate-800" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 space-y-2 my-4 text-sm sm:text-base text-slate-700 marker:text-indigo-500" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 space-y-2 my-4 text-sm sm:text-base text-slate-700 marker:text-indigo-600 font-medium" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-indigo-500 bg-indigo-50/50 rounded-r-2xl py-3 px-5 my-5 text-slate-800 italic font-serif text-sm sm:text-base shadow-2xs" {...props} />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono text-xs font-semibold" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <div className="relative my-5 rounded-2xl bg-slate-950 text-slate-100 shadow-lg overflow-hidden border border-slate-800">
                {match && (
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
                    <span className="uppercase font-bold tracking-wider text-indigo-400">{match[1]}</span>
                    <span>Code Snippet</span>
                  </div>
                )}
                <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
                  <code {...props}>{children}</code>
                </pre>
              </div>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50 font-bold text-slate-900" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 font-bold text-slate-900 uppercase tracking-wider text-[11px]" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-3 text-slate-700 border-t border-slate-100" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-t border-slate-200" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
