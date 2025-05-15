import React from 'react';
import { motion } from 'framer-motion';

interface CalligraphyAnimationProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

/**
 * A component that animates Arabic text with a calligraphic effect
 * by revealing each character sequentially with a flowing motion.
 */
export const CalligraphyAnimation: React.FC<CalligraphyAnimationProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.05
}) => {
  // Split the text into an array of characters
  const chars = text.split('');
  
  // Create a variant for the container
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: duration,
        delayChildren: delay * i,
        ease: "easeInOut"
      }
    })
  };
  
  // Create variants for each character
  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      x: -10,
      scale: 0.8,
      rotate: -5
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100
      }
    }
  };
  
  return (
    <motion.div
      className={`inline-block ${className}`}
      dir="rtl"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {chars.map((char, index) => (
        <motion.span
          key={index}
          className="inline-block"
          variants={child}
          style={{ 
            display: 'inline-block',
            marginLeft: char === ' ' ? '0.25em' : '0.02em',
            marginRight: char === ' ' ? '0.25em' : '0.02em'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

/**
 * A more elaborate calligraphy animation with decorative elements
 */
export const FancyCalligraphyAnimation: React.FC<CalligraphyAnimationProps> = ({
  text,
  className = '',
  delay = 0,
  duration = 0.05
}) => {
  // Split the text into an array of characters
  const chars = text.split('');
  
  // Create a variant for the container
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: duration,
        delayChildren: delay * i,
        ease: "easeInOut"
      }
    })
  };
  
  // Create variants for each character
  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
      scale: 1.2
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 200
      }
    }
  };
  
  // Create variants for the decorative line
  const lineVariants = {
    hidden: { width: "0%" },
    visible: { 
      width: "100%",
      transition: { 
        delay: delay + (chars.length * duration) + 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="inline-block"
        dir="rtl"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {chars.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={child}
            style={{ 
              display: 'inline-block',
              marginLeft: char === ' ' ? '0.25em' : '0.02em',
              marginRight: char === ' ' ? '0.25em' : '0.02em'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
      
      {/* Decorative line beneath the text */}
      <motion.div
        className="h-0.5 bg-primary/50 mt-1 mx-auto rounded-full"
        variants={lineVariants}
        initial="hidden"
        animate="visible"
      />
    </div>
  );
};

export default CalligraphyAnimation;