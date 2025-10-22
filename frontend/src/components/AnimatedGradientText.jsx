import { motion } from "framer-motion";

function GradientMarqueeText({
  text = "Gradient Marquee Text",
  gradientColors = ["#ff0080", "#7928ca", "#ff0080"],
}) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden">
      <motion.div
        className="text-2xl md:text-3xl lg:text-4xl font-bold whitespace-nowrap"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          ease: "linear",
          repeat: Infinity,
        }}
        style={{
          backgroundImage: `linear-gradient(90deg, ${gradientColors.join(", ")})`,
          backgroundSize: "200% 100%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

export default function AnimatedGradientText({ text }) {
  return <GradientMarqueeText text={text || "Ana’s Accounting"} />;
}
