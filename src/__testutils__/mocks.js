import React from 'react';

// ── framer-motion mock ──
// Strips animation props and renders plain DOM elements via a Proxy.
const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants',
  'whileHover', 'whileTap', 'whileFocus', 'whileDrag', 'whileInView',
  'viewport', 'layout', 'layoutId', 'onAnimationStart', 'onAnimationComplete',
  'drag', 'dragConstraints', 'dragElastic', 'dragMomentum',
]);

const stripMotionProps = (props) => {
  const cleaned = {};
  for (const [key, val] of Object.entries(props)) {
    if (!MOTION_PROPS.has(key)) cleaned[key] = val;
  }
  return cleaned;
};

const motionHandler = {
  get(_target, tag) {
    const Comp = React.forwardRef((props, ref) =>
      React.createElement(tag, { ...stripMotionProps(props), ref })
    );
    Comp.displayName = `motion.${tag}`;
    // Support styled(motion.div).withConfig(...)
    Comp.withConfig = () => Comp;
    return Comp;
  },
};

export const motion = new Proxy({}, motionHandler);

export const AnimatePresence = ({ children }) => <>{children}</>;

// ── react-scroll mock ──
export const ScrollLink = React.forwardRef(
  ({ to, children, className, onClick, spy, smooth, offset, duration, activeClass, ...rest }, ref) =>
    React.createElement('a', { href: `#${to}`, className, onClick, ref, ...rest }, children)
);
ScrollLink.displayName = 'ScrollLink';
