import { useRef } from 'react';

export default function AppHead({ result }) {
  const textDivRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-2/4">
      <div className="rounded-md border-spacing-2 border-slate-900 bg-slate-100 break-words max-w-500 overflow-x-auto">
        <div
          className="m-5"
          dangerouslySetInnerHTML={{ __html: result }}
          ref={textDivRef}
        />
      </div>
    </div>
  );
}
