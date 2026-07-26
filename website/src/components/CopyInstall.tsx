import { useEffect, useRef, useState } from "react";

const INSTALL = "npm install universal-datetime-picker";

type Props = {
  demoHref?: string;
};

export default function CopyInstall({ demoHref = "#live-demo" }: Props) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = () => {
    if (resetTimerRef.current !== null) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearResetTimer();
    };
  }, []);

  const copyInstall = async () => {
    clearResetTimer();

    try {
      await navigator.clipboard.writeText(INSTALL);
      setCopied(true);
      resetTimerRef.current = setTimeout(() => {
        resetTimerRef.current = null;
        setCopied(false);
      }, 1800);
    } catch {
      clearResetTimer();
      setCopied(false);
    }
  };

  return (
    <>
      <div className="hero-actions">
        <a className="btn btn-ghost" href={demoHref}>
          Try the live demo
        </a>
      </div>
      <div className="install-line">
        <code className="install-line__cmd">{INSTALL}</code>
        <button
          type="button"
          className="install-copy"
          onClick={copyInstall}
          aria-label={copied ? "Copied" : "Copy install command"}
          title={copied ? "Copied" : "Copy"}
        >
          {copied ? (
            <svg
              data-copy-icon="done"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              data-copy-icon="default"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
