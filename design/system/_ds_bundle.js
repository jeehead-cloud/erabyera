/* @ds-bundle: {"format":4,"namespace":"AtlasDesignSystem_b2128a","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Checkbox","sourcePath":"components/core/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Radio","sourcePath":"components/core/Radio.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"Switch","sourcePath":"components/core/Switch.jsx"},{"name":"Tabs","sourcePath":"components/core/Tabs.jsx"},{"name":"Tooltip","sourcePath":"components/core/Tooltip.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Panel","sourcePath":"components/game/Panel.jsx"},{"name":"StatMeter","sourcePath":"components/game/StatMeter.jsx"},{"name":"StatusPill","sourcePath":"components/game/StatusPill.jsx"}],"sourceHashes":{"components/core/Button.jsx":"69418c88b635","components/core/Checkbox.jsx":"ccee7ca0dc69","components/core/IconButton.jsx":"5377d69c211c","components/core/Input.jsx":"c44c3a8cf2db","components/core/Radio.jsx":"40ad87d8983e","components/core/Select.jsx":"3bf23db6a4dd","components/core/Switch.jsx":"8d89dfb18611","components/core/Tabs.jsx":"3b32cbb4f9a9","components/core/Tooltip.jsx":"d72978c1eab6","components/feedback/Badge.jsx":"74665f71ffe8","components/feedback/Dialog.jsx":"b6d945dfec5f","components/feedback/Tag.jsx":"43c213f32b70","components/feedback/Toast.jsx":"65ae327fe509","components/game/Panel.jsx":"42a86e28775e","components/game/StatMeter.jsx":"bd9ce6b030eb","components/game/StatusPill.jsx":"6d62b9ae722c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AtlasDesignSystem_b2128a = window.AtlasDesignSystem_b2128a || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
const sizeMap = {
  sm: {
    padding: "0 10px",
    height: "28px",
    font: "var(--text-label)"
  },
  md: {
    padding: "0 14px",
    height: "32px",
    font: "600 var(--text-size-sm)/1 var(--font-sans)"
  },
  lg: {
    padding: "0 18px",
    height: "40px",
    font: "600 var(--text-size-md)/1 var(--font-sans)"
  }
};
const variantMap = {
  primary: {
    background: "var(--accent-primary)",
    color: "var(--text-on-accent)",
    border: "1px solid transparent"
  },
  secondary: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-default)"
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "1px solid transparent"
  },
  danger: {
    background: "var(--accent-danger)",
    color: "var(--text-on-accent)",
    border: "1px solid transparent"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  icon = null,
  onClick,
  style
}) {
  const s = sizeMap[size] || sizeMap.md;
  const v = variantMap[variant] || variantMap.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  let background = v.background;
  if (!disabled && variant === "primary") background = active ? "var(--accent-primary-active)" : hover ? "var(--accent-primary-hover)" : v.background;
  if (!disabled && variant === "danger") background = hover ? "var(--accent-danger-hover)" : v.background;
  if (!disabled && (variant === "secondary" || variant === "ghost")) background = hover ? "var(--surface-panel-raised)" : v.background;
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled ? undefined : onClick,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      padding: s.padding,
      height: s.height,
      font: s.font,
      letterSpacing: size === "sm" ? "var(--text-tracking-wide)" : "normal",
      textTransform: size === "sm" ? "uppercase" : "none",
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)",
      background,
      color: v.color,
      border: v.border,
      boxSizing: "border-box",
      ...style
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Checkbox.jsx
try { (() => {
function Checkbox({
  checked,
  onChange,
  label,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: disabled ? undefined : () => onChange && onChange(!checked),
    style: {
      width: 16,
      height: 16,
      borderRadius: "3px",
      border: checked ? "1px solid var(--accent-primary)" : "1px solid var(--border-default)",
      background: checked ? "var(--accent-primary)" : "var(--surface-input)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background var(--duration-fast) var(--ease-out)"
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 10 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1.5 5L4 7.5L8.5 2.5",
    stroke: "var(--text-on-accent)",
    strokeWidth: "1.6",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body-sm)",
      color: "var(--text-secondary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  icon,
  size = "md",
  active = false,
  disabled = false,
  onClick,
  title
}) {
  const dims = size === "sm" ? 28 : size === "lg" ? 40 : 32;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    title: title,
    disabled: disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dims,
      height: dims,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      border: active ? "1px solid var(--border-selected)" : "1px solid transparent",
      background: active ? "var(--accent-primary-wash)" : hover ? "var(--surface-panel-raised)" : "transparent",
      color: active ? "var(--accent-primary)" : "var(--text-secondary)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1,
      transition: "background var(--duration-fast) var(--ease-out)",
      boxSizing: "border-box"
    }
  }, icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  size = "md",
  icon = null,
  style
}) {
  const [focused, setFocused] = React.useState(false);
  const h = size === "sm" ? 28 : 32;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      height: h,
      padding: "0 10px",
      boxSizing: "border-box",
      background: "var(--surface-input)",
      border: `1px solid ${focused ? "var(--border-focus)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-sm)",
      opacity: disabled ? 0.5 : 1,
      transition: "border-color var(--duration-fast) var(--ease-out)",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      color: "var(--text-tertiary)"
    }
  }, icon), /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    type: type,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      font: "var(--text-body-sm)",
      color: "var(--text-primary)"
    }
  }));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Radio.jsx
try { (() => {
function Radio({
  checked,
  onChange,
  label,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: disabled ? undefined : () => onChange && onChange(),
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      border: checked ? "1px solid var(--accent-primary)" : "1px solid var(--border-default)",
      background: "var(--surface-input)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--accent-primary)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-body-sm)",
      color: "var(--text-secondary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Radio.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function Select({
  value,
  onChange,
  options,
  size = "md",
  disabled = false,
  style
}) {
  const h = size === "sm" ? 28 : 32;
  return /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    disabled: disabled,
    style: {
      height: h,
      padding: "0 10px",
      boxSizing: "border-box",
      background: "var(--surface-input)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      color: "var(--text-primary)",
      font: "var(--text-body-sm)",
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : "pointer",
      ...style
    }
  }, options.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt.value,
    value: opt.value
  }, opt.label)));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/core/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  disabled = false
}) {
  return /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": checked,
    onClick: disabled ? undefined : () => onChange && onChange(!checked),
    style: {
      width: 34,
      height: 20,
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--accent-primary)" : "var(--gray-6)",
      display: "inline-flex",
      alignItems: "center",
      padding: "2px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "background var(--duration-fast) var(--ease-out)",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "var(--gray-10)",
      transform: checked ? "translateX(14px)" : "translateX(0)",
      transition: "transform var(--duration-fast) var(--ease-out)"
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Switch.jsx", error: String((e && e.message) || e) }); }

// components/core/Tabs.jsx
try { (() => {
function Tabs({
  items,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "2px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, items.map(item => {
    const active = item.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: item.value,
      onClick: () => onChange && onChange(item.value),
      style: {
        padding: "8px 14px",
        font: "600 var(--text-size-sm)/1 var(--font-sans)",
        color: active ? "var(--text-primary)" : "var(--text-tertiary)",
        background: "transparent",
        border: "none",
        borderBottom: active ? "2px solid var(--accent-primary)" : "2px solid transparent",
        marginBottom: "-1px",
        cursor: "pointer"
      }
    }, item.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/core/Tooltip.jsx
try { (() => {
function Tooltip({
  children,
  label,
  side = "top"
}) {
  const [show, setShow] = React.useState(false);
  const pos = side === "top" ? {
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)"
  } : side === "bottom" ? {
    top: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)"
  } : side === "left" ? {
    right: "calc(100% + 6px)",
    top: "50%",
    transform: "translateY(-50%)"
  } : {
    left: "calc(100% + 6px)",
    top: "50%",
    transform: "translateY(-50%)"
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      ...pos,
      background: "var(--gray-1)",
      color: "var(--text-primary)",
      font: "var(--text-data-sm)",
      padding: "4px 8px",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border-subtle)",
      whiteSpace: "nowrap",
      zIndex: 50,
      boxShadow: "var(--shadow-sm)"
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
const toneMap = {
  neutral: {
    bg: "var(--gray-5)",
    fg: "var(--gray-9)"
  },
  info: {
    bg: "var(--accent-info-muted)",
    fg: "var(--accent-info)"
  },
  success: {
    bg: "var(--accent-success-muted)",
    fg: "var(--accent-success)"
  },
  danger: {
    bg: "var(--accent-danger-muted)",
    fg: "var(--accent-danger)"
  },
  primary: {
    bg: "var(--accent-primary-wash)",
    fg: "var(--accent-primary)"
  }
};
function Badge({
  children,
  tone = "neutral"
}) {
  const t = toneMap[tone] || toneMap.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: "var(--radius-pill)",
      background: t.bg,
      color: t.fg,
      font: "var(--text-label-wide)",
      letterSpacing: "var(--text-tracking-wide)",
      textTransform: "uppercase"
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  footer,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      background: "var(--surface-overlay)",
      backdropFilter: "var(--blur-scrim)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: "380px",
      background: "var(--surface-panel)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px",
      borderBottom: "1px solid var(--border-subtle)",
      font: "var(--text-heading-sm)",
      color: "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px",
      font: "var(--text-body)",
      color: "var(--text-secondary)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px",
      borderTop: "1px solid var(--border-subtle)",
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
function Tag({
  children,
  onRemove
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "3px 8px",
      borderRadius: "var(--radius-sm)",
      background: "var(--surface-panel-raised)",
      border: "1px solid var(--border-subtle)",
      color: "var(--text-secondary)",
      font: "var(--text-body-sm)"
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: onRemove,
    style: {
      cursor: "pointer",
      color: "var(--text-tertiary)",
      fontSize: "12px",
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const toneMap = {
  info: "var(--accent-info)",
  success: "var(--accent-success)",
  danger: "var(--accent-danger)"
};
function Toast({
  tone = "info",
  title,
  message,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
      width: "300px",
      padding: "12px",
      borderRadius: "var(--radius-md)",
      background: "var(--surface-panel)",
      border: "1px solid var(--border-default)",
      borderLeft: `3px solid ${toneMap[tone] || toneMap.info}`,
      boxShadow: "var(--shadow-md)",
      boxSizing: "border-box"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: "600 var(--text-size-sm)/1.3 var(--font-sans)",
      color: "var(--text-primary)",
      marginBottom: "2px"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: "var(--text-body-sm)",
      color: "var(--text-secondary)"
    }
  }, message)), onClose && /*#__PURE__*/React.createElement("span", {
    onClick: onClose,
    style: {
      cursor: "pointer",
      color: "var(--text-tertiary)",
      font: "var(--text-body-sm)"
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/game/Panel.jsx
try { (() => {
function Panel({
  title,
  actions,
  children,
  width = "var(--panel-width-md)"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      background: "var(--surface-panel)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-md)",
      overflow: "hidden",
      boxSizing: "border-box"
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--surface-panel-raised)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-label-wide)",
      letterSpacing: "var(--text-tracking-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, title), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "4px"
    }
  }, actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px"
    }
  }, children));
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/Panel.jsx", error: String((e && e.message) || e) }); }

