import React, { useState, useEffect } from 'react';
import { Switch, Route, useLocation, RouteComponentProps } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

// Custom variants for different types of transitions
const transitions = {
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

interface TransitionRouterProps {
  children: React.ReactNode;
}

// Map routes to specific transitions
const getTransitionForPath = (path: string) => {
  if (path === '/') return transitions.fade;
  if (path.startsWith('/chat')) return transitions.slideHorizontal;
  if (path === '/calendar') return transitions.zoom;
  if (path === '/payment') return transitions.slideUp;
  return transitions.slideUp; // Default transition
};

export const TransitionRouter: React.FC<TransitionRouterProps> = ({ children }) => {
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = useState(location);
  
  useEffect(() => {
    setPrevLocation(location);
  }, [location]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getTransitionForPath(location)}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

interface TransitionSwitchProps {
  routes: Array<{
    path?: string;
    component: React.ComponentType<any>;
  }>;
}

export const TransitionSwitch: React.FC<TransitionSwitchProps> = ({ routes }) => {
  return (
    <TransitionRouter>
      <Switch>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} component={route.component} />
        ))}
      </Switch>
    </TransitionRouter>
  );
};

export default TransitionSwitch;