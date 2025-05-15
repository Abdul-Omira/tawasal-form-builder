import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FancyCalligraphyAnimation } from './CalligraphyAnimation';

interface WelcomeScreenProps {
  onComplete?: () => void;
  duration?: number; // Duration in seconds
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onComplete,
  duration = 4 // Default duration: 4 seconds
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the welcome screen after the specified duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration * 1000);

    // Clean up the timer on component unmount
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Variants for the container animation
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.5,
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  // Variants for the Syrian emblem animation
  const emblemVariants = {
    initial: { scale: 0.7, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        duration: 1.2,
        type: "spring",
        stiffness: 100
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Variants for the calligraphy text animation
  const textVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.8,
        type: "spring",
        damping: 15
      }
    },
    exit: { 
      y: -10, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  // Variants for the decorative elements
  const decorVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 0.7, 
      transition: { 
        duration: 1,
        delay: 0.5
      }
    },
    exit: { 
      scale: 1.2, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-b from-primary/95 to-secondary/95 flex flex-col items-center justify-center z-50"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Syrian Emblem */}
          <motion.div
            variants={emblemVariants}
            className="mb-8"
          >
            <img 
              src="/Emblem_of_Syria.svg.png" 
              alt="شعار الجمهورية العربية السورية" 
              className="w-40 h-auto"
            />
          </motion.div>

          {/* Decorative Pattern Top */}
          <motion.div
            variants={decorVariants}
            className="absolute top-16 left-1/2 transform -translate-x-1/2 w-72 h-8 opacity-50"
          >
            <svg viewBox="0 0 800 100" className="w-full h-full">
              <path
                d="M0,50 C100,30 150,70 200,50 C250,30 300,70 350,50 C400,30 450,70 500,50 C550,30 600,70 650,50 C700,30 750,70 800,50"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
              <path
                d="M0,60 C100,40 150,80 200,60 C250,40 300,80 350,60 C400,40 450,80 500,60 C550,40 600,80 650,60 C700,40 750,80 800,60"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
          </motion.div>

          {/* Main Calligraphy Text */}
          <motion.div variants={textVariants} className="text-center">
            <h1 className="font-ibm text-5xl md:text-7xl text-white mb-6 leading-tight">
              <FancyCalligraphyAnimation 
                text="وزارة الاتصالات" 
                delay={0.8}
                duration={0.08}
                className="block"
              />
              <FancyCalligraphyAnimation 
                text="والتقانة" 
                delay={1.6}
                duration={0.1}
                className="block mt-2"
              />
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light mt-6">
              <FancyCalligraphyAnimation 
                text="منصة المعلومات الاقتصادية للشركات السورية" 
                delay={2.4}
                duration={0.04}
              />
            </p>
          </motion.div>

          {/* Decorative Pattern Bottom */}
          <motion.div
            variants={decorVariants}
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-72 h-8 opacity-50"
          >
            <svg viewBox="0 0 800 100" className="w-full h-full">
              <path
                d="M0,50 C100,30 150,70 200,50 C250,30 300,70 350,50 C400,30 450,70 500,50 C550,30 600,70 650,50 C700,30 750,70 800,50"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
              <path
                d="M0,60 C100,40 150,80 200,60 C250,40 300,80 350,60 C400,40 450,80 500,60 C550,40 600,80 650,60 C700,40 750,80 800,60"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              />
            </svg>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: "200px", 
              transition: { duration: duration - 0.5, ease: "linear" } 
            }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 h-1 bg-white/50 rounded-full overflow-hidden mt-8"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ 
                x: "0%",
                transition: { duration: duration - 0.5, ease: "easeOut" }
              }}
              className="h-full w-full bg-white rounded-full"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;