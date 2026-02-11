// Auth Layout
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Health Agent</span>
          </div>
        </div>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Health Agent has completely transformed how I manage my wellness journey. It&apos;s like having a personal doctor and trainer in my pocket.&quot;
            </p>
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              SP
            </div>
            <div>
              <div className="text-white font-medium">Priya S.</div>
              <div className="text-white/70 text-sm">Health Enthusiast</div>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © {new Date().getFullYear()} Health Agent. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-health-bg">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
