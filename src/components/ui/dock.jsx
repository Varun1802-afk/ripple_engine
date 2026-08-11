import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import React, {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '../../lib/utils';

const DEFAULT_MAGNIFICATION = 64;
const DEFAULT_DISTANCE = 140;
const DEFAULT_PANEL_HEIGHT = 44;

const DockContext = createContext(undefined);

function DockProvider({ children, value }) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  spring = { mass: 0.1, stiffness: 170, damping: 12 },
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        height: `${panelHeight + 10}px`,
        position: 'relative'
      }}
    >
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          'flex flex-row items-center gap-3 px-2 py-1',
          className
        )}
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: `${panelHeight}px`,
          width: 'auto'
        }}
        role="toolbar"
        aria-label="Application dock"
      >
        <DockProvider value={{ mouseX, spring, distance, magnification }}>
          {children}
        </DockProvider>
      </motion.div>
    </div>
  );
}

function DockItem({ children, className, onClick }) {
  const ref = useRef(null);
  const { distance, magnification, mouseX, spring } = useDock();
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val) => {
    const domRect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - domRect.x - domRect.width / 2;
  });

  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [44, magnification, 44]
  );

  const width = useSpring(widthTransform, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width,
        height: width,
        minWidth: '44px',
        minHeight: '44px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      onClick={onClick}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      className={cn(
        'relative flex items-center justify-center cursor-pointer rounded-xl p-2 transition-colors hover:bg-slate-200/50 dark:hover:bg-neutral-800/60',
        className
      )}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { width, isHovered })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className, ...rest }) {
  const isHovered = rest['isHovered'];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });

    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 34 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12 }}
          className={cn(
            'absolute top-10 left-1/2 whitespace-nowrap rounded-md border border-slate-200/90 bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800',
            className
          )}
          role="tooltip"
          style={{ x: '-50%', zIndex: 100, pointerEvents: 'none' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className, ...rest }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
      className={cn('flex items-center justify-center', className)}
    >
      {children}
    </div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
