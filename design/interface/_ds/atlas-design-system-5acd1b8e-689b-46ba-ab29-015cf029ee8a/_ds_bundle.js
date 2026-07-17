/* @ds-bundle: {"format":4,"namespace":"AtlasDesignSystem_5acd1b","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"30a0299c3cbf","components/core/Button.jsx":"a90ec3a3b29f","components/core/Card.jsx":"49717f1cf723","components/core/IconButton.jsx":"6849579b7dc7","components/core/Tag.jsx":"e00124d28dd6","components/feedback/Dialog.jsx":"6924573250a0","components/feedback/Toast.jsx":"dd7504ba0752","components/feedback/Tooltip.jsx":"d9cc2235d7c9","components/forms/Checkbox.jsx":"26dc2bf231d9","components/forms/Input.jsx":"53647527cc23","components/forms/Radio.jsx":"4e9dc346f7dc","components/forms/Select.jsx":"d8d41abceda8","components/forms/Switch.jsx":"3ff3afb829f3","components/navigation/Tabs.jsx":"bb15a9baac7e","ui_kits/dashboard/Widgets.jsx":"95e41e349855","ui_kits/editor/EditorWidgets.jsx":"0128c18e2230","ui_kits/game-session/InspectorPanel.jsx":"5cd35cbb9e51","ui_kits/game-session/MapView.jsx":"edc3136359c5","ui_kits/game-session/NotificationStack.jsx":"e1cd206f1012","ui_kits/game-session/TopBar.jsx":"efffa2471372"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AtlasDesignSystem_5acd1b = window.AtlasDesignSystem_5acd1b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
const statusColor = {
  neutral: {
    bg: 'var(--parchment-200)',
    fg: 'var(--ink-700)'
  },
  success: {
    bg: 'var(--status-success-soft)',
    fg: 'var(--moss-600)'
  },
  warning: {
    bg: 'var(--status-warning-soft)',
    fg: 'var(--amber-600)'
  },
  danger: {
    bg: 'var(--status-danger-soft)',
    fg: 'var(--brick-600)'
  },
  info: {
    bg: 'var(--status-info-soft)',
    fg: 'var(--teal-600)'
  },
  brass: {
    bg: 'var(--accent-primary-soft)',
    fg: 'var(--brass-700)'
  }
};
function Badge({
  children,
  status = 'neutral',
  dot = false,
  style
}) {
  const c = statusColor[status] || statusColor.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: c.bg,
      color: c.fg,
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-semibold)',
      padding: '3px 9px',
      borderRadius: 'var(--radius-pill)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: c.fg
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizeStyles = {
  sm: {
    padding: '6px 12px',
    fontSize: 'var(--text-xs)',
    gap: 6
  },
  md: {
    padding: '9px 16px',
    fontSize: 'var(--text-sm)',
    gap: 8
  },
  lg: {
    padding: '12px 22px',
    fontSize: 'var(--text-base)',
    gap: 10
  }
};
function variantStyle(variant, surface) {
  const onField = surface === 'field';
  switch (variant) {
    case 'primary':
      return {
        background: 'var(--accent-primary)',
        color: 'var(--text-on-accent)',
        border: '1px solid var(--brass-600)'
      };
    case 'secondary':
      return onField ? {
        background: 'var(--surface-field-raised)',
        color: 'var(--text-on-field)',
        border: '1px solid var(--border-field-strong)'
      } : {
        background: 'var(--surface-paper-raised)',
        color: 'var(--text-ink)',
        border: '1px solid var(--border-paper-strong)'
      };
    case 'ghost':
      return onField ? {
        background: 'transparent',
        color: 'var(--text-on-field)',
        border: '1px solid transparent'
      } : {
        background: 'transparent',
        color: 'var(--text-ink)',
        border: '1px solid transparent'
      };
    case 'danger':
      return {
        background: 'var(--status-danger)',
        color: '#fff',
        border: '1px solid var(--brick-600)'
      };
    default:
      return {};
  }
}

/** @type {React.CSSProperties} */
const base = {
  fontFamily: 'var(--font-ui)',
  fontWeight: 'var(--weight-semibold)',
  borderRadius: 'var(--radius-md)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 120ms ease, color 120ms ease, box-shadow 120ms ease, transform 80ms ease',
  letterSpacing: 'var(--tracking-normal)'
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  surface = 'paper',
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const vs = variantStyle(variant, surface);
  let bg = vs.background;
  if (!disabled && variant === 'primary') {
    bg = active ? 'var(--accent-primary-active)' : hover ? 'var(--accent-primary-hover)' : 'var(--accent-primary)';
  }
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    onClick: onClick,
    style: {
      ...base,
      ...sizeStyles[size],
      ...vs,
      background: bg,
      opacity: disabled ? 0.45 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transform: active && !disabled ? 'translateY(1px)' : 'none',
      ...style
    }
  }), leftIcon, children, rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  surface = 'paper',
  padding = 'var(--space-4)',
  elevated = true,
  style,
  ...rest
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      background: onField ? 'var(--surface-field-raised)' : 'var(--surface-paper)',
      border: `1px solid ${onField ? 'var(--border-field)' : 'var(--border-paper)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: elevated ? onField ? 'var(--shadow-field-md), var(--inset-field-bevel)' : 'var(--shadow-paper-md)' : 'none',
      padding,
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      fontFamily: 'var(--font-ui)',
      backdropFilter: onField ? 'blur(6px)' : undefined,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizePx = {
  sm: 28,
  md: 34,
  lg: 42
};
function IconButton({
  children,
  size = 'md',
  surface = 'paper',
  active = false,
  disabled = false,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const onField = surface === 'field';
  const px = sizePx[size];
  const bg = active ? onField ? 'var(--surface-field-sunken)' : 'var(--surface-paper-sunken)' : hover ? onField ? 'rgba(228,195,120,0.14)' : 'var(--accent-primary-soft)' : 'transparent';
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: px,
      height: px,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-sm)',
      border: active ? `1px solid ${onField ? 'var(--border-field-strong)' : 'var(--border-paper-strong)'}` : '1px solid transparent',
      background: bg,
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      transition: 'background 120ms ease',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  onRemove,
  surface = 'paper',
  style
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: onField ? 'var(--surface-field-sunken)' : 'var(--surface-paper-sunken)',
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      border: `1px solid ${onField ? 'var(--border-field)' : 'var(--border-paper)'}`,
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      padding: '4px 8px 4px 10px',
      borderRadius: 'var(--radius-sm)',
      ...style
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Remove",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      padding: 0,
      color: 'inherit',
      opacity: 0.6,
      fontSize: 13,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  width = 480
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--surface-scrim)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backdropFilter: 'blur(2px)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      maxWidth: '90%',
      background: 'var(--surface-paper)',
      border: '1px solid var(--border-paper)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-paper-lg)',
      fontFamily: 'var(--font-ui)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-6)',
      borderBottom: '1px solid var(--surface-paper-sunken)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-lg)',
      color: 'var(--text-ink)',
      fontWeight: 'var(--weight-medium)'
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: 20,
      color: 'var(--text-ink-faint)'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-6)',
      color: 'var(--text-ink)',
      fontSize: 'var(--text-sm)',
      lineHeight: 'var(--leading-normal)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4) var(--space-6)',
      borderTop: '1px solid var(--surface-paper-sunken)',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-3)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const accent = {
  neutral: 'var(--ink-500)',
  success: 'var(--status-success)',
  warning: 'var(--status-warning)',
  danger: 'var(--status-danger)',
  info: 'var(--status-info)'
};
function Toast({
  title,
  description,
  status = 'neutral',
  onDismiss
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-start',
      width: 320,
      background: 'var(--surface-field-raised)',
      border: '1px solid var(--border-field)',
      borderLeft: `3px solid ${accent[status]}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-field-md)',
      padding: 'var(--space-4)',
      fontFamily: 'var(--font-ui)',
      backdropFilter: 'blur(6px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-semibold)',
      color: 'var(--text-on-field)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-on-field-muted)',
      marginTop: 4,
      lineHeight: 'var(--leading-snug)'
    }
  }, description)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: 'none',
      background: 'none',
      color: 'var(--text-on-field-faint)',
      cursor: 'pointer',
      fontSize: 15
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function Tooltip({
  children,
  label,
  side = 'top'
}) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: {
      bottom: '120%',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    bottom: {
      top: '120%',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    left: {
      right: '120%',
      top: '50%',
      transform: 'translateY(-50%)'
    },
    right: {
      left: '120%',
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      ...pos,
      whiteSpace: 'nowrap',
      background: 'var(--ink-900)',
      color: 'var(--parchment-100)',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-medium)',
      padding: '5px 9px',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-field-sm)',
      zIndex: 60,
      pointerEvents: 'none'
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange,
  surface = 'paper',
  style
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-sm)',
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: 'var(--radius-sm)',
      flexShrink: 0,
      border: `1.5px solid ${checked ? 'var(--accent-primary)' : onField ? 'var(--border-field-strong)' : 'var(--border-paper-strong)'}`,
      background: checked ? 'var(--accent-primary)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 120ms ease, border-color 120ms ease'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "9",
    viewBox: "0 0 11 9",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 4.5L4 7.5L10 1",
    stroke: "var(--text-on-accent)",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  error,
  hint,
  surface = 'paper',
  icon = null,
  style,
  inputStyle,
  ...rest
}) {
  const onField = surface === 'field';
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: onField ? 'var(--text-on-field-muted)' : 'var(--text-ink-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 10,
      display: 'flex',
      color: onField ? 'var(--text-on-field-faint)' : 'var(--text-ink-faint)'
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    onFocus: e => {
      setFocus(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocus(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      padding: icon ? '9px 12px 9px 32px' : '9px 12px',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-ui)',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${error ? 'var(--status-danger)' : focus ? 'var(--accent-primary)' : onField ? 'var(--border-field)' : 'var(--border-paper)'}`,
      background: onField ? 'var(--surface-field-sunken)' : 'var(--surface-paper)',
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      outline: 'none',
      boxShadow: focus ? 'var(--focus-ring)' : 'none',
      transition: 'box-shadow 120ms ease, border-color 120ms ease',
      ...inputStyle
    }
  }))), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: error ? 'var(--status-danger)' : 'var(--text-ink-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  checked,
  onChange,
  name,
  surface = 'paper',
  style
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)',
      fontSize: 'var(--text-sm)',
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      flexShrink: 0,
      border: `1.5px solid ${checked ? 'var(--accent-primary)' : onField ? 'var(--border-field-strong)' : 'var(--border-paper-strong)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      background: 'var(--accent-primary)'
    }
  })), /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    checked: checked,
    onChange: onChange,
    style: {
      display: 'none'
    }
  }), label);
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  options = [],
  surface = 'paper',
  style,
  ...rest
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      fontFamily: 'var(--font-ui)',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      fontWeight: 'var(--weight-medium)',
      color: onField ? 'var(--text-on-field-muted)' : 'var(--text-ink-muted)'
    }
  }, label), /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    style: {
      padding: '9px 12px',
      fontSize: 'var(--text-sm)',
      fontFamily: 'var(--font-ui)',
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${onField ? 'var(--border-field)' : 'var(--border-paper)'}`,
      background: onField ? 'var(--surface-field-sunken)' : 'var(--surface-paper)',
      color: onField ? 'var(--text-on-field)' : 'var(--text-ink)',
      outline: 'none'
    }
  }), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked,
  onChange,
  surface = 'paper',
  disabled = false,
  style
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("button", {
    role: "switch",
    "aria-checked": checked,
    disabled: disabled,
    onClick: () => onChange && onChange(!checked),
    style: {
      width: 40,
      height: 22,
      borderRadius: 'var(--radius-pill)',
      border: 'none',
      padding: 2,
      display: 'inline-flex',
      justifyContent: checked ? 'flex-end' : 'flex-start',
      background: checked ? 'var(--accent-primary)' : onField ? 'var(--surface-field-sunken)' : 'var(--parchment-300)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background 150ms ease',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: onField ? 'var(--parchment-50)' : '#fff',
      boxShadow: '0 1px 2px rgba(0,0,0,.3)'
    }
  }));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function Tabs({
  items,
  value,
  onChange,
  surface = 'paper'
}) {
  const onField = surface === 'field';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-1)',
      borderBottom: `1px solid ${onField ? 'var(--border-field)' : 'var(--border-paper)'}`,
      fontFamily: 'var(--font-ui)'
    }
  }, items.map(it => {
    const isActive = it.value === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      onClick: () => onChange(it.value),
      style: {
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        padding: '10px 14px',
        fontSize: 'var(--text-sm)',
        fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-regular)',
        color: isActive ? onField ? 'var(--text-on-field)' : 'var(--text-ink)' : onField ? 'var(--text-on-field-muted)' : 'var(--text-ink-muted)',
        borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
        marginBottom: -1
      }
    }, it.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/Widgets.jsx
