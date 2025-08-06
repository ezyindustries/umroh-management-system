# Glassmorphism Design System Documentation

## Overview
Umroh Management System menggunakan Glassmorphism sebagai design language utama, menciptakan interface yang modern, elegant, dan user-friendly dengan efek transparansi dan blur yang distinctive.

## Design Principles

### 1. Transparency & Blur
- Background blur untuk depth perception
- Semi-transparent surfaces
- Layered glass effects
- Smooth transitions

### 2. Soft UI Elements
- Rounded corners (8-24px)
- Subtle shadows
- Gradient borders
- Smooth animations

### 3. Color Palette

#### Primary Colors
```css
:root {
    /* Blues */
    --primary-blue: #3B82F6;
    --primary-blue-light: #60A5FA;
    --primary-blue-dark: #2563EB;
    
    /* Greens */
    --primary-green: #10B981;
    --primary-green-light: #34D399;
    --primary-green-dark: #059669;
    
    /* Purples */
    --primary-purple: #8B5CF6;
    --primary-purple-light: #A78BFA;
    --primary-purple-dark: #7C3AED;
    
    /* Orange/Yellow */
    --primary-orange: #F59E0B;
    --primary-yellow: #FCD34D;
    
    /* Red/Pink */
    --primary-red: #EF4444;
    --primary-pink: #EC4899;
}
```

#### Background Colors
```css
:root {
    /* Dark backgrounds */
    --bg-primary: rgba(15, 23, 42, 0.95);
    --bg-secondary: rgba(30, 41, 59, 0.9);
    --bg-tertiary: rgba(51, 65, 85, 0.8);
    
    /* Glass backgrounds */
    --glass-white: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-hover: rgba(255, 255, 255, 0.08);
}
```

## Core Components

### 1. Glass Card
Basic building block for content containers.

```css
.glass-card {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

/* Hover effect */
.glass-card:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 25px 70px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
```

### 2. Glass Input
Form inputs with glassmorphism style.

```css
.glass-input {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(10px);
    color: white !important;
    padding: 12px 16px !important;
    border-radius: 12px !important;
    width: 100% !important;
    transition: all 0.3s ease !important;
}

.glass-input:focus {
    border-color: #3b82f6 !important;
    background: rgba(255, 255, 255, 0.08) !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.glass-input::placeholder {
    color: rgba(255, 255, 255, 0.4) !important;
}
```

### 3. Glass Button
Interactive buttons with gradient effects.

```css
.glass-button {
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.glass-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.glass-button:hover::before {
    left: 100%;
}

.glass-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* Secondary button */
.glass-button-secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
}

.glass-button-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
}
```

### 4. Glass Modal
Overlay modals with blur backdrop.

```css
.glass-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 10001;
}

.glass-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    box-shadow: 
        0 24px 48px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset,
        0 0 80px rgba(59, 130, 246, 0.15);
    overflow: hidden;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -45%);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}
```

### 5. Glass Select
Dropdown with custom styling.

```css
.glass-select {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(10px);
    color: white !important;
    padding: 12px 40px 12px 16px !important;
    border-radius: 12px !important;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2712%27%20height%3D%277%27%20viewBox%3D%270%200%2012%207%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201L6%206L11%201%27%20stroke%3D%27%23ffffff%27%20stroke-width%3D%272%27%20fill%3D%27none%27/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
}

.glass-select option {
    background: #1e293b !important;
    color: white !important;
}
```

### 6. Statistics Card
For dashboard metrics display.

```css
.stat-card {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 25px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--stat-color) 0%, transparent 70%);
    opacity: 0.1;
    transition: opacity 0.3s ease;
}

.stat-card:hover::before {
    opacity: 0.2;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--icon-color-1), var(--icon-color-2));
    margin-bottom: 15px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

## Animation Guidelines

### 1. Transitions
```css
/* Standard transition */
transition: all 0.3s ease;

/* Hover transitions */
transition: transform 0.2s ease, box-shadow 0.3s ease;

