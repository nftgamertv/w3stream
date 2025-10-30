import Link from "next/link";

export default function NoAccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="relative space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-4xl my-2 font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              No Access
            </h1>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-red-200 text-lg">
            You don't have permission to access this page.
          </p>
          <p className="text-red-50 text-sm text-balance mt-2">
            This area is restricted to authorized testers only. If you believe you should have access, please contact the administrator.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 z-50 isolate bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-full hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
