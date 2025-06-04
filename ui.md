
# UIMD - BigShow OTT Platform UI Design Specification

## Theme Foundation

### Color Palette
- **Primary Colors**
  - `#000000` - Deep Black (Background)
  - `#4A0080` - Royal Purple (Primary)
  - `#7B1FA2` - Vibrant Purple (Secondary)
  - `#D4AF37` - Golden (Accent)
  - `#8A2BE2` - Bright Purple (Highlights)

- **Gradient Combinations**
  - Purple Gradient: `linear-gradient(135deg, #4A0080 0%, #8A2BE2 100%)`
  - Gold Accent: `linear-gradient(135deg, #D4AF37 0%, #FFC107 100%)`
  - Dark Fade: `linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)`
  - Spotlight: `radial-gradient(circle, rgba(138,43,226,0.4) 0%, rgba(0,0,0,0.8) 70%)`

- **Text Colors**
  - `#FFFFFF` - Primary Text (White)
  - `#F5F5F5` - Secondary Text (Off-White)
  - `#D4AF37` - Accent Text (Gold)
  - `#9E9E9E` - Muted Text (Gray)

### Typography
- **Font Family**
  - Primary: "Poppins"
  - Secondary: "Inter"
  - Accent: "Montserrat"

- **Font Weights**
  - Light: 300
  - Regular: 400
  - Medium: 500
  - Semi-Bold: 600
  - Bold: 700

- **Font Sizes**
  - Header Large: 28px
  - Header Medium: 24px
  - Header Small: 20px
  - Body Large: 16px
  - Body Medium: 14px
  - Body Small: 12px
  - Caption: 10px

### Shadows and Elevation
- **Card Shadow**: `0px 8px 20px rgba(0, 0, 0, 0.25)`
- **Button Shadow**: `0px 4px 12px rgba(74, 0, 128, 0.3)`
- **Modal Shadow**: `0px 16px 30px rgba(0, 0, 0, 0.5)`
- **Bottom Navigation Shadow**: `0px -4px 10px rgba(0, 0, 0, 0.2)`

### Spacing System
- **Base Unit**: 4px
- **Content Padding**: 16px
- **Section Spacing**: 24px
- **Screen Padding**: Top: 56px, Horizontal: 16px, Bottom: 80px

### Animations
- **Transitions**
  - Default Easing: Cubic-Bezier(0.33, 1, 0.68, 1)
  - Default Duration: 300ms
  - Long Duration: 500ms
  - Quick Duration: 150ms

- **Animation Types**
  - Fade In/Out: opacity 0 → 1 or 1 → 0
  - Slide Up: translateY(20px) → translateY(0)
  - Scale: scale(0.95) → scale(1)
  - Pulse: scale(1) → scale(1.05) → scale(1)
  - Shimmer: Linear gradient animation for loading states

## UI Components

### Buttons
- **Primary Button**
  - Background: Purple Gradient
  - Text: White, Semi-Bold, 16px
  - Height: 54px
  - Border Radius: 12px
  - Shadow: Button Shadow
  - Hover/Press Effect: Scale up 3%, brightness increase 5%
  - Animation: Ripple effect on press
  
- **Secondary Button**
  - Background: Transparent
  - Border: 2px solid Royal Purple
  - Text: White, Medium, 16px
  - Height: 54px
  - Border Radius: 12px
  - Hover/Press Effect: Background opacity 10%
  
- **Icon Button**
  - Background: Transparent
  - Size: 48px × 48px
  - Icon Color: White or Gold
  - Hover/Press Effect: Scale up 5%, brightness increase 10%
  - Animation: Subtle rotation (5deg) on press

- **Play Button**
  - Background: Gold Accent Gradient
  - Icon: White Play Icon
  - Size: 60px × 60px (large), 48px × 48px (medium), 36px × 36px (small)
  - Border Radius: 50%
  - Shadow: `0px 4px 15px rgba(212, 175, 55, 0.4)`
  - Animation: Pulse effect on hover

### Cards
- **Content Thumbnail Card**
  - Background: Deep Black
  - Border Radius: 12px
  - Image: 16:9 aspect ratio with overlay gradient
  - Title: White, Semi-Bold, 16px
  - Subtitle: Off-White, Regular, 14px
  - Badge: Small pill with purple or gold background
  - Shadow: Card Shadow
  - Hover Effect: Scale up 2%, shadow intensity increase
  - Animation: Fade + Slide up on appear

- **Featured Content Card**
  - Background: Deep Black
  - Border Radius: 16px
  - Image: Full bleed with Dark Fade overlay
  - Title: White, Bold, 24px
  - Subtitle: Off-White, Medium, 16px
  - Play Button: Gold Accent, 60px diameter
  - Shadow: Enhanced Card Shadow
  - Animation: Parallax effect on scroll (subtle)

- **Category Card**
  - Background: Purple Gradient
  - Border Radius: 12px
  - Height: 100px
  - Text: White, Bold, 20px, centered
  - Shadow: Card Shadow
  - Hover Effect: Scale up 3%, brightness increase 5%
  - Animation: Subtle background gradient shift on hover

### Inputs
- **Text Input**
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border: 1px solid `rgba(255, 255, 255, 0.2)`
  - Text: White, Regular, 16px
  - Border Radius: 12px
  - Height: 54px
  - Padding: Horizontal 16px
  - Focus State: Border color change to Royal Purple, subtle glow
  - Animation: Smooth border color transition

- **Search Input**
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border Radius: 24px
  - Height: 48px
  - Icon: Search icon in Gray
  - Text: White, Regular, 16px
  - Focus State: Border color change to Royal Purple
  - Animation: Width expansion on focus (in header)

### Navigation
- **Bottom Tab Bar**
  - Background: `rgba(0, 0, 0, 0.95)`
  - Height: 64px
  - Shadow: Bottom Navigation Shadow
  - Active Tab: Gold icon with label, Purple indicator dot
  - Inactive Tab: Gray icon, no label
  - Animation: Bounce effect on tab selection

- **Content Row Header**
  - Text: White, Bold, 20px
  - "See All" Text: Gold, Medium, 14px
  - Animation: Subtle slide-in effect on scroll

- **Header Navigation**
  - Background: Transparent to Deep Black gradient
  - Height: 60px
  - Logo: Gold and Purple
  - Back Button: White circular button
  - Animation: Fade in/out on scroll

## Screen Specifications

### 1. Splash Screen
- Background: Deep Black with Spotlight gradient
- Logo: Large animated BigShow logo in Gold and Purple
- Animation: Logo reveal with particle effects
- Loading Indicator: Pulsing purple circle
- Transition: Fade out to Welcome or Home screen

### 2. Authentication Flow

#### 2.1 Welcome Screen
- Background: Cinematic backdrop with Dark Fade overlay
- Logo: Centered BigShow logo (Gold and Purple)
- Headline: "Premium Entertainment Awaits" in White, Bold, 28px
- Buttons:
  - Sign In: Primary Button style
  - Sign Up: Secondary Button style
  - "Continue as Guest": Text link in Off-White
- Animation: Subtle parallax effect on background

#### 2.2 Sign Up Screen
- Background: Deep Black with subtle Purple gradient corners
- Form Layout: Vertical stack with 24px spacing
- Header: "Create Account" in White, Bold, 28px
- Input Fields: Text Input style
- Social Sign-up: Icon buttons for Google, Apple, Facebook
- Submit Button: Primary Button style with "Get Started" text
- Animation: Field validation with subtle shake for errors

#### 2.3 Sign In Screen
- Background: Deep Black with subtle Purple gradient corners
- Form Layout: Vertical stack with 24px spacing
- Header: "Welcome Back" in White, Bold, 28px
- Input Fields: Text Input style
- "Remember me": Custom checkbox with Gold accent
- "Forgot password?": Text link in Gold
- Social Sign-in: Icon buttons for Google, Apple, Facebook
- Submit Button: Primary Button style with "Sign In" text
- Animation: Success animation on valid login

#### 2.4 Subscription Selection
- Background: Deep Black
- Title: "Choose Your Plan" in White, Bold, 28px
- Subtitle: "Cancel anytime" in Off-White, Regular, 16px
- Tier Cards:
  - Background: `rgba(255, 255, 255, 0.05)`
  - Border: 2px solid transparent (selected: Gold)
  - Header: Purple Gradient or Gold Gradient (premium)
  - Features: Bulleted list with check icons
  - Price: Bold, 24px
  - Border Radius: 16px
- Toggle: Monthly/Annual with pill selector
- Continue Button: Primary Button style
- Animation: Smooth transition when selecting plans

### 3. Home Screen
- Background: Deep Black
- Header: BigShow logo in Gold and Purple, user avatar, notifications icon
- Hero Carousel:
  - Height: 240px
  - Border Radius: 16px
  - Gradient Overlay: Dark Fade for text legibility
  - Title: White, Bold, 24px
  - Subtitle: Off-White, Regular, 16px
  - Play Button: Gold Accent style
  - Navigation Dots: Gold for active, Gray for inactive
  - Animation: Smooth cross-fade between items

- Content Rows:
  - Header: White, Bold, 20px with Gold accent line
  - Thumbnails: Content Thumbnail Card style
  - Row Spacing: 24px
  - Animation: Slide-in effect when scrolling

- Bottom Navigation: Bottom Tab Bar style

### 4. Categories Screen
- Background: Deep Black
- Header: "Categories" in White, Bold, 24px
- Category Grid:
  - 2 columns layout
  - Cards: Category Card style
  - Spacing: 16px
  - Animation: Staggered fade-in animation

- Filter Panel:
  - Background: `rgba(74, 0, 128, 0.2)`
  - Border Radius: 16px
  - Chip Filters: Pill-shaped toggles
  - Sort Dropdown: Custom dropdown with Gold accent
  - Animation: Smooth expand/collapse

### 5. Search Screen
- Background: Deep Black
- Header: Large Search Input
- Recent Searches:
  - Section Title: "Recent Searches" in White, Semi-Bold, 18px
  - List Items: Text with clock icon and clear button
  - Animation: Slide-in from left

