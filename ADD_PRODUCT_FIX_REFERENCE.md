# SPECIFIC FIX REFERENCE: AdminProductsPage.tsx Discount Section

## The Problem Areas

### 1️⃣ DISCOUNT PERCENTAGE SECTION (Lines 262-266)

**Current Code:**
```jsx
<div className="form-group">
  <label htmlFor="p-discount" style={{ color: '#334155' }}>Discount (%) - Optional</label>
  <input id="p-discount" type="number" step="0.01" min="0" max="100" value={form.discountPercentage} onChange={set('discountPercentage')} placeholder="0.00" />
  <small style={{ color: '#94a3b8', marginTop: 4, display: 'block' }}>e.g., 10 for 10% off</small>
</div>
```

**Problems:**
- `color: '#334155'` - Light gray label (not visible on dark background)
- `color: '#94a3b8'` - Helper text too light

**Fixed Code:**
```jsx
<div className="form-group">
  <label htmlFor="p-discount" style={{ color: 'var(--light-text)' }}>Discount (%) - Optional</label>
  <input id="p-discount" type="number" step="0.01" min="0" max="100" value={form.discountPercentage} onChange={set('discountPercentage')} placeholder="0.00" />
  <small style={{ color: 'var(--gray-500)', marginTop: 4, display: 'block' }}>e.g., 10 for 10% off</small>
</div>
```

**Changes:**
- Line 263: `#334155` → `var(--light-text)` ✓
- Line 265: `#94a3b8` → `var(--gray-500)` ✓

---

### 2️⃣ DISCOUNTED PRICE SECTION (Lines 268-274)

**Current Code:**
```jsx
<div className="form-group">
  <label htmlFor="p-discount-price" style={{ color: '#334155' }}>Discounted Price (Auto-calculated)</label>
  <input id="p-discount-price" type="number" step="0.01" min="0" value={
    form.price && form.discountPercentage
      ? (parseFloat(form.price) - (parseFloat(form.price) * parseFloat(form.discountPercentage) / 100)).toFixed(2)
      : form.price
  } disabled style={{ background: '#f1f5f9', cursor: 'not-allowed' }} placeholder="0.00" />
</div>
```

**Problems:**
- Line 268: `color: '#334155'` - Light gray label
- Line 274: `background: '#f1f5f9'` - Light blue-gray background for disabled state

**Fixed Code:**
```jsx
<div className="form-group">
  <label htmlFor="p-discount-price" style={{ color: 'var(--light-text)' }}>Discounted Price (Auto-calculated)</label>
  <input id="p-discount-price" type="number" step="0.01" min="0" value={
    form.price && form.discountPercentage
      ? (parseFloat(form.price) - (parseFloat(form.price) * parseFloat(form.discountPercentage) / 100)).toFixed(2)
      : form.price
  } disabled style={{ background: 'var(--dark-secondary)', cursor: 'not-allowed' }} placeholder="0.00" />
</div>
```

**Changes:**
- Line 268: `#334155` → `var(--light-text)` ✓
- Line 274: `#f1f5f9` → `var(--dark-secondary)` ✓

---

## All Hardcoded Colors in AdminProductsPage.tsx

### Form Panel Container (Lines 226-228)
```jsx
background: '#fff',  // ❌ White - should be var(--dark-tertiary)
border: '1px solid #e2e8f0',  // ❌ Light gray - should be rgba(212,175,55,0.1)
```

### All Form Labels (Lines 239, 245, 263, 268, 275, 281, 295, 309)
```jsx
style={{ color: '#334155' }}  // ❌ All should be var(--light-text)
```

### Helper Text (Lines 241, 265)
```jsx
style={{ color: '#94a3b8' }}  // ❌ Should be var(--gray-500)
```

### Image Preview Borders (Lines 314-315)
```jsx
border: '1px solid #e2e8f0'  // ❌ Light gray - should be var(--dark-tertiary)
```