try { (() => {
function StatTile({
  label,
  value,
  delta,
  deltaGood = true
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-paper)',
      border: '1px solid var(--border-paper)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-paper-sm)',
      padding: 'var(--space-5)',
      flex: 1,
      minWidth: 150
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-ink-faint)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)',
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 30,
      color: 'var(--text-ink)',
      marginTop: 6
    }
  }, value), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: deltaGood ? 'var(--status-success)' : 'var(--status-danger)',
      marginTop: 4,
      fontWeight: 600
    }
  }, delta));
}
function Bars({
  data
}) {
  const max = Math.max(...data.map(d => d.value));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 10,
      height: 140
    }
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: `${d.value / max * 100}%`,
      background: 'var(--brass-400)',
      borderRadius: '3px 3px 0 0'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--text-ink-faint)',
      fontFamily: 'var(--font-mono)'
    }
  }, d.label))));
}
window.StatTile = StatTile;
window.Bars = Bars;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/Widgets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/editor/EditorWidgets.jsx
try { (() => {
function LayerRow({
  label,
  icon,
  visible,
  onToggle
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 8px',
      borderRadius: 6,
      fontSize: 13,
      color: 'var(--text-ink)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    style: {
      width: 14,
      height: 14,
      color: 'var(--text-ink-muted)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      color: visible ? 'var(--brass-600)' : 'var(--text-ink-faint)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": visible ? 'eye' : 'eye-off',
    style: {
      width: 14,
      height: 14
    }
  })));
}
function TilePalette({
  tiles,
  selected,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 6
    }
  }, tiles.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.name,
    onClick: () => onSelect(t.name),
    title: t.name,
    style: {
      aspectRatio: '1',
      border: selected === t.name ? '2px solid var(--brass-500)' : '1px solid var(--border-paper)',
      borderRadius: 6,
      background: t.color,
      cursor: 'pointer',
      padding: 0
    }
  })));
}
window.LayerRow = LayerRow;
window.TilePalette = TilePalette;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/editor/EditorWidgets.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game-session/InspectorPanel.jsx
try { (() => {
function InspectorPanel({
  tile,
  Card,
  Badge,
  Tabs,
  Button
}) {
  const [tab, setTab] = React.useState('overview');
  if (!tile) {
    return /*#__PURE__*/React.createElement(Card, {
      surface: "field",
      style: {
        width: 300,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: 'var(--text-on-field-muted)',
        fontSize: 13
      }
    }, "Select a tile to inspect");
  }
  return /*#__PURE__*/React.createElement(Card, {
    surface: "field",
    style: {
      width: 300,
      height: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      color: 'var(--text-on-field)'
    }
  }, "Kessa Hills"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-on-field-faint)',
      marginTop: 2
    }
  }, tile.x, ", ", tile.y)), /*#__PURE__*/React.createElement(Tabs, {
    surface: "field",
    items: [{
      value: 'overview',
      label: 'Overview'
    }, {
      value: 'units',
      label: 'Units'
    }, {
      value: 'buildings',
      label: 'Buildings'
    }],
    value: tab,
    onChange: setTab
  }), tab === 'overview' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontSize: 13,
      color: 'var(--text-on-field-muted)'
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Population",
    value: "18,204"
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Treasury",
    value: "+142/turn"
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Unrest",
    badge: /*#__PURE__*/React.createElement(Badge, {
      status: "success",
      dot: true
    }, "Low")
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Terrain",
    value: "Hills, forested"
  })), tab === 'units' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, ['3rd Spear Company', 'Kessa Militia'].map(u => /*#__PURE__*/React.createElement("div", {
    key: u,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13,
      color: 'var(--text-on-field)',
      padding: '8px 10px',
      background: 'var(--surface-field-sunken)',
      borderRadius: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, u), /*#__PURE__*/React.createElement(Badge, {
    status: "brass"
  }, "Garrisoned")))), tab === 'buildings' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontSize: 13,
      color: 'var(--text-on-field-muted)'
    }
  }, /*#__PURE__*/React.createElement("div", null, "Granary \xB7 Level 2"), /*#__PURE__*/React.createElement("div", null, "Palisade \xB7 Level 1"), /*#__PURE__*/React.createElement("div", null, "Market \xB7 Level 1")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    surface: "field",
    style: {
      flex: 1
    }
  }, "Manage"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "primary",
    style: {
      flex: 1
    }
  }, "Recruit")));
}
function Row({
  label,
  value,
  badge
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      borderTop: '1px solid rgba(255,255,255,.06)',
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, label), badge || /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-on-field)'
    }
  }, value));
}
window.InspectorPanel = InspectorPanel;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-session/InspectorPanel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game-session/MapView.jsx
try { (() => {
// Procedurally shaded terrain placeholder — stands in for real map art/tiles.
function MapView({
  selected,
  onSelectTile
}) {
  const tiles = [];
  const cols = 14,
    rows = 9;
  const rand = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = rand(x, y);
      let color = 'var(--moss-500)';
      if (n > 0.82) color = 'var(--ink-600)';else if (n > 0.68) color = 'var(--parchment-400)';else if (n < 0.12) color = 'var(--teal-500)';
      tiles.push({
        x,
        y,
        color,
        key: `${x}-${y}`
      });
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'var(--moss-600)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      gridTemplateColumns: `repeat(${cols},1fr)`,
      gridTemplateRows: `repeat(${rows},1fr)`,
      opacity: 0.9
    }
  }, tiles.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.key,
    onClick: () => onSelectTile(t),
    style: {
      background: t.color,
      cursor: 'pointer',
      outline: selected && selected.key === t.key ? '2px solid var(--brass-300)' : '1px solid rgba(0,0,0,0.08)',
      outlineOffset: -1
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 30% 20%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 14,
      left: 14,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'rgba(255,255,255,.6)',
      background: 'rgba(0,0,0,.35)',
      padding: '4px 8px',
      borderRadius: 4
    }
  }, "placeholder terrain \u2014 replace with real map art"));
}
window.MapView = MapView;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-session/MapView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game-session/NotificationStack.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function NotificationStack({
  toasts,
  Toast
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 76,
      right: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      zIndex: 40
    }
  }, toasts.map(t => /*#__PURE__*/React.createElement(Toast, _extends({
    key: t.id
  }, t))));
}
window.NotificationStack = NotificationStack;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-session/NotificationStack.jsx", error: String((e && e.message) || e) }); }

// ui_kits/game-session/TopBar.jsx
try { (() => {
function TopBar({
  resources,
  turn,
  onEndTurn
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'var(--surface-field-raised)',
      borderBottom: '1px solid var(--border-field)',
      backdropFilter: 'blur(8px)',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text-on-field)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      letterSpacing: 'var(--tracking-tight)',
      color: 'var(--brass-300)'
    }
  }, "ATLAS"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1,
      height: 18,
      background: 'var(--border-field)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-on-field-muted)'
    }
  }, "Province of Kessa")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      fontFamily: 'var(--font-mono)',
      fontSize: 14
    }
  }, resources.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.label || i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": r.icon,
    style: {
      width: 15,
      height: 15,
      color: 'var(--brass-300)'
    }
  }), /*#__PURE__*/React.createElement("span", null, r.value)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-on-field-muted)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wider)'
    }
  }, "Turn ", turn), /*#__PURE__*/React.createElement("button", {
    onClick: onEndTurn,
    style: {
      background: 'var(--accent-primary)',
      color: 'var(--text-on-accent)',
      border: '1px solid var(--brass-600)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 18px',
      fontWeight: 600,
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'var(--font-ui)'
    }
  }, "End Turn")));
}
window.TopBar = TopBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/game-session/TopBar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
