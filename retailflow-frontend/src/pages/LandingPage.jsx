import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import DashboardPreview from "../components/landing/Dashboard";
import Footer from "../components/layout/Footer";
import { CheckCircle2, BookX } from "lucide-react";

const ProblemSection = () => (
  <section className="py-16 bg-[#111113] border-y border-slate-800">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
        <BookX size={32} />
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
        Still using a notebook for Udhaar?
      </h2>
      <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto font-medium">
        Losing track of dues and manual profit calculation is costing you
        growth. It's time to switch to{" "}
        <span className="text-indigo-400">RetailFlow</span>.
      </p>
    </div>
  </section>
);

const Testimonial = () => (
  <section className="py-20 bg-[#09090b]">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-snug italic">
        "RetailFlow completely changed how I run my business. Recovering udhaar
        via WhatsApp is now faster than ever!"
      </h3>
      <div className="flex items-center justify-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          RS
        </div>
        <div className="text-left">
          <p className="font-bold text-white">Ramesh Sharma</p>
          <p className="text-sm text-slate-400">Retailer, Sharma Mart</p>
        </div>
      </div>
    </div>
  </section>
);

const Pricing = () => (
  <section
    id="pricing"
    className="py-24 bg-[#111113] border-t border-slate-800"
  >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
        Transparent Pricing
      </h2>
      <p className="text-slate-400 mb-12 font-medium">
        Built for businesses of all sizes.
      </p>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-[#1e293b] p-8 rounded-4xl border border-slate-700 text-left">
          <h3 className="text-2xl font-bold text-white mb-2">Basic</h3>
          <p className="text-4xl font-black text-white mb-6">Free</p>
          <ul className="space-y-4 mb-8 text-slate-300 font-medium">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={20} /> 100 Items
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={20} /> Standard
              POS
            </li>
          </ul>
          <button className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl">
            Get Started
          </button>
        </div>
        <div className="bg-indigo-600 p-8 rounded-4xl border border-indigo-500 text-left relative transform md:-translate-y-4 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-2">RetailFlow Pro</h3>
          <p className="text-4xl font-black text-white mb-6">
            ₹499 <span className="text-lg font-medium opacity-70">/mo</span>
          </p>
          <ul className="space-y-4 mb-8 text-white font-medium">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-indigo-200" size={20} /> Unlimited
              Everything
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-indigo-200" size={20} /> Advanced
              Analytics
            </li>
          </ul>
          <button className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  </section>
);

function LandingPage() {
  return (
    <div className="bg-[#09090b] min-h-screen overflow-x-hidden">
      <Hero />
      <ProblemSection />
      <Features />
      <DashboardPreview />
      <Testimonial />
      <Pricing />
      <Footer />
    </div>
  );
}

export default LandingPage;