### Image Upload Button (Lines 323-330)
```jsx
background: '#f8fafc',  // ❌ Light gray - should be var(--dark-secondary)
color: '#334155',  // ❌ Light text - should be var(--light-text)
border: '2px dashed #cbd5e1',  // ❌ Light - should be var(--gold) with opacity
```

### Remove Image Button (Lines 335-338)
```jsx
background: '#dc2626'  // ✓ This is OK - error color
```

### Form Header (Line 228 area)
```jsx
color: '#94a3b8'  // ❌ Close button - should be var(--gray-400)
```

---

## CSS Variable Reference

Use these when updating AdminProductsPage.tsx:

| What | CSS Variable | Hex Value | Purpose |
|------|---|---|---|
| Primary text | `var(--light-text)` | #E8E9EC | Labels, body text on dark |
| Secondary text | `var(--gray-500)` | #6B7280 | Helper text, hints |
| Muted text | `var(--gray-400)` | #9CA3AF | Secondary info |
| Panel background | `var(--dark-tertiary)` | #252B3B | Cards, forms, containers |
| Secondary background | `var(--dark-secondary)` | #1A1E2E | Alternative backgrounds |
| Borders | `rgba(212,175,55,0.1)` | - | Gold with 10% opacity |
| Primary button | `var(--gold)` | #D4AF37 | Accent color |
| Input disabled | `var(--dark-secondary)` | #1A1E2E | Disabled/inactive state |

---

## Visual Comparison: Before & After

### Current Look (WRONG)
```
┌─────────────────────────────────┐
│ ✏️ Edit Product                ✕ │  ← White background (wrong!)
├─────────────────────────────────┤
│                                 │
│ Product Name * │ Price (₹) *    │
│ [light text input fields]       │
│                                 │
│ Discount (%) - Optional │ ┌──────────────────────┐
│ [dark input]            │ │ Discounted Price     │
│ [light gray label]      │ │ (Auto-calculated)    │  ← Labels hard to read
│                         │ │ [light blue bg]      │  ← Disabled input too bright
│                         │ │ (light gray text)    │
│                         │ └──────────────────────┘
│                                 │
│ [more fields...]                │
│                                 │
└─────────────────────────────────┘
```

### Fixed Look (CORRECT)
```
┌─────────────────────────────────┐
│ ✏️ Edit Product                ✕ │  ← Dark background (correct!)
├─────────────────────────────────┤
│                                 │
│ Product Name * │ Price (₹) *    │
│ [light text input fields]       │
│                                 │
│ Discount (%) - Optional │ ┌──────────────────────┐
│ [dark input]            │ │ Discounted Price     │
│ [light text label]      │ │ (Auto-calculated)    │  ← Labels visible
│                         │ │ [dark bg]            │  ← Disabled input dark
│                         │ │ (light text)         │  ← Proper contrast
│                         │ └──────────────────────┘
│                                 │
│ [more fields...]                │
│                                 │
└─────────────────────────────────┘
```

---

## Complete Color Replacement List

### For AdminProductsPage.tsx

| Line(s) | Current | Replace With | Type |
|---------|---------|---|---|
| 228 | `'#fff'` | `'var(--dark-tertiary)'` | background |
| 228 | `'#e2e8f0'` | `'rgba(212,175,55,0.1)'` | border |
| 239, 245, 263, 268, 275, 281, 295, 309 | `'#334155'` | `'var(--light-text)'` | color |
| 241, 265 | `'#94a3b8'` | `'var(--gray-500)'` | color |
| 314-315 | `'#e2e8f0'` | `'var(--dark-tertiary)'` | border |
| 323 | `'#f8fafc'` | `'var(--dark-secondary)'` | background |
| 324 | `'#334155'` | `'var(--light-text)'` | color |
| 325 | `'#cbd5e1'` | `'rgba(212,175,55,0.5)'` | border-color |
| 274 | `'#f1f5f9'` | `'var(--dark-secondary)'` | background |

---

## Testing Checklist After Fix