// components/game/StatMeter.jsx
try { (() => {
const toneMap = {
  primary: "var(--accent-primary)",
  info: "var(--accent-info)",
  success: "var(--accent-success)",
  danger: "var(--accent-danger)"
};
function StatMeter({
  label,
  value,
  max,
  tone = "primary"
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-label)",
      letterSpacing: "var(--text-tracking-wide)",
      textTransform: "uppercase",
      color: "var(--text-tertiary)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-data-sm)",
      color: "var(--text-secondary)"
    }
  }, value, "/", max)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "6px",
      borderRadius: "var(--radius-pill)",
      background: "var(--gray-5)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${pct}%`,
      background: toneMap[tone] || toneMap.primary,
      transition: "width var(--duration-normal) var(--ease-out)"
    }
  })));
}
Object.assign(__ds_scope, { StatMeter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/StatMeter.jsx", error: String((e && e.message) || e) }); }

// components/game/StatusPill.jsx
try { (() => {
const toneMap = {
  player: "var(--faction-player)",
  ally: "var(--faction-ally)",
  enemy: "var(--faction-enemy)",
  neutral: "var(--faction-neutral)"
};
function StatusPill({
  faction = "neutral",
  label
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      font: "var(--text-data-sm)",
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: toneMap[faction] || toneMap.neutral,
      flexShrink: 0
    }
  }), label);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/StatusPill.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.StatMeter = __ds_scope.StatMeter;

__ds_ns.StatusPill = __ds_scope.StatusPill;

})();
