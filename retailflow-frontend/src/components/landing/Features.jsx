import {
  PackageSearch,
  Zap,
  BookOpenCheck,
  BarChart3,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-[#09090b] relative transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
          Everything You Need to Run{" "}
          <span className="text-indigo-500">RetailFlow</span>
        </h2>

        <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg font-medium">
          Powerful tools built for modern businesses — manage stock, billing and
          customer credit effortlessly without the headache of manual logs.
        </p>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1: Smart Inventory */}
          <FeatureCard
            icon={<PackageSearch size={28} />}
            title="Smart Inventory"
            desc="Track stock levels, detect dead stock, and get low stock warnings automatically before you run out."
            color="indigo"
          />

          {/* Feature 2: Fast Billing */}
          <FeatureCard
            icon={<Zap size={28} />}
            title="Fast Billing (POS)"
            desc="Ultra-fast Point of Sale system with split payments (Cash+UPI) and instant dynamic QR code generation."
            color="emerald"
          />

          {/* Feature 3: Smart Khata */}
          <FeatureCard
            icon={<BookOpenCheck size={28} />}
            title="Digital Khata"
            desc="Manage customer credit effortlessly. Send 1-click WhatsApp reminders with direct UPI payment links."
            color="amber"
          />

          {/* Feature 4: Real-time Analytics */}
          <FeatureCard
            icon={<BarChart3 size={28} />}
            title="Profit Analytics"
            desc="Know your daily, weekly, and monthly profit margins with deep-dive visual charts and reports."
            color="rose"
          />

          {/* Feature 5: Secure Backup */}
          <FeatureCard
            icon={<ShieldCheck size={28} />}
            title="Secure Cloud Sync"
            desc="Your data is encrypted and backed up automatically. Never lose your business records again."
            color="sky"
          />

          {/* Feature 6: Responsive UI */}
          <FeatureCard
            icon={<Smartphone size={28} />}
            title="Mobile Ready"
            desc="Optimized for tablets and old mobile browsers. Access your business data from anywhere, anytime."
            color="violet"
          />
        </div>
      </div>
    </section>
  );
}

// 🚀 Reusable Component for cleaner code
const FeatureCard = ({ icon, title, desc, color }) => {
  const colorMap = {
    indigo:
      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 group-hover:border-indigo-500/50 hover:shadow-indigo-500/10",
    emerald:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/50 hover:shadow-emerald-500/10",
    amber:
      "bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:border-amber-500/50 hover:shadow-amber-500/10",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:border-rose-500/50 hover:shadow-rose-500/10",
    sky: "bg-sky-500/10 text-sky-400 border-sky-500/20 group-hover:border-sky-500/50 hover:shadow-sky-500/10",
    violet:
      "bg-violet-500/10 text-violet-400 border-violet-500/20 group-hover:border-violet-500/50 hover:shadow-violet-500/10",
  };

  return (
    <div
      className={`group p-8 rounded-4xl bg-[#171e2e] border transition-all duration-300 text-left relative overflow-hidden hover:-translate-y-2 ${colorMap[color]}`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${colorMap[color]}`}
      >
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 text-white transition-colors">
        {title}
      </h3>
      <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
    </div>
  );
};

export default Features;
