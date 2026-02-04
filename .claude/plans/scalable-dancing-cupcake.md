# Teacher Panel Design Unification Plan

## Reference: Dashboard Design

The dashboard uses:
- **Header**: `bg-blue-500 rounded-2xl p-6 md:p-8` blue banner with white text
- **Title**: `text-3xl md:text-4xl font-bold text-white`
- **Subtitle**: `text-white/90 text-sm font-medium`
- **Cards**: Card component with `p-4 hover:shadow-lg transition`
- **Icons**: `bg-blue-50 rounded-xl p-3` container, `text-blue-600 w-6 h-6` icon
- **Buttons**: `bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700`
- **Inputs**: `border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500`
- **Animation**: `animate-in fade-in duration-500`

## Inconsistencies Found

| Page | Issues |
|------|--------|
| **TherapyManagement** | Title `text-gray-900` (should be white), subtitle `text-gray-600`, buttons/inputs use `primary-600`/`primary-500` instead of `blue-600`/`blue-500`, borders `gray-300` instead of `gray-200` |
| **Activities** | Subtitle `text-gray-500` instead of `text-white/90` |
| **Profile** | Subtitle `text-gray-500 text-sm` instead of `text-white/90 font-medium`, no fade-in |
| **Settings** | Subtitle `text-white/80` (should be `/90`), all buttons/inputs use `primary-600`/`primary-500` instead of `blue-600`/`blue-500`, no fade-in |
| **Chat** | Title `text-2xl font-bold` (inconsistent size), no fade-in |
| **MonitoringJournal** | Input borders `gray-300` instead of `gray-200`, button `rounded-lg` instead of `rounded-xl` |
| **Meals** | Header inside Card (different pattern than other pages) |

## Changes Per File

### 1. `teacher/src/pages/TherapyManagement.jsx`
- Title: `text-3xl font-black text-gray-900` -> `text-4xl font-black text-white tracking-tight drop-shadow-sm`
- Subtitle: `text-gray-600 mt-2` -> `text-white/90 font-medium mt-1 drop-shadow-sm`
- Replace all `bg-primary-600` -> `bg-blue-600`
- Replace all `bg-primary-700` -> `bg-blue-700`
- Replace all `hover:bg-primary-700` -> `hover:bg-blue-700`
- Replace all `focus:ring-primary-500` -> `focus:ring-blue-500`
- Replace all `text-primary-600` -> `text-blue-600`
- Replace all `border-gray-300` -> `border-gray-200`
- Add header flex layout matching other pages
- Add `pb-20` to container

### 2. `teacher/src/pages/Activities.jsx`
- Subtitle: `text-gray-500 text-lg` -> `text-white/90 font-medium drop-shadow-sm`

### 3. `teacher/src/pages/Profile.jsx`
- Subtitle: `text-gray-500 text-sm` -> `text-white/90 font-medium mt-1 drop-shadow-sm`
- Add `animate-in fade-in duration-700` to container

### 4. `teacher/src/pages/Settings.jsx`
- Subtitle: `text-white/80` -> `text-white/90`
- Replace all `bg-primary-600` -> `bg-blue-600`
- Replace all `bg-primary-700` -> `bg-blue-700`
- Replace all `hover:bg-primary-700` -> `hover:bg-blue-700`
- Replace all `focus:ring-primary-500` -> `focus:ring-blue-500`
- Replace all `text-primary-600` -> `text-blue-600`
- Add `animate-in fade-in duration-700` to container

### 5. `teacher/src/pages/Chat.jsx`
- Title: `text-2xl font-bold` -> `text-4xl font-black tracking-tight drop-shadow-sm`
- Remove icon prefix from header (match other pages' standalone title pattern)
- Subtitle: keep `text-white/90 text-sm` but add `font-medium drop-shadow-sm`
- Add `animate-in fade-in duration-500` to container

### 6. `teacher/src/pages/MonitoringJournal.jsx`
- Replace `border-gray-300` -> `border-gray-200` in form inputs
- Replace `rounded-lg` -> `rounded-xl` on action buttons
- Add `py-3` padding to form inputs (currently `py-2`)

### 7. `teacher/src/pages/Meals.jsx`
- Move header out of Card to match other pages' standalone pattern
- Title and subtitle already use white text (keep)

## Files Modified
1. `teacher/src/pages/TherapyManagement.jsx`
2. `teacher/src/pages/Activities.jsx`
3. `teacher/src/pages/Profile.jsx`
4. `teacher/src/pages/Settings.jsx`
5. `teacher/src/pages/Chat.jsx`
6. `teacher/src/pages/MonitoringJournal.jsx`
7. `teacher/src/pages/Meals.jsx`

## Verification
1. Run `cd teacher && npm run dev` and visit each page
2. Verify all headers have white text with drop shadows
3. Verify all buttons are `blue-600` (no `primary-600`)
4. Verify all inputs have `border-gray-200` and `focus:ring-blue-500`
5. Verify fade-in animation on page load
6. Check mobile responsiveness
