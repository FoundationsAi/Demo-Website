import React from 'react';
import { motion } from 'framer-motion';
import { Route, RouteProps } from 'wouter';

// Custom animation variants for different routes
export const animations = {
  // Default fade transition
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  },
  
  // Slide up transition for most pages
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  },
  
  // Slide horizontal transition for chat and detail pages
  slideHorizontal: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  },
  
  // Zoom transition for special emphasis
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
  }
};

// Helper function to determine the animation for a specific route
export const getAnimationForPath = (path?: string | RegExp) => {
  // If path is undefined or RegExp, return default
  if (!path || typeof path !== 'string') return animations.fade;
  
  // Otherwise, check the path string
  if (path === '/') return animations.fade;
  if (path.startsWith('/chat')) return animations.slideHorizontal;
  if (path === '/calendar') return animations.zoom;
  if (path === '/payment') return animations.slideUp;
  return animations.slideUp; // Default transition
};

// Augmented RouteProps to include animation variants
interface AnimatedRouteProps extends RouteProps {
  animation?: keyof typeof animations;
}

// AnimatedRoute component that wraps a Route with animation
export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({ 
  component: Component, 
  animation = 'slideUp',
  ...rest 
}) => {
  // Use the specified animation or fall back to the path-based one
  const variants = animations[animation] || getAnimationForPath(rest.path);
  
  if (!Component) return null;
  
  return (
    <Route
      {...rest}
      component={(props) => (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          style={{ width: '100%', height: '100%' }}
        >
          <Component {...props} />
        </motion.div>
      )}
    />
  );
};

export default AnimatedRoute;