/* Color transitions */
transition: background-color 0.3s ease, border-color 0.3s ease;
```

### 2. Hover Effects
```css
/* Lift effect */
:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* Glow effect */
:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}

/* Scale effect */
:hover {
    transform: scale(1.02);
}
```

### 3. Loading States
```css
.loading {
    position: relative;
    overflow: hidden;
}

.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { left: -100%; }
    100% { left: 100%; }
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile first approach */
/* Small devices (phones) */
@media (min-width: 576px) { }

/* Medium devices (tablets) */
@media (min-width: 768px) { }

/* Large devices (desktops) */
@media (min-width: 992px) { }

/* Extra large devices */
@media (min-width: 1200px) { }
```

### Grid System
```css
.grid {
    display: grid;
    gap: 20px;
}

/* Responsive columns */
.grid-auto {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

/* Fixed columns with responsive behavior */
.grid-1 { grid-template-columns: 1fr; }

@media (min-width: 768px) {
    .grid-2-md { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 992px) {
    .grid-3-lg { grid-template-columns: repeat(3, 1fr); }
}
```

## Accessibility Guidelines

### 1. Color Contrast
- Ensure minimum WCAG AA compliance
- Text on glass: min 4.5:1 ratio
- Large text: min 3:1 ratio

### 2. Focus States
```css
:focus {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
}

:focus:not(:focus-visible) {
    outline: none;
}

:focus-visible {
    outline: 2px solid #3B82F6;
    outline-offset: 2px;
}
```

### 3. ARIA Labels
```html
<!-- Buttons -->
<button aria-label="Close modal" class="close-btn">
    <span class="material-icons">close</span>
</button>

<!-- Form inputs -->
<label for="name" class="glass-label">Name</label>
<input id="name" class="glass-input" aria-required="true">

<!-- Loading states -->
<div class="loading" aria-busy="true" aria-label="Loading content">
```

## Icon System

### Material Icons Usage
```html
<!-- Standard size (24px) -->
<span class="material-icons">home</span>

<!-- Different sizes -->
<span class="material-icons" style="font-size: 18px;">edit</span>
<span class="material-icons" style="font-size: 32px;">person</span>

<!-- With gradient -->
<span class="material-icons" style="
    background: linear-gradient(135deg, #3B82F6, #60A5FA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
">favorite</span>
```

### Common Icons
- Navigation: home, dashboard, menu
- Actions: add, edit, delete, save
- Status: check_circle, error, warning
- Content: person, payment, flight, hotel

## Best Practices

### 1. Performance
- Use `backdrop-filter` sparingly
- Optimize blur radius (10-20px)
- Lazy load heavy components
- Use CSS transforms for animations

### 2. Browser Compatibility
```css
/* Always include fallbacks */
.glass-element {
    /* Fallback for browsers without backdrop-filter */
    background: rgba(30, 41, 59, 0.95);
    
    /* Modern browsers */
    @supports (backdrop-filter: blur(20px)) {
        background: rgba(30, 41, 59, 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
    }
}
```

### 3. Dark Mode Only
System is designed for dark mode only:
- No light mode toggle needed
- Optimized for low-light environments
- Reduces eye strain for long usage

### 4. Component Composition
```html
<!-- Proper nesting -->
<div class="glass-card">
    <div class="card-header">
        <h3>Title</h3>
        <span class="badge">Status</span>
    </div>
    <div class="card-body">
        <!-- Content -->
    </div>
    <div class="card-footer">
        <button class="glass-button">Action</button>
    </div>
</div>
```

## Testing Checklist

### Visual Testing
- [ ] Glass effects visible
- [ ] Proper blur rendering
- [ ] Smooth animations
- [ ] Consistent shadows
- [ ] Proper color contrast

### Interaction Testing
- [ ] Hover states working
- [ ] Focus states visible
- [ ] Touch targets adequate (min 44px)
- [ ] Animations performant
- [ ] No layout shifts

### Cross-browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers
- [ ] Fallbacks working