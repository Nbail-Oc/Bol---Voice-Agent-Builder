"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ChevronDownIcon, StopIcon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface PromptModel {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PromptAction {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface PromptInputProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  models?: PromptModel[];
  model?: string;
  defaultModel?: string;
  onModelChange?: (model: string) => void;
  actions?: PromptAction[];
  onAction?: (action: string) => void;
  onSubmit?: (value: string, model?: string) => void | Promise<void>;
  loading?: boolean;
  onStop?: () => void;
  minRows?: number;
  maxRows?: number;
  leadingAction?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function PromptInput({
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  models = [],
  model: controlledModel,
  defaultModel,
  onModelChange,
  actions = [],
  onAction,
  onSubmit,
  loading = false,
  onStop,
  minRows = 2,
  maxRows = 8,
  leadingAction,
  placeholder = "Describe the voice agent you want to build…",
  disabled = false,
  className,
}: PromptInputProps) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const textValue = isControlled ? controlledValue : internalValue;

  const initialModel = defaultModel || (models.length > 0 ? models[0].value : "");
  const [internalModel, setInternalModel] = useState(initialModel);
  const currentModelValue = controlledModel !== undefined ? controlledModel : internalModel;
  const currentModel = models.find((m) => m.value === currentModelValue) || models[0];

  const [actionsOpen, setActionsOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const lineHeight = 22;
  const minHeight = minRows * lineHeight + 18;
  const maxHeight = maxRows * lineHeight + 18;

  // Auto resize textarea height based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(maxHeight, Math.max(minHeight, textarea.scrollHeight));
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [minHeight, maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [textValue, adjustHeight]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(e.target as Node)
      ) {
        setActionsOpen(false);
      }
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(e.target as Node)
      ) {
        setModelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalValue(val);
    }
    onValueChange?.(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (loading) {
        onStop?.();
      } else if (textValue.trim() && !disabled) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = () => {
    const prompt = textValue.trim();
    if (!prompt || loading || disabled) return;
    onSubmit?.(prompt, currentModelValue);
    if (!isControlled) {
      setInternalValue("");
    }
    onValueChange?.("");
    if (textareaRef.current) {
      textareaRef.current.style.height = `${minHeight}px`;
    }
  };

  const handleSelectModel = (val: string) => {
    if (controlledModel === undefined) {
      setInternalModel(val);
    }
    onModelChange?.(val);
    setModelOpen(false);
  };

  const handleSelectAction = (val: string) => {
    onAction?.(val);
    setActionsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col rounded-none border border-white/15 bg-[#0a0a0a] transition-colors focus-within:border-white/40 shadow-2xl font-sans",
        className
      )}
    >
      {/* Auto-growing Textarea */}
      <textarea
        ref={textareaRef}
        value={textValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        className="w-full resize-none border-0 bg-transparent px-4 py-3.5 text-sm leading-[22px] text-white placeholder:text-neutral-500 outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{ minHeight: `${minHeight}px` }}
      />

      {/* Composer Bottom Action Toolbar */}
      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          {/* Actions Menu Trigger */}
          {actions.length > 0 && (
            <div className="relative" ref={actionsMenuRef}>
              <button
                type="button"
                onClick={() => setActionsOpen((prev) => !prev)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-none border border-white/10 bg-transparent text-neutral-400 hover:border-white/30 hover:bg-white/5 hover:text-white transition-all cursor-pointer",
                  actionsOpen && "border-white/30 bg-white/10 text-white"
                )}
                aria-label="Add to prompt"
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  className={cn(
                    "size-3.5 transition-transform duration-200",
                    actionsOpen && "rotate-45"
                  )}
                />
              </button>

              {/* Actions Popover Menu */}
              <AnimatePresence>
                {actionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full left-0 mb-2 z-50 w-64 border border-white/15 bg-[#121212] p-1 shadow-2xl rounded-none"
                  >
                    <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 border-b border-white/10 mb-1">
                      Prompt Actions
                    </div>
                    {actions.map((act) => (
                      <button
                        key={act.value}
                        type="button"
                        onClick={() => handleSelectAction(act.value)}
                        className="flex w-full items-start gap-2.5 px-2.5 py-2 text-left hover:bg-white/5 transition-colors cursor-pointer group rounded-none"
                      >
                        <span className="mt-0.5 text-neutral-400 group-hover:text-white transition-colors">
                          {act.icon}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-white">
                            {act.label}
                          </span>
                          {act.description && (
                            <span className="text-[11px] text-neutral-400">
                              {act.description}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Optional leadingAction */}
          {leadingAction}

          {/* Model Selection Dropdown */}
          {models.length > 0 && (
            <div className="relative" ref={modelMenuRef}>
              <button
                type="button"
                onClick={() => setModelOpen((prev) => !prev)}
                className="inline-flex h-7 items-center gap-1.5 px-2 rounded-none border border-white/10 bg-transparent text-xs font-medium text-neutral-300 hover:border-white/30 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                {currentModel?.icon && (
                  <span className="size-3.5 flex items-center justify-center text-neutral-400">
                    {currentModel.icon}
                  </span>
                )}
                <span className="truncate max-w-[120px]">
                  {currentModel?.label || "Model"}
                </span>
                <HugeiconsIcon icon={ChevronDownIcon} className="size-3 text-neutral-500" />
              </button>

              {/* Models Popover */}
              <AnimatePresence>
                {modelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute bottom-full left-0 mb-2 z-50 w-52 border border-white/15 bg-[#121212] p-1 shadow-2xl rounded-none"
                  >
                    <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500 border-b border-white/10 mb-1">
                      Select Model
                    </div>
                    {models.map((m) => {
                      const isSelected = m.value === currentModelValue;
                      return (
                        <button
                          key={m.value}
                          type="button"
                          disabled={m.disabled}
                          onClick={() => handleSelectModel(m.value)}
                          className={cn(
                            "flex w-full items-center justify-between px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer rounded-none",
                            isSelected
                              ? "bg-white/10 text-white font-medium"
                              : "text-neutral-300 hover:bg-white/5 hover:text-white",
                            m.disabled && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {m.icon && (
                              <span className="size-3.5 flex items-center justify-center">
                                {m.icon}
                              </span>
                            )}
                            <span>{m.label}</span>
                          </div>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right side: Keyboard hint & Animated Send/Stop Button */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline font-mono text-[11px] text-neutral-500 select-none">
            Enter to send, Shift+Enter for newline
          </span>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.button
                key="stop-button"
                type="button"
                onClick={onStop}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex h-7 w-7 items-center justify-center rounded-none border border-red-500/30 bg-red-950/40 text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors cursor-pointer"
                aria-label="Stop generating"
              >
                <HugeiconsIcon icon={StopIcon} className="size-3 fill-current" />
              </motion.button>
            ) : (
              <motion.button
                key="send-button"
                type="button"
                onClick={handleSubmit}
                disabled={disabled || !textValue.trim()}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-none bg-white text-black transition-all cursor-pointer",
                  disabled || !textValue.trim()
                    ? "opacity-30 cursor-not-allowed bg-neutral-600 text-neutral-400"
                    : "hover:bg-neutral-200 active:scale-95 shadow-md"
                )}
                aria-label="Send prompt"
              >
                <HugeiconsIcon icon={ArrowUp01Icon} className="size-4 stroke-[2.5]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

