"use client";
// src/components/ui/Input.tsx

import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  rows?: number;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  id,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: error ? "#ef4444" : "rgba(255,255,255,0.5)",
          }}
        >
          {label}
          {props.required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: focused ? "#0d6efd" : "rgba(255,255,255,0.3)",
            display: "flex", pointerEvents: "none",
            transition: "color 0.2s",
          }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: 40,
            padding: `0 ${rightIcon ? "36px" : "12px"} 0 ${leftIcon ? "36px" : "12px"}`,
            background: "rgba(255,255,255,0.05)",
            border: `1.5px solid ${error ? "#ef4444" : focused ? "#0d6efd" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8,
            color: "white",
            fontSize: 13,
            fontFamily: "'Lato', sans-serif",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: focused ? `0 0 0 3px ${error ? "rgba(239,68,68,0.15)" : "rgba(13,110,253,0.15)"}` : "none",
            ...style,
          }}
          {...props}
        />
        {rightIcon && (
          <span style={{
            position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)", display: "flex",
          }}>
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 11, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{hint}</span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  fullWidth = false,
  rows = 4,
  id,
  style,
  ...props
}: TextareaProps) {
  const [focused, setFocused] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div style={{ width: fullWidth ? "100%" : "auto", display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.1em", color: error ? "#ef4444" : "rgba(255,255,255,0.5)",
        }}>
          {label}
          {props.required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "rgba(255,255,255,0.05)",
          border: `1.5px solid ${error ? "#ef4444" : focused ? "#0d6efd" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8,
          color: "white",
          fontSize: 13,
          fontFamily: "'Lato', sans-serif",
          outline: "none",
          resize: "vertical",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: focused ? `0 0 0 3px ${error ? "rgba(239,68,68,0.15)" : "rgba(13,110,253,0.15)"}` : "none",
          ...style,
        }}
        {...props}
      />
      {error && <span style={{ fontSize: 11, color: "#ef4444" }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{hint}</span>}
    </div>
  );
}