- [ ] Form panel has dark background, not white
- [ ] All labels are visible (light text color)
- [ ] Helper text is readable
- [ ] "Discount (%)" label clearly visible
- [ ] "Discounted Price (Auto-calculated)" label clearly visible
- [ ] Disabled price input has dark background
- [ ] Image upload button has dark theme colors
- [ ] Overall form looks cohesive with admin sidebar
- [ ] Focus states still use gold color
- [ ] No light gray (#334155) visible anywhere
- [ ] No white (#fff) backgrounds in form

---

## Quick Find & Replace (For Text Editors)

### Find-Replace Pattern 1: Label Colors
**Find:** `style={{ color: '#334155' }}`  
**Replace:** `style={{ color: 'var(--light-text)' }}`  
**Matches:** ~20 instances across all admin pages

### Find-Replace Pattern 2: Helper Text Colors
**Find:** `style={{ color: '#94a3b8'`  
**Replace:** `style={{ color: 'var(--gray-500)'`  
**Matches:** ~15 instances

### Find-Replace Pattern 3: Form Panel Backgrounds
**Find:** `background: '#fff'`  
**Replace:** `background: 'var(--dark-tertiary)'`  
**Matches:** ~10 instances (check each one)

### Find-Replace Pattern 4: Light Borders
**Find:** `border: '1px solid #e2e8f0'`  
**Replace:** `border: '1px solid var(--dark-tertiary)'`  
**Matches:** ~15 instances

### Find-Replace Pattern 5: Disabled Input Backgrounds
**Find:** `background: '#f1f5f9'`  
**Replace:** `background: 'var(--dark-secondary)'`  
**Matches:** ~5 instances

---

## Priority Order for Fixes

### Priority 1 (Visual Impact - Do First)
1. Form panel white background → dark tertiary
2. All label colors (#334155) → light text
3. Discount section disabled input background → dark secondary

### Priority 2 (Polish)
4. Helper text colors
5. Border colors
6. Image upload styling

### Priority 3 (Other Pages)
7. AdminUsersPage.tsx - similar fixes
8. AdminDashboard.tsx - button colors
9. AdminCategoriesPage.tsx - table backgrounds
10. AdminRatingsPage.tsx - filter panel

---

## Code Example: Full Form Section Fixed

### Before (Current)
```jsx
<div style={{
  background: '#fff', 
  border: '1px solid #e2e8f0', 
  borderRadius: 12,
  padding: '24px 28px', 
  marginBottom: 28
}}>
  <h2 style={{ color: 'var(--gold)' }}>Add New Product</h2>
  
  <div className="form-group">
    <label style={{ color: '#334155' }}>Product Name *</label>
    <input type="text" />
  </div>
  
  <div className="form-group">
    <label style={{ color: '#334155' }}>Discount (%) - Optional</label>
    <input type="number" />
  </div>
  
  <div className="form-group">
    <label style={{ color: '#334155' }}>Discounted Price (Auto)</label>
    <input disabled style={{ background: '#f1f5f9' }} />
  </div>
</div>
```

### After (Fixed)
```jsx
<div style={{
  background: 'var(--dark-tertiary)', 
  border: '1px solid rgba(212,175,55,0.1)', 
  borderRadius: 12,
  padding: '24px 28px', 
  marginBottom: 28
}}>
  <h2 style={{ color: 'var(--gold)' }}>Add New Product</h2>
  
  <div className="form-group">
    <label style={{ color: 'var(--light-text)' }}>Product Name *</label>
    <input type="text" />
  </div>
  
  <div className="form-group">
    <label style={{ color: 'var(--light-text)' }}>Discount (%) - Optional</label>
    <input type="number" />
  </div>
  
  <div className="form-group">
    <label style={{ color: 'var(--light-text)' }}>Discounted Price (Auto)</label>
    <input disabled style={{ background: 'var(--dark-secondary)' }} />
  </div>
</div>
```

**Changes made:**
- ✅ Form panel: white → dark tertiary
- ✅ Border: light gray → gold with opacity
- ✅ Labels: light gray → light text (3 instances)
- ✅ Disabled input: light blue → dark secondary
