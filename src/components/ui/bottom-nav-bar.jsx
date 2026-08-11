import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const MOBILE_LABEL_WIDTH = 84;

export function BottomNavBar({
  items = [],
  className,
  stickyBottom = false,
}) {
  return (
    <motion.nav
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Application Navigation"
      className={cn(
        "bg-transparent flex items-center p-1 space-x-1 max-w-full h-[48px]",
        stickyBottom && "fixed inset-x-0 bottom-4 mx-auto z-20 w-fit",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = Boolean(item.isActive);

        return (
          <motion.button
            key={item.id || item.label}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-0 px-3 py-1.5 rounded-full transition-colors duration-200 relative h-9 min-w-[40px] min-h-[36px] max-h-[40px]",
              isActive
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md gap-2 font-bold"
                : "bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-neutral-800/60",
              "focus:outline-none focus-visible:ring-0 cursor-pointer"
            )}
            onClick={item.onClick}
            aria-label={item.label}
            type="button"
          >
            {Icon && (
              <Icon
                size={18}
                strokeWidth={isActive ? 2.5 : 2}
                aria-hidden
                className={cn(
                  "transition-colors duration-200 flex-shrink-0",
                  item.iconClassName
                )}
              />
            )}

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "6px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="overflow-hidden flex items-center max-w-[90px]"
            >
              <span
                className={cn(
                  "font-bold text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis leading-none",
                  isActive ? "text-white dark:text-slate-900" : "opacity-0"
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
