# 🎯 KidsCare App - Icon System Guide

## Icon Library
**Library:** `lucide-react`  
**Style:** Thin line icons (modern, elegant, accessible)  
**Version:** Latest

## Import Statement
```tsx
import { 
  Menu, 
  Bell, 
  Heart, 
  Users, 
  Utensils, 
  Image, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Home,
  Calendar 
} from 'lucide-react';
```

---

## Design Philosophy

### Why Lucide Icons?
✅ **Thin stroke width (1.5-2px)** - Modern and elegant  
✅ **Rounded corners** - Friendly and approachable  
✅ **Consistent style** - Professional appearance  
✅ **Accessibility** - Clear at all sizes  
✅ **Lightweight** - Fast loading  

### Icon Styling Rules
- **Default stroke width:** `1.5px` (for elegance)
- **Emphasized stroke width:** `2px` (for completed states)
- **Small icons:** `w-5 h-5` (20px × 20px)
- **Medium icons:** `w-6 h-6` (24px × 24px)
- **Large icons:** `w-7 h-7` (28px × 28px)

---

## Icons Used in App

### 1. **Menu** (Hamburger Icon)
- **Location:** Header - Top Left
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59`
- **Stroke Width:** `1.5px`
- **Usage:** Navigation menu toggle
```tsx
<Menu className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
```

### 2. **Bell** (Notifications)
- **Location:** Header - Top Right
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59`
- **Stroke Width:** `1.5px`
- **Badge:** Blush Peach dot indicator
- **Usage:** Notifications center
```tsx
<Bell className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
```

### 3. **Users** (Parents/People)
- **Location:** Stats card, Bottom navigation
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59` (active) / Text Tertiary (inactive)
- **Stroke Width:** `1.5px`
- **Usage:** Parent section, user management
```tsx
<Users className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
```

### 4. **CheckCircle** (Completed/Tasks)
- **Location:** Stats card, Task completion, Bottom navigation
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59`
- **Stroke Width:** `1.5px` (stats) / `2px` (completed tasks - emphasized)
- **Usage:** Activity tracking, task completion
```tsx
{/* In stats */}
<CheckCircle className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />

{/* In completed tasks - emphasized */}
<CheckCircle className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={2} />
```

### 5. **Utensils** (Meals/Food)
- **Location:** Stats card, Bottom navigation
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59` (active) / Text Tertiary (inactive)
- **Stroke Width:** `1.5px`
- **Usage:** Meal tracking
```tsx
<Utensils className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
```

### 6. **Image** (Media/Gallery)
- **Location:** Stats card, Bottom navigation
- **Size:** `w-5 h-5` (20px)
- **Color:** Soft Navy `#2E3A59` (active) / Text Tertiary (inactive)
- **Stroke Width:** `1.5px`
- **Usage:** Photo gallery, media section
```tsx
<Image className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
```

### 7. **Home** (Dashboard)
- **Location:** Bottom navigation - First tab (active)
- **Size:** `w-5 h-5` (20px)
- **Color:** White (on navy background)
- **Stroke Width:** `1.5px`
- **Background:** Soft Navy `#2E3A59` rounded square
- **Usage:** Home/Dashboard navigation
```tsx
<Home className="w-5 h-5 text-white" strokeWidth={1.5} />
```

### 8. **Heart** (Optional - Wellbeing)
- **Size:** `w-5 h-5` (20px)
- **Color:** Context dependent
- **Stroke Width:** `1.5px`
- **Usage:** Wellbeing, favorites, progress
```tsx
<Heart className="w-5 h-5" style={{ color: 'var(--color-warm)' }} strokeWidth={1.5} />
```

### 9. **Calendar** (Schedule)
- **Size:** `w-5 h-5` (20px)
- **Color:** Context dependent
- **Stroke Width:** `1.5px`
- **Usage:** Scheduling, date selection
```tsx
<Calendar className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} strokeWidth={1.5} />
```

---

## Icon Color States

### Active State (Selected Navigation)
- **Background:** Soft Navy `#2E3A59` rounded rectangle (`rounded-2xl`)
- **Icon Color:** White
- **Label Color:** Soft Navy `#2E3A59`
- **Example:** Dashboard tab in bottom navigation

### Inactive State
- **Background:** Transparent
- **Icon Color:** Text Tertiary `#8F9BB3`
- **Label Color:** Text Tertiary `#8F9BB3`
- **Example:** Other navigation tabs

### On Light Background
- **Icon Color:** Soft Navy `#2E3A59`
- **Example:** Header icons, stat cards

