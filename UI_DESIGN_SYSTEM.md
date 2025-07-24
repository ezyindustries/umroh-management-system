# 🎨 VT Manager - UI Design System & Frontend Guidelines

## 📋 Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Patterns](#component-patterns)
5. [Layout Structure](#layout-structure)
6. [Interactive Elements](#interactive-elements)
7. [Animation & Transitions](#animation-transitions)
8. [Coding Standards](#coding-standards)
9. [User Experience Principles](#ux-principles)

---

## 🎯 Design Philosophy {#design-philosophy}

### Core Principles
- **Dark Theme First**: Aplikasi menggunakan dark theme sebagai default untuk mengurangi eye strain
- **Glassmorphism**: Efek kaca dengan backdrop blur untuk depth dan modernitas
- **Gradient Accents**: Gradien warna untuk highlight dan visual interest
- **Smooth Interactions**: Animasi halus untuk setiap interaksi user
- **Minimalist Approach**: Clean design dengan fokus pada konten

### Visual Hierarchy
1. **Primary Actions**: Gradient backgrounds dengan shadow effects
2. **Secondary Elements**: Glass effects dengan border subtle
3. **Tertiary Info**: Reduced opacity dan smaller fonts

---

## 🎨 Color System {#color-system}

### Background Colors
```css
/* Main Background Gradient */
background: linear-gradient(135deg, 
    #0f172a 0%,    /* Deep slate */
    #1e293b 25%,   /* Slate 800 */
    #334155 50%,   /* Slate 700 */
    #475569 75%,   /* Slate 600 */
    #64748b 100%   /* Slate 500 */
);

/* Glass Effect Backgrounds */
background: linear-gradient(145deg, 
    rgba(30, 41, 59, 0.8),    /* Semi-transparent dark */
    rgba(15, 23, 42, 0.7)     /* More transparent */
);
backdrop-filter: blur(20px);
```

### Primary Colors
```css
/* Blue - Primary Actions */
#3b82f6 /* Blue 500 */
#60a5fa /* Blue 400 */
#2563eb /* Blue 600 */

/* Green - Success States */
#10b981 /* Emerald 500 */
#34d399 /* Emerald 400 */
#059669 /* Emerald 600 */

/* Purple - Special Elements */
#8b5cf6 /* Violet 500 */
#a78bfa /* Violet 400 */
#7c3aed /* Violet 600 */
```

### Gradient Combinations
```css
/* Text Gradients */
background: linear-gradient(135deg, #3b82f6, #10b981, #8b5cf6);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Button/Card Gradients */
background: linear-gradient(135deg, #60a5fa, #34d399);
background: linear-gradient(145deg, #8b5cf6, #3b82f6);
```

### Supporting Colors
```css
/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Text Colors */
--text-primary: #f8fafc;    /* Slate 50 */
--text-secondary: #e2e8f0;  /* Slate 200 */
--text-muted: rgba(255, 255, 255, 0.6);
```

---

## 📝 Typography {#typography}

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Sizes
```css
--text-xs: 11px;
--text-sm: 12px;
--text-base: 14px;
--text-lg: 16px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 28px;
--text-4xl: 32px;
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Text Styles
```css
/* Headings */
h1, h2, h3 {
    background: linear-gradient(135deg, #60a5fa, #34d399, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 600;
    text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
}

/* Body Text */
body {
    color: #f8fafc;
    line-height: 1.6;
}

/* Muted Text */
.text-muted {
    color: rgba(255, 255, 255, 0.6);
}
```

---

## 🧩 Component Patterns {#component-patterns}

### Glass Cards
```css
.glass-card {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7));
    backdrop-filter: blur(20px);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(71, 85, 105, 0.4);
    position: relative;
    overflow: hidden;
}

/* Top gradient line */
.glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(59, 130, 246, 0.6), 
        rgba(16, 185, 129, 0.8), 
        rgba(139, 92, 246, 0.6), 
        transparent
    );
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
    background: linear-gradient(135deg, #3b82f6, #10b981);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    border: none;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

/* Glass Button */
.btn-glass {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #f8fafc;
}

.btn-glass:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(59, 130, 246, 0.5);
}
```

### Form Elements
```css
/* Input Fields */
.form-input {
    background: rgba(15, 23, 42, 0.5);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    color: #f8fafc;
    transition: all 0.3s ease;
}

.form-input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: rgba(15, 23, 42, 0.7);
}

/* Floating Labels */
.form-group {
    position: relative;
}

.form-label {
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.5);
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
    top: -8px;
    left: 12px;
    font-size: 12px;
    background: #1e293b;
    padding: 0 8px;
    color: #60a5fa;
}
```

### Navigation Items
```css
.nav-item {
    display: flex;
    align-items: center;
    padding: 15px 20px;
    margin: 5px 0;
    border-radius: 12px;
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    background: linear-gradient(135deg, rgba(71, 85, 105, 0.4), rgba(30, 41, 59, 0.3));
    border: 1px solid rgba(71, 85, 105, 0.3);
    position: relative;
    overflow: hidden;
}

/* Hover sweep effect */
.nav-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
    transition: left 0.5s ease;
}

.nav-item:hover::before {
    left: 100%;
}

.nav-item:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.1));
    transform: translateX(8px) scale(1.02);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow: 
        0 10px 30px rgba(59, 130, 246, 0.2),
        inset 0 1px 0 rgba(59, 130, 246, 0.3);
}

.nav-item.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(16, 185, 129, 0.2));
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.5);
}
```

### Stat Cards
```css
.stat-card {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.8));
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 16px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

