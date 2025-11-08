import React from "react";

type Props = {
  children: React.ReactNode;
};

export const CodeBox = ({ children }: Props) => {
  return (
    <pre className='overflow-auto rounded-md border bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap'>
      <code>{children}</code>
    </pre>
  );
};
