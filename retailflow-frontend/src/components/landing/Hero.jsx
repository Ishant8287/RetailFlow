import dashboard from "../../assets/Images/dashboard.png";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, MapPin } from "lucide-react";

function Hero() {
  const navigate = useNavigate();
  const token = localStorage.getItem("retailflow_token"); // Updated Key

  return (
    <section
      id="home"
      className="py-12 sm:py-20 md:py-24 bg-[#09090b] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold tracking-widest uppercase border border-indigo-500/20">
              Enterprise Grade POS for Retail
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl tracking-tight font-black text-white leading-[1.1]">
            Scale Your Business <br className="hidden sm:block" />
            & Billing <br />
            <span className="text-indigo-500">With RetailFlow</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium">
            RetailFlow helps you track inventory, generate fast bills, manage
            customer khata and analyze real-time profit.
          </p>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <MapPin size={16} className="text-emerald-500" /> India
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ShieldCheck size={16} className="text-indigo-500" /> Encrypted
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Zap size={16} className="text-amber-500" /> Instant OTP
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            {token ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition duration-200 font-black shadow-xl shadow-indigo-600/30 w-full sm:w-auto text-lg active:scale-95"
              >
                Go to Dashboard 🚀
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/signup")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl transition duration-200 font-black shadow-xl shadow-indigo-600/30 w-full sm:w-auto text-lg active:scale-95"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="border-2 border-slate-800 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl transition duration-200 font-black w-full sm:w-auto text-lg active:scale-95"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <div className="bg-[#171e2e] border border-slate-800 shadow-2xl rounded-3xl p-3 sm:p-5">
            <img
              src={dashboard}
              alt="RetailFlow Dashboard"
              className="rounded-xl w-full h-auto border border-slate-700/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
