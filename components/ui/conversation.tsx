"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ConversationContextType {
  isAtBottom: boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const ConversationContext = React.createContext<ConversationContextType | null>(null);

export function useConversationContext() {
  const context = React.useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversationContext must be used within a <Conversation />");
  }
  return context;
}

export interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: ScrollBehavior;
  resize?: ScrollBehavior;
}

export function Conversation({
  children,
  className,
  initial = "smooth",
  resize = "smooth",
  ...props
}: ConversationProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const isInitialMount = React.useRef(true);

  const checkIfAtBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const threshold = 60; // px threshold from bottom
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    return atBottom;
  }, []);

  const handleScroll = React.useCallback(() => {
    setIsAtBottom(checkIfAtBottom());
  }, [checkIfAtBottom]);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
    setIsAtBottom(true);
  }, []);

  // Stick to bottom on content changes
  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      scrollToBottom(initial);
      return;
    }

    if (isAtBottom) {
      scrollToBottom(resize);
    }
  });

  return (
    <ConversationContext.Provider value={{ isAtBottom, scrollToBottom, scrollRef }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn("relative flex-1 min-h-0 overflow-y-auto selection:bg-white/20 conversation-scrollbar", className)}
        role="log"
        aria-live="polite"
        {...props}
      >
        {children}
      </div>
    </ConversationContext.Provider>
  );
}

export interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ConversationContent({
  children,
  className,
  ...props
}: ConversationContentProps) {
  return (
    <div
      className={cn("mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 w-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ConversationEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function ConversationEmptyState({
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  children,
  className,
  ...props
}: ConversationEmptyStateProps) {
  if (children) {
    return (
      <div className={cn("mx-auto max-w-2xl w-full", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto max-w-xl space-y-4 text-center py-16 flex flex-col items-center justify-center font-sans",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex size-10 items-center justify-center rounded-none border border-white/15 bg-white/5 text-neutral-300">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-xl font-medium tracking-tight text-white">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

import type { HTMLMotionProps } from "motion/react";

export interface ConversationScrollButtonProps extends HTMLMotionProps<"button"> {}

export function ConversationScrollButton({
  className,
  ...props
}: ConversationScrollButtonProps) {
  const { isAtBottom, scrollToBottom } = useConversationContext();

  return (
    <AnimatePresence>
      {!isAtBottom && (
        <motion.button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn(
            "fixed bottom-24 right-8 z-30 flex h-9 w-9 items-center justify-center rounded-none border border-white/20 bg-[#121212] text-white shadow-2xl hover:bg-neutral-800 hover:border-white/40 active:scale-95 transition-colors cursor-pointer",
            className
          )}
          aria-label="Scroll to bottom"
          {...props}
        >
          <HugeiconsIcon icon={ArrowDown01Icon} className="size-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
