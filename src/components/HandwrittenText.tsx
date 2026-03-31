import { motion } from 'motion/react';

export function HandwrittenText({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <span className="inline-block relative">
      {/* Hidden text to reserve space */}
      <span className="invisible">{text}</span>
      {/* SVG overlay with handwriting animation */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 80"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.text
          x="300"
          y="60"
          textAnchor="middle"
          className="font-caveat"
          fontSize="80"
          fill="none"
          stroke="white"
          strokeWidth="2"
          initial={{ strokeDasharray: 2000, strokeDashoffset: 2000 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2, delay, ease: 'easeInOut' }}
        >
          {text}
        </motion.text>
        <motion.text
          x="300"
          y="60"
          textAnchor="middle"
          className="font-caveat"
          fontSize="80"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 1.8, ease: 'easeIn' }}
        >
          {text}
        </motion.text>
      </svg>
    </span>
  );
}
