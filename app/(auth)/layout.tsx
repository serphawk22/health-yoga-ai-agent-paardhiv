// Auth Layout — Minimal dark centered design
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.015] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] rounded-full bg-primary-500/[0.01] blur-[130px]" />
      </div>

      {/* Form container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {children}
      </div>
    </div>
  );
}
