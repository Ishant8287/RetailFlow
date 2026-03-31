import { useNavigate } from "react-router-dom";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Footer from "../components/layout/Footer";
import { CheckCircle2, ArrowRight, Star, Quote } from "lucide-react";

//Stats Section
const StatsSection = () => (
  <section className="border-y border-slate-800/60 bg-[#111113]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { value: "50+", label: "Stores using RetailFlow" },
          { value: "₹2L+", label: "Transactions processed" },
          { value: "99.9%", label: "Uptime guarantee" },
          { value: "< 2 min", label: "Setup time" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="text-3xl sm:text-4xl font-black text-white mb-1">
              {value}
            </p>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

//How It Works
const HowItWorks = () => (
  <section className="py-24 bg-[#09090b]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">
          How it works
        </p>
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          Up and running in minutes.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-linear-to-r from-indigo-500/30 via-indigo-500/60 to-indigo-500/30" />

        {[
          {
            step: "01",
            title: "Create your account",
            desc: "Sign up with your shop name and email. Takes under 2 minutes. No paperwork.",
          },
          {
            step: "02",
            title: "Add your inventory",
            desc: "Add items with prices and stock levels. Import in bulk if you have a list ready.",
          },
          {
            step: "03",
            title: "Start billing",
            desc: "Open POS, scan or search items, and generate bills with UPI QR codes instantly.",
          },
        ].map(({ step, title, desc }) => (
          <div
            key={step}
            className="relative bg-[#111113] border border-slate-800 rounded-2xl p-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-lg font-black text-indigo-400">{step}</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

//Testimonials
const Testimonials = () => (
  <section className="py-24 bg-[#111113] border-t border-slate-800/60">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">
          Testimonials
        </p>
        <h2 className="text-4xl font-black text-white">Shopkeepers love it.</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {[
          {
            name: "Ramesh Sharma",
            role: "Kirana Store Owner, Delhi",
            initials: "RS",
            color: "bg-indigo-500/20 text-indigo-400",
            rating: 5,
            quote:
              "Pehle notebook mein sab likhta tha. Ab RetailFlow se ek click mein WhatsApp pe udhaar reminder bhej deta hoon. Bahut time bachta hai.",
          },
          {
            name: "Meena Patel",
            role: "Medical Shop, Ahmedabad",
            initials: "MP",
            color: "bg-emerald-500/20 text-emerald-400",
            rating: 5,
            quote:
              "Expiry date tracking aur low stock alerts — these features alone saved me from a huge loss. The invoice with QR code looks very professional.",
          },
          {
            name: "Vikram Singh",
            role: "Electronics Retail, Jaipur",
            initials: "VS",
            color: "bg-amber-500/20 text-amber-400",
            rating: 5,
            quote:
              "My cashier uses it on mobile. I check the analytics from home. Profit reports are clear — now I know which items are actually making money.",
          },
        ].map(({ name, role, initials, color, rating, quote }) => (
          <div
            key={name}
            className="bg-[#09090b] border border-slate-800 rounded-2xl p-7 flex flex-col gap-5"
          >
            <div className="flex gap-0.5">
              {Array(rating)
                .fill(0)
                .map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium flex-1">
              "{quote}"
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <div
                className={`w-10 h-10 rounded-full ${color} flex items-center justify-center font-black text-sm`}
              >
                {initials}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{name}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

//Pricing
const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">
            Pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3">
            Simple, transparent pricing.
          </h2>
          <p className="text-slate-400 font-medium">
            Start free. Upgrade when you grow.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5 items-start">
          {/* Free */}
          <div className="bg-[#111113] border border-slate-800 rounded-2xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-1">Free</h3>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">₹0</span>
                <span className="text-slate-500 font-medium mb-2">/month</span>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Perfect for getting started
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Up to 100 inventory items",
                "POS billing with UPI QR",
                "Basic khata tracking",
                "WhatsApp reminders",
                "PDF invoices",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-400 font-medium"
                >
                  <CheckCircle2
                    size={16}
                    className="text-slate-600 mt-0.5 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/signup")}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl transition-all active:scale-95"
            >
              Get started free
            </button>
          </div>

          {/* Pro */}
          <div className="relative bg-indigo-600 rounded-2xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.25)]">
            <div className="absolute -top-3 left-8">
              <span className="bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-black text-white mb-1">Pro</h3>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-white">₹499</span>
                <span className="text-indigo-300 font-medium mb-2">/month</span>
              </div>
              <p className="text-sm text-indigo-200 mt-2">
                For growing businesses
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Unlimited inventory items",
                "Unlimited sales & reports",
                "Staff management (multi-login)",
                "Advanced analytics & profit reports",
                "Supplier management",
                "Expense tracking",
                "Priority support",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-white font-medium"
                >
                  <CheckCircle2
                    size={16}
                    className="text-indigo-200 mt-0.5 shrink-0"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate("/signup")}
              className="group w-full py-3.5 bg-white hover:bg-indigo-50 text-indigo-600 font-black rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Start free trial
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

//CTA Banner
const CTABanner = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-[#111113] border-t border-slate-800/60">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Stop losing money
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">
            to manual mistakes.
          </span>
        </h2>
        <p className="text-slate-400 text-lg font-medium mb-8">
          Join retailers across India who've switched from notebooks to
          RetailFlow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            Create free account
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-black transition-all active:scale-95"
          >
            View live demo
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-4 font-medium">
          No credit card • Free forever plan available
        </p>
      </div>
    </section>
  );
};

// ─── Main Landing Page ─────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <div className="bg-[#09090b] min-h-screen overflow-x-hidden">
      <Hero />
      <StatsSection />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}

export default LandingPage;
