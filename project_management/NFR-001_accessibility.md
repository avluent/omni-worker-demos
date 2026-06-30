# NFR-001: Accessibility

| Field | Value |
|-------|-------|
| **ID** | NFR-001 |
| **Title** | Accessibility Compliance |
| **Category** | Quality — Usability |
| **Created** | 2026-06-30T00:00:00.000Z |
| **Last Updated** | 2026-06-30T00:00:00.000Z |
| **Priority** | High |

## Description

As a user with disabilities, I want the web demos to be accessible via keyboard, screen readers, and assistive technologies, so that I can evaluate omni-worker features regardless of my abilities.

## Definition of Done

- [ ] Web demos meet WCAG 2.1 AA compliance
- [ ] Tab navigation uses WAI-ARIA tab pattern
- [ ] All interactive elements are keyboard-focusable
- [ ] Color contrast ratio >= 4.5:1 for text
- [ ] Error messages announced to screen readers (aria-live)
- [ ] Loading states announced (aria-busy)
- [ ] Node.js demos: no accessibility concerns (terminal output)

## Specification

### ARIA Roles for Tabs

| Element | Role | Properties |
|---------|------|-----------|
| Tab bar | `tablist` | — |
| Tab button | `tab` | `aria-selected`, `aria-controls` |
| Tab panel | `tabpanel` | `role="tabpanel"`, `aria-labelledby` |

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move focus between tabs and controls |
| Enter/Space | Activate focused tab or button |
| Arrow Left/Right | Move between tabs (when tab bar focused) |
| Escape | Close modal or dismiss error |

### Screen Reader Announcements

```
Status element: aria-live="polite"
Loading indicator: aria-busy="true" on container
Error element: aria-live="assertive"
```

### Color Scheme

| State | Color | Contrast |
|-------|-------|----------|
| Default text | #1a1a1a on #ffffff | > 15:1 |
| Success | #155724 on #d4edda | > 4.5:1 |
| Error | #721c24 on #f8d7da | > 4.5:1 |
| Loading | #0c5460 on #d1ecf1 | > 4.5:1 |

### Compliance Standard

WCAG 2.1 Level AA — ISO/IEC 40500

### Exceptions

- Node.js demos run in terminal; terminal accessibility depends on the terminal emulator
- Worker computation times are not accessible concerns (non-visual)

### Tests

| Test | Tool | Assertion |
|------|------|-----------|
| ARIA audit | axe-core | No violations |
| Keyboard nav | Manual | All features reachable via keyboard |
| Contrast check | Lighthouse | Contrast ratio >= 4.5:1 |
| Screen reader | NVDA/VoiceOver | Tab labels and results announced |