- Trending Searches:
  - Section Title: "Trending Now" in White, Semi-Bold, 18px
  - Tags: Pill-shaped buttons with Purple background
  - Animation: Subtle pulse effect

- Results Grid:
  - 2-column layout of Content Thumbnail Cards
  - Empty State: Illustrated graphic with helper text
  - Animation: Fade-in results as they load

### 6. Content Details Screen
- Background: Deep Black
- Hero Area:
  - Backdrop: Full-width image with gradient overlay
  - Play Button: Large Gold Accent Play Button
  - Title: White, Bold, 28px
  - Meta Info: Year, Rating, Duration in Off-White
  - Genre Tags: Pill-shaped tags with Purple background

- Synopsis:
  - Section Title: "Synopsis" in White, Semi-Bold, 18px
  - Text: Off-White, Regular, 16px
  - "Read More" toggle in Gold
  - Animation: Smooth height transition on expand

- Action Buttons:
  - Row of Icon Buttons: Download, Add to Watchlist, Share
  - Background: `rgba(255, 255, 255, 0.1)`
  - Border Radius: 12px
  - Animation: Scale effect on press

- Episodes (for series):
  - Section Title: "Episodes" with Season selector
  - Episode Cards:
    - Thumbnail: 16:9 with episode number badge
    - Title: White, Semi-Bold, 16px
    - Duration: Gray, Regular, 14px
    - Progress Bar: Purple to Gold gradient
  - Animation: Smooth scroll with pagination dots

- Cast & Crew:
  - Horizontal scroll of circular portraits
  - Names: White, Medium, 14px
  - Animation: Subtle hover effect

### 7. Video Player Screen
- Background: Black
- Video: Full-screen playback
- Controls Overlay:
  - Background: Dark gradient for legibility
  - Play/Pause: Large icon button
  - Seek Bar: Purple track with Gold position indicator
  - Time Display: White, Regular, 14px
  - Additional Controls: Volume, Subtitles, Quality
  - Animation: Fade in/out with 5-second timeout

- Next Episode Prompt:
  - Appears 10 seconds before end
  - Background: `rgba(0, 0, 0, 0.8)`
  - Countdown Timer: Circular progress in Gold
  - Animation: Slide up from bottom

### 8. Profile Screen
- Background: Deep Black
- User Info Section:
  - Profile Picture: Large circular image with Gold border
  - Username: White, Bold, 24px
  - Membership Badge: Gold pill with text
  - Animation: Subtle glow effect on load

- Settings Sections:
  - Section Headers: White, Semi-Bold, 18px
  - List Items:
    - Background: `rgba(255, 255, 255, 0.05)`
    - Icon: Left-aligned in Gold or Purple
    - Text: White, Regular, 16px
    - Border Radius: 12px
    - Arrow: Chevron icon in Gray
  - Spacing: 8px between items, 24px between sections
  - Animation: Subtle slide effect on press

- Sign Out Button: Secondary Button style with red text
- Version Info: Gray, Regular, 12px centered at bottom

## Micro-interactions & Animation Specifications

### Loading States
- **Content Loading**
  - Skeleton screens with shimmer effect
  - Colors: Dark Gray to slightly lighter Gray gradient
  - Animation: 1s linear gradient sweep

- **Button Loading**
  - Replace text with small bouncing dots
  - Maintain button width during loading
  - Animation: 3 dots bouncing in sequence

### Transitions
- **Screen Transitions**
  - Default: 300ms fade transition
  - Modal Present: Slide up from bottom + fade
  - Modal Dismiss: Slide down + fade out
  - Tab Switch: Cross-fade with subtle scale

- **Content Reveal**
  - Staggered animation for list items
  - Start delay: 50ms
  - Item delay: 25ms
  - Animation: Fade + slight Y translation

### Feedback
- **Success Feedback**
  - Flash of Gold accent color
  - Check mark icon scale animation
  - Haptic feedback (medium impact)

- **Error Feedback**
  - Subtle shake animation (3 oscillations, 300ms)
  - Red highlight flash
  - Error message slide in from bottom
  - Haptic feedback (error pattern)

## Accessibility Considerations
- **Color Contrast**
  - All text meets WCAG AA standard minimum 4.5:1 ratio
  - Interactive elements have distinct focus states

- **Text Sizing**
  - All font sizes support dynamic type scaling
  - Minimum touch target size: 44px × 44px

- **Voice Over Support**
  - All interactive elements have appropriate labels
  - Custom focus order for logical navigation
  - Descriptive announcements for state changes

## Implementation Notes
- Use React Native's Animated API for simple animations
- Implement complex animations with Reanimated 2
- Leverage Moti for declarative animations
- Use expo-linear-gradient for all gradient effects
- Consider react-native-skia for complex visual effects
- Implement dark mode as the only theme (premium feel)
- Use react-navigation with custom transitions
- Consider FlashList instead of FlatList for performance

This UIMD specification provides a comprehensive guide for implementing the BigShow OTT platform with a consistent, premium visual language that emphasizes the black, royal purple, and gold color scheme while incorporating modern animation techniques for an engaging user experience.