/* Gradient orb background */
.stat-card::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 150%;
    height: 150%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(-20px, -20px) rotate(180deg); }
}
```

---

## 📐 Layout Structure {#layout-structure}

### Container Structure
```css
.app-container {
    display: flex;
    min-height: 100vh;
}

/* Sidebar */
.sidebar {
    width: 280px;
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9));
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(71, 85, 105, 0.3);
    padding: 20px;
    overflow-y: auto;
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
}
```

### Grid Systems
```css
/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

/* Cards Grid */
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) { /* Large */ }
@media (max-width: 992px) { /* Medium */ }
@media (max-width: 768px) { /* Small */ }
@media (max-width: 576px) { /* Extra Small */ }
```

### Spacing System
```css
/* Base: 8px grid */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-5: 40px;
--space-6: 48px;
--space-8: 64px;
```

---

## 🎭 Interactive Elements {#interactive-elements}

### Hover States
```css
/* Scale & Shadow */
.interactive-element:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
}

/* Glow Effect */
.glow-hover:hover {
    box-shadow: 
        0 0 20px rgba(59, 130, 246, 0.5),
        0 0 40px rgba(59, 130, 246, 0.3),
        0 0 60px rgba(59, 130, 246, 0.1);
}
```

### Focus States
```css
.focusable:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
```

### Loading States
```css
/* Skeleton Loading */
.skeleton {
    background: linear-gradient(90deg,
        rgba(71, 85, 105, 0.3) 25%,
        rgba(71, 85, 105, 0.5) 50%,
        rgba(71, 85, 105, 0.3) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Pulse Animation */
.pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
```

---

## 🎬 Animation & Transitions {#animation-transitions}

### Standard Transitions
```css
/* Base Transition */
transition: all 0.3s ease;

/* Smooth Transition */
transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);

/* Spring Effect */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Page Transitions
```css
/* Fade In */
@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.page-enter {
    animation: fadeIn 0.5s ease;
}

/* Slide In */
@keyframes slideIn {
    from { 
        transform: translateX(-100%); 
        opacity: 0; 
    }
    to { 
        transform: translateX(0); 
        opacity: 1; 
    }
}
```

### Micro-animations
```css
/* Button Click */
.btn:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
}

/* Card Hover */
.card {
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}
```

---

## 💻 Coding Standards {#coding-standards}

### HTML Structure
```html
<!-- Component Structure -->
<div class="glass-card">
    <div class="card-header">
        <h2 class="card-title gradient-text">Title</h2>
        <div class="card-actions">
            <button class="btn btn-glass">Action</button>
        </div>
    </div>
    <div class="card-body">
        <!-- Content -->
    </div>
</div>
```

### CSS Organization
```css
/* 1. Layout */
.component {
    display: flex;
    position: relative;
}

/* 2. Spacing */
.component {
    padding: 20px;
    margin-bottom: 20px;
}

/* 3. Typography */
.component {
    font-size: 14px;
    font-weight: 500;
}

/* 4. Visual */
.component {
    background: linear-gradient(...);
    border: 1px solid ...;
    border-radius: 12px;
}

/* 5. Effects */
.component {
    box-shadow: ...;
    backdrop-filter: blur(20px);
}

/* 6. Animation */
.component {
    transition: all 0.3s ease;
}
```

### Naming Conventions
```css
/* BEM Style */
.block__element--modifier

/* Components */
.card
.card__header
.card__body
.card--featured

/* Utilities */
.text-primary
.bg-gradient
.shadow-lg
```

---

## 🎯 User Experience Principles {#ux-principles}

### Visual Feedback
1. **Immediate Response**: Semua interaksi harus ada feedback visual
2. **Loading States**: Gunakan skeleton loader atau spinner
3. **Success/Error States**: Warna dan icon yang jelas
4. **Hover Effects**: Subtle namun noticeable

### Accessibility
1. **Color Contrast**: Minimum 4.5:1 untuk text
2. **Focus Indicators**: Visible focus states untuk keyboard navigation
3. **Touch Targets**: Minimum 44x44px untuk mobile
4. **Alt Text**: Untuk semua images dan icons

### Performance
1. **Lazy Loading**: Load content saat dibutuhkan
2. **Debounce**: Untuk search dan filter inputs
3. **Optimistic Updates**: Update UI sebelum server response
4. **Smooth Animations**: 60fps target, gunakan transform dan opacity

### Consistency
1. **Spacing**: Gunakan 8px grid system
2. **Colors**: Stick to defined color palette
3. **Typography**: Consistent font sizes dan weights
4. **Interactions**: Same behavior untuk similar elements

---

## 📱 Responsive Design

### Mobile First
```css
/* Base (Mobile) */
.container {
    padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        padding: 24px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        padding: 32px;
    }
}
```

### Touch Optimizations
```css
/* Larger touch targets */
.btn-mobile {
    min-height: 44px;
    padding: 12px 20px;
}

/* Disable hover on touch */
@media (hover: none) {
    .hover-effect:hover {
        transform: none;
    }
}
```

---

## 🔧 Implementation Checklist

Saat membuat UI baru, pastikan:

- [ ] Menggunakan dark theme dengan glass effects
- [ ] Gradient accents untuk important elements
- [ ] Smooth transitions (0.3s ease minimum)
- [ ] Proper spacing dengan 8px grid
- [ ] Responsive design untuk semua breakpoints
- [ ] Loading states untuk async operations
- [ ] Error handling dengan visual feedback
- [ ] Keyboard navigation support
- [ ] Touch-friendly untuk mobile
- [ ] Performance optimized animations

---

*Dokumen ini adalah living document yang akan diupdate seiring perkembangan aplikasi*