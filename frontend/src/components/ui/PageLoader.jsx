// frontend/src/components/ui/PageLoader.jsx
export default function PageLoader() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 
                      flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-green-700 
                          border-t-green-300 animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-3xl">
            🌾
          </span>
        </div>
        <p className="text-green-300 font-medium tracking-widest text-sm uppercase animate-pulse">
          KisanMitra AI
        </p>
      </div>
    );
  }