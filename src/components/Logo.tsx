export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="30" height="30" rx="8" fill="#0a1330" />
        <path
          d="M9 20.5V9.5L15 15L21 9.5V20.5"
          stroke="url(#logo-gradient)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="logo-gradient" x1="9" y1="9.5" x2="21" y2="20.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f9d6a" />
            <stop offset="1" stopColor="#4864c9" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-brand-900 leading-none">
        Connect <span className="font-light text-brand-600">Finanças</span>
      </span>
    </div>
  );
}
