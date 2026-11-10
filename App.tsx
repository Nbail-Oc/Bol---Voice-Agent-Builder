"use client";

import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleIcon, EyeIcon, EyeOffIcon, GoogleIcon, GithubIcon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";

export default function App({ onComplete }: { onComplete?: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete();
    } else if (typeof window !== "undefined") {
      window.location.href = "/chat";
    }
  };

  const handleSocialPass = () => {
    if (onComplete) {
      onComplete();
    } else if (typeof window !== "undefined") {
      window.location.href = "/chat";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main
      className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4 font-sans antialiased"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* 3. Left Column (Hero & Background Video) */}
      <section className="hidden lg:flex w-[52%] relative flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        {/* Hero Content Container */}
        <motion.div
          className="z-10 w-full max-w-xs space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand/Logo */}
          <motion.div variants={itemVariants} className="flex items-center gap-2.5">
            <img src="/LOGO.png" alt="Bol Logo" className="w-6 h-6 object-contain rounded-sm" />
            <span className="text-xl font-semibold tracking-tight text-white">
              Bol
            </span>
          </motion.div>

          {/* Heading Block */}
          <motion.div variants={itemVariants} className="space-y-2 text-center">
            <h1 className="text-4xl font-medium tracking-tight whitespace-nowrap text-white">
              Join Bol
            </h1>
            <p className="text-white/60 text-sm leading-relaxed px-4">
              Follow these 3 quick phases to activate your space.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div variants={itemVariants} className="space-y-3">
            <StepItem number={1} text="Register your identity" active />
            <StepItem number={2} text="Configure your studio" />
            <StepItem number={3} text="Finalize your profile" />
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Right Column (Sign Up Form) */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="space-y-2 text-left">
            <h2 className="text-3xl font-medium tracking-tight text-white">
              Create New Profile
            </h2>
            <p className="text-white/40 text-sm">
              Input your basic details to begin the journey.
            </p>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <SocialButton
              icon={<HugeiconsIcon icon={GoogleIcon} className="w-4 h-4" />}
              label="Google"
              onClick={handleSocialPass}
            />
            <SocialButton
              icon={<HugeiconsIcon icon={GithubIcon} className="w-4 h-4" />}
              label="GitHub"
              onClick={handleSocialPass}
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">
              Or
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputGroup
                label="First Name"
                placeholder="Nabil"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <InputGroup
                label="Last Name"
                placeholder="Thange"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <InputGroup
              label="Email"
              placeholder="nabil@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 pr-11 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <HugeiconsIcon icon={EyeOffIcon} className="w-4 h-4" />
                  ) : (
                    <HugeiconsIcon icon={EyeIcon} className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p
                className="text-[11px] text-white/40"
                style={{ fontFamily: "'Geist Mono', monospace" }}
              >
                Requires at least 8 symbols.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all mt-4 cursor-pointer text-sm"
            >
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleSocialPass}
              className="text-white/40 text-sm hover:text-white transition-colors cursor-pointer"
            >
              Member of the team?{" "}
              <span className="text-white underline underline-offset-4">
                Log in
              </span>
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// 5. Reusable Components to Create
export function StepItem({
  number,
  text,
  active = false,
}: {
  number: number | string;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all ${active
          ? "bg-white text-black border border-white"
          : "bg-brand-gray text-white border-none"
        }`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${active ? "bg-black text-white" : "bg-white/10 text-white/40"
          }`}
        style={{ fontFamily: "'Geist Mono', monospace" }}
      >
        {number}
      </div>
      <span className="text-sm font-medium tracking-tight">{text}</span>
    </div>
  );
}

export function SocialButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2.5 h-12 w-full bg-black border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-white cursor-pointer"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function InputGroup({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-sm font-medium text-white">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm"
      />
    </div>
  );
}


