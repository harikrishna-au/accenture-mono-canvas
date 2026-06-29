import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const shapes = [
  { w: 72, h: 72, top: "32%", left: "4%", rz: 18, delay: 0, dur: 5.5 },
  { w: 48, h: 48, top: "22%", right: "5%", rz: -22, delay: 1.1, dur: 6.2 },
  { w: 36, h: 36, top: "68%", left: "2%", rz: 40, delay: 2.3, dur: 5 },
  { w: 60, h: 60, top: "72%", right: "8%", rz: -12, delay: 0.6, dur: 6.8 },
  { w: 28, h: 28, top: "50%", left: "10%", rz: 60, delay: 1.8, dur: 4.5 },
];

export const LandingBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* subtle dot grid */}
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: "radial-gradient(circle, #c4bdb4 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* warm gradient orbs */}
    <div
      className="absolute -top-40 -right-40 w-[640px] h-[640px] blur-[130px] opacity-50"
      style={{ background: "radial-gradient(ellipse, rgba(201,164,110,0.18) 0%, transparent 70%)" }}
    />
    <div
      className="absolute -bottom-32 -left-32 w-[500px] h-[500px] blur-[100px] opacity-40"
      style={{ background: "radial-gradient(ellipse, rgba(168,162,158,0.14) 0%, transparent 70%)" }}
    />

    {/* 3-D floating glass cubes — desktop only */}
    {shapes.map((s, i) => (
      <motion.div
        key={i}
        className="absolute rounded-2xl hidden lg:block"
        style={{
          width: s.w,
          height: s.h,
          top: s.top,
          left: (s as any).left,
          right: (s as any).right,
          rotate: s.rz,
          background: "rgba(255,255,255,0.45)",
          border: "1px solid rgba(201,164,110,0.22)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
          transformStyle: "preserve-3d",
        }}
        animate={{ y: [0, -(14 + i * 2), 0], rotateX: [0, 14, 0], rotateY: [0, 9, 0] }}
        transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className="absolute inset-x-3 top-2 h-px rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)" }}
        />
      </motion.div>
    ))}

    {/* floating stat badge — desktop only */}
    <motion.div
      className="absolute top-[18%] right-[10%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(228,224,218,0.9)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
      transition={{
        opacity: { duration: 0.6, delay: 0.9 },
        x: { duration: 0.6, delay: 0.9 },
        y: { duration: 4, delay: 0.9, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-amber-50 border border-amber-100">
        <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
      </span>
      <span className="text-[12px] font-['Inter'] font-semibold text-stone-700">Real-time AI feedback</span>
    </motion.div>
  </div>
);