### On Colored Background
- **Icon Color:** Soft Navy `#2E3A59` (maintains contrast)
- **Example:** Icons in powder blue, mint mist cards

---

## Complete Code Examples

### Header Icon Button (Glass Effect)
```tsx
<button 
  className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md"
  style={{ 
    backgroundColor: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--shadow-soft)'
  }}
>
  <Menu className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
</button>
```

### Bottom Navigation Active Tab
```tsx
<button className="flex flex-col items-center gap-1.5 min-w-[60px] py-2">
  <div 
    className="w-12 h-12 rounded-2xl flex items-center justify-center"
    style={{ backgroundColor: 'var(--color-navy)' }}
  >
    <HomeIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
  </div>
  <span className="text-xs font-medium" style={{ color: 'var(--color-navy)' }}>
    Dashboard
  </span>
</button>
```

### Bottom Navigation Inactive Tab
```tsx
<button className="flex flex-col items-center gap-1.5 min-w-[60px] py-2">
  <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
    <Users className="w-5 h-5" style={{ color: 'var(--color-text-tertiary)' }} strokeWidth={1.5} />
  </div>
  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
    Parents
  </span>
</button>
```

### Stat Card Icon
```tsx
<div className="flex-1 rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--color-powder-blue)' }}>
  <Users className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--color-navy)' }} strokeWidth={1.5} />
  <p className="text-xl font-bold mb-0.5" style={{ color: 'var(--color-navy)' }}>2</p>
  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Parents</p>
</div>
```

### Completed Task Icon (Emphasized)
```tsx
<div 
  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
  style={{ backgroundColor: 'var(--color-mint-mist)' }}
>
  <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={2} />
</div>
```

---

## Icon Container Patterns

### Small Circle Badge
```tsx
<div className="w-8 h-8 rounded-full flex items-center justify-center" 
     style={{ backgroundColor: 'var(--color-mint-mist)' }}>
  <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-navy)' }} strokeWidth={2} />
</div>
```

### Medium Rounded Square (Navigation)
```tsx
<div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
     style={{ backgroundColor: 'var(--color-navy)' }}>
  <HomeIcon className="w-5 h-5 text-white" strokeWidth={1.5} />
</div>
```

### Large Emoji Container (Tasks)
```tsx
<div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" 
     style={{ backgroundColor: 'var(--color-powder-blue)' }}>
  📚
</div>
```

---

## Accessibility Guidelines

### Icon + Label Pattern
Always pair icons with text labels for clarity:
```tsx
<button className="flex flex-col items-center gap-1.5">
  <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
    <Users className="w-5 h-5" strokeWidth={1.5} />
  </div>
  <span className="text-xs">Parents</span>
</button>
```

### Minimum Touch Targets
- Icon buttons: **48px × 48px minimum**
- Icon containers: **32px × 32px minimum** (inside larger touch areas)

### Color Contrast
- All icons meet **WCAG AA standards**
- Navy on light backgrounds: ✅ 7.5:1 ratio
- White on navy: ✅ 12:1 ratio

---

## Quick Reference Table

| Icon | Name | Size | Stroke | Primary Use |
|------|------|------|--------|-------------|
| ☰ | Menu | 20px | 1.5px | Navigation toggle |
| 🔔 | Bell | 20px | 1.5px | Notifications |
| 👥 | Users | 20px | 1.5px | Parents section |
| ✓ | CheckCircle | 20px | 1.5-2px | Task completion |
| 🍴 | Utensils | 20px | 1.5px | Meals |
| 🖼️ | Image | 20px | 1.5px | Media gallery |
| 🏠 | Home | 20px | 1.5px | Dashboard |
| 📅 | Calendar | 20px | 1.5px | Schedule |
| ❤️ | Heart | 20px | 1.5px | Wellbeing |

---

## Implementation Checklist

When adding new icons:
- [ ] Import from `lucide-react`
- [ ] Set size to `w-5 h-5` (20px standard)
- [ ] Apply `strokeWidth={1.5}` for consistency
- [ ] Use appropriate color (navy/white/tertiary)
- [ ] Wrap in proper container (circle/square)
- [ ] Ensure 48px minimum touch target
- [ ] Add descriptive label
- [ ] Test color contrast
- [ ] Apply smooth transition (300ms)

---

## Alternative: If You Can't Use Lucide React

You can use these alternatives with the same thin-line, rounded style:

1. **Heroicons** (v2 - outline)
2. **Phosphor Icons** (thin variant)
3. **Feather Icons**
4. **Tabler Icons**

All should use:
- Stroke width: **1.5px**
- Rounded line caps
- Consistent sizing
- Clean, minimal design
