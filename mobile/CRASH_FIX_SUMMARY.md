# Crash Fix Summary

## Problem
App was crashing on startup with error:
```
ReferenceError: Property 'theme' doesn't exist
```

## Root Cause
Multiple files were using `theme` variable that was undefined or not properly initialized during module load time. The issue occurred in:

1. **ChatScreen.js** - Using `theme` in `StyleSheet.create()` at module level, but `theme` was never defined
2. **Other teacher screens** - Same pattern of using undefined `theme` variable
3. **theme.js** - May have initialization issues when importing tokens

## Fixes Applied

### 1. ChatScreen.js ✅
- Converted `StyleSheet.create()` to `getStyles(tokens)` function
- Fixed all property names:
  - `theme.Colors` → `tokens.colors`
  - `theme.Spacing` → `tokens.space`
  - `theme.Typography` → `tokens.typography`
  - `theme.BorderRadius` → `tokens.radius`
  - `theme.Colors.shadow` → `tokens.shadow`
- Fixed shadow references: `shadow.md` → `shadow.soft`, `shadow.lg` → `shadow.card`
- Updated JSX to use `tokens` instead of `theme`

### 2. theme.js
- Added try-catch around token import to prevent crashes
- Improved defensive checks

## Remaining Files to Fix

The following files still use the `theme.Colors` pattern and need similar fixes:

1. `src/screens/teacher/ActivitiesScreen.js`
2. `src/screens/teacher/MediaScreen.js`
3. `src/screens/teacher/MealsScreen.js`
4. `src/screens/teacher/WorkHistoryScreen.js`
5. `src/screens/teacher/TasksScreen.js`
6. `src/screens/teacher/ResponsibilitiesScreen.js`
7. `src/screens/teacher/ProfileScreen.js`
8. `src/components/common/LoadingSpinner.js`
9. `src/components/common/ScreenHeader.js`
10. `src/screens/teacher/TeacherDashboardScreen.js`
11. `src/screens/teacher/MonitoringJournalScreen.js`
12. `src/screens/teacher/ParentsListScreen.js`
13. `src/screens/teacher/ParentDetailScreen.js`
14. `src/screens/teacher/TherapyScreen.js`
15. `src/screens/teacher/EmotionalMonitoringScreen.js`
16. `src/screens/teacher/NotificationsScreen.js`

## Pattern to Apply

For each file:
1. Replace `import theme from '../../styles/theme'` with `import { useThemeTokens } from '../../hooks/useThemeTokens'`
2. In component: `const tokens = useThemeTokens()`
3. Convert `StyleSheet.create({...})` to `function getStyles(tokens) { return StyleSheet.create({...}) }`
4. Update all references:
   - `theme.Colors.*` → `tokens.colors.*`
   - `theme.Spacing.*` → `tokens.space.*`
   - `theme.Typography.*` → `tokens.typography.*`
   - `theme.BorderRadius.*` → `tokens.radius.*`
   - `theme.Colors.shadow.*` → `tokens.shadow.*`
5. In component: `const styles = getStyles(tokens)`

## Testing
After fixes, test:
1. App starts without crashing
2. All screens load properly
3. Theme colors apply correctly
4. No console errors about undefined properties
