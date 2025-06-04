Great. I’ll generate a comprehensive prompt for an AI to design a professional, feature-rich Super Admin Dashboard UI for MAOTT. This will include full content management, Bunny.net CDN and Firebase integration, detailed analytics, and advanced admin features.

I’ll let you know once it’s ready for your review.


# MAOTT Super Admin Dashboard UI/UX Design Prompt

Design a modern, clean **Super Admin Dashboard** interface for MAOTT (a web-series streaming platform). The dashboard should use a neutral background with a strong accent color, flat design elements, clear typography, and ample whitespace for clarity. Ensure a **responsive layout**: on desktop (≥1280px width) display a fixed left sidebar and multi-column content area; on tablet (≥768px) stack elements logically while keeping navigation accessible. Include a **dark/light mode toggle** in the top header to switch themes (light = white/light gray backgrounds, dark = dark gray/black backgrounds with light text, all elements adapt). Use consistent spacing (e.g., 8px or 16px grid), subtle drop shadows on cards, and vibrant accent colors (e.g., blue or teal) for buttons, active states, and highlights.

## Layout & Navigation

* **Sidebar Menu:** A collapsible left-hand navigation with clear icons and labels. Sections include **Content**, **Users**, **Analytics**, **Publishing**, and **Settings**. Each section is expandable: e.g., **Content** expands to sub-pages like *Series List*, *Seasons*, *Episodes*. When collapsed, only icons are visible with tooltips. Highlight the active menu item with an accent color background.
* **Header Bar:** A fixed header at the top with the MAOTT logo on the left. Include a global search field (for quickly finding series, users, etc.) next to the logo. On the right side of the header, place a **dark/light mode toggle**, a notifications bell icon (with badge count), and the admin user’s avatar/profile menu (with logout and settings). The header should remain visible on scroll.
* **Responsive Grid:** The main content area should use a responsive grid layout. On desktop, allow for two- or three-column layouts (for example, a narrow analytics sidebar next to a wider content table). On tablet, collapse to one column where necessary, with the sidebar possibly as a slide-out menu. Ensure all modules reflow gracefully and remain usable.

## Content Management Module

* **Series List View:** Present all web series in an interactive data table or card grid. Each row/card shows the series **thumbnail**, **title**, **genre tags**, **cast**, **release date**, **episodes count**, and a **status** indicator (Published/Unpublished). Above the table, include filters (by genre, status) and a search box. Allow sorting by title/date. Provide pagination or infinite scroll for large lists.
* **CRUD Operations:** Include a prominent **"Add New Series"** button. Clicking it opens a modal form for creating a series (see **Forms** below). Each series row has action buttons/icons: **Edit** (opens modal to update series details), **Delete** (opens confirmation dialog), and a **Publish/Unpublish** toggle (immediately changes status with a toast notification).
* **Series Form (Modal):** The add/edit series modal contains fields: *Title* (text input), *Genre* (multi-select dropdown), *Cast* (multi-line tag input), *Release Date* (date picker), *Description* (text area), *Thumbnail* (image uploader with preview), and *Status* (toggle or dropdown for Published/Unpublished). Validate inputs (e.g., required fields). The modal has “Save” and “Cancel” buttons.
* **Seasons & Episodes:** On the series details page (or inline expansion), list its seasons in a sub-table. Each season row shows *Season Number/Title*, *Release Date*, *Status*, and actions (**Edit Season**, **Delete Season**, **Publish/Unpublish**). A button **"Add Season"** opens a modal to create a new season with fields for name and release date. Under each season, list episodes similarly: columns for *Episode #*, *Title*, *Duration*, *Status*, etc., with **Add Episode**, **Edit**, **Delete**, **Publish** controls.
* **Episode Form (Modal):** The add/edit episode modal includes: *Episode Title*, *Episode Number*, *Release Date*, *Duration*, *Description*, *Thumbnail* (image upload), and *Video Upload*. For *Video Upload*, provide a file picker. Upon file selection, start uploading directly to Bunny.net via their API. Display an upload **progress bar** with percentage and estimated time, and show a success or error status. After upload, automatically generate or allow selection of a *preview thumbnail* for the video.
* **Media Upload:** For thumbnails and video, show clear status feedback: uploading spinner, percentage bar, and a check mark on completion. Allow re-upload or replacement. Videos should be stored on Bunny.net CDN, and the UI should note the video’s Bunny URL or ID after upload.
* **Publish Toggles:** Beside each series/season/episode entry, include a on/off toggle or button for **Publish/Unpublish**. Changing it updates visibility immediately (with a confirmation toast). Use color (e.g., green for published, gray for draft) to indicate status.

## Analytics Dashboard

* **Summary Cards:** At the top of the Analytics section, display key metrics in **card widgets**. Examples: *Total Watch Time*, *Average Retention Rate*, *Active Viewers Now*, *Total Subscribers*, *Monthly Revenue*. Each card has a bold number and a small label. Optionally include a small sparkline or trend arrow in each card.
* **Main Charts Area:** Below the summary, present a grid of interactive charts:

  * **Line/Area Chart:** Show daily or weekly **watch time** or **active viewers** over the last 30 days. Use time-series line or area graph with a tooltip on hover.
  * **Bar/Column Chart:** Show top 5 (or 10) series by **view count** or **watch time**. Bars should use the accent color and be labeled.
  * **Pie/Donut Chart:** Display the distribution of users by **subscription type** (free vs. premium) or device usage. Ensure segments have distinct colors and a legend.
  * **Map/Choropleth:** If geo-data is available, include a world map heatmap for **viewer location distribution**. Highlight countries with shading or dots. Provide a tooltip with country and viewer count on hover.
  * **Revenue Chart:** Show **revenue** trend (day/week/month) in a line chart. Label axes (Time vs. \$).
  * **Bandwidth Usage:** A small line or bar chart showing **Bunny.net bandwidth usage** over time (24h, weekly).
  * **Firebase Data Metrics:** A card or mini-chart for **Firestore reads/writes** or data usage per day. If real-time data is important, consider a realtime counter or gauge.
* **Interactivity:** All charts should have tooltips on hover, a legend to toggle data series, and be responsive. Provide a date range filter (e.g., last 7d, 30d, custom) at the top of the analytics page.
* **Real-time Stats:** Show a **"Live Active Viewers"** count that updates in real-time (perhaps a small ticker). Optionally include a small real-time line chart or gauge.

## User & Admin Management

* **User List Table:** Under the Users section, present all user accounts in a searchable, sortable table. Columns: *Name*, *Email*, *Subscription (Free/Premium)*, *Account Status (Active/Suspended)*, *Role (User/Content Manager/Moderator)*, *Last Login*. Include a checkbox column for batch actions.
* **Filters and Search:** Above the table, add filter chips or dropdowns for **Account Status** (Active/Suspended), **Subscription Type**, and **Role**. Include a search input to find users by name or email.
* **User Actions:** Each user row has an action menu (⋮ or gear icon) with options: **View Profile**, **Edit** (change role or status), **Ban/Suspend**, **Reset Password**. For **Ban/Suspend**, show a confirmation modal (e.g. “Suspend this user?”). **Reset Password** triggers an action to send a reset link (with a success toast).
* **User Profile/Activity:** Clicking **View Profile** opens a detailed view or side panel. Show the user’s information (name, email, subscription, join date), and a history of their **watch activity** (recent series/episodes watched, timestamps), **interactions** (likes, comments), and **support tickets or feedback** if any. Display an activity log or timeline of actions.
* **Admin Roles Management:** In Settings or a dedicated subpage, list all admin accounts with their roles. Each row: *Admin Name*, *Email*, *Role (dropdown)*, *Status*. A Super Admin can change roles (e.g., change a user to Content Manager) or deactivate accounts. Include a button **"Invite Admin"** that opens a modal to enter an email and assign an initial role. Confirmation to send an invite email.

## Publishing & Scheduling

* **Scheduling Release:** On content creation/edit forms (series, season, episode), include a **Release Date & Time** field (date-time picker). Allow admins to set future publish times. If an item is scheduled, clearly label it “Scheduled” in the list view (e.g., show the scheduled date).
* **Calendar View (Optional):** Provide a calendar view (in Publishing section) showing upcoming releases. Each scheduled series/episode appears as an event on its release date. Clicking an event opens the item or edit form.
* **Visibility Settings:** For each content item, allow setting **Visibility**: e.g., Public (free), Premium-Only, or Hidden. Use a dropdown or radio buttons in the form. Show a badge (like “Premium”) on content that’s restricted. Offer a global toggle to make a series free or for paying subscribers.
* **Publish Controls:** Provide quick action buttons on content lists to **Publish Now** or **Revert to Draft**. Use green check or red cross icons to indicate published/draft status.

## UI Components & Interactions

* **Data Tables:** Use clean tables with striped rows or hover highlights. Include multi-column sorting, quick search, and pagination controls. Each table header can have a filter icon if needed (e.g., a calendar filter on date column).
* **Cards & Widgets:** For dashboard cards and charts, use card components with slight rounding and shadows. Cards should have a title, a primary number or chart, and an icon or symbol if relevant.
* **Form Elements:** Use standard UI elements: input fields with floating labels, dropdowns for categories/roles, multi-select tag inputs for things like genres or cast. All dropdowns should support typing to filter options. Toggles or switches for on/off settings (e.g., published status).
* **Modals:** For creating or editing entities, use modal dialogs that overlay the page. The modal header should indicate the action (e.g., “Edit Series: \[Series Title]”). Include form fields as needed, with a “Save/Update” primary button (accent color) and a “Cancel” secondary button. Disable the save button until the form is valid. After saving, close the modal and show a success toast.
* **Notifications:** Implement toast notifications (small pop-ups at top-right or bottom-right) for feedback: e.g., “Series added successfully”, “Error uploading video”, “User suspended”. They should auto-dismiss after a few seconds. Use different colors/icons for success (green) and error (red).
* **Confirmation Prompts:** For destructive actions (delete series, remove user, unschedule), use a confirmation pop-up modal: it should clearly state the action and have “Confirm” and “Cancel” buttons. Perhaps a red warning icon and descriptive text.
* **Tooltips & Help:** On hover over icons or truncated text (like long titles), show tooltips with full information. Optionally include a help (?) icon in complex sections that provides quick guidance.

## Integrations & Backend Considerations

* **Firebase Integration:** The dashboard uses **Firebase Authentication** for admin login and role-based access control. After login, Firebase user info (with custom claims for roles) controls visible features (e.g., only Super Admin sees certain settings). Use **Firestore** to store all content metadata (series, episodes, user data, analytics counters). Real-time listeners can update dashboards live.
* **Bunny.net CDN:** Use **Bunny.net API** for all video asset management. The UI’s video upload component should POST files to Bunny’s storage zone. Display the upload progress (handled via AJAX requests). After upload, store the returned Bunny **Storage Zone URL** in Firestore. For existing videos, allow admins to replace or delete videos on Bunny via API calls (with confirmation).
* **Analytics Data:** Pull **user engagement data** (watch time, retention, viewers) from your analytics services or Firestore events. For Bunny bandwidth, use Bunny’s API or webhooks to fetch CDN bandwidth statistics. Ensure the UI aggregates these into charts in real time or on refresh.
* **Real-time Updates:** Use Firebase Realtime Database or Firestore for any live counters (e.g., active viewers). The dashboard’s “Active Viewers Now” should subscribe to a real-time source (WebSocket or Firestore onSnapshot) to update instantly.
* **Security:** All admin actions should be logged (see Audit Logs). Ensure forms validate input to prevent injection, and use secure Firebase rules to restrict data access.

## Additional Features

* **Dark/Light Mode:** The theme toggle in the header switches between light and dark color palettes. Ensure all UI elements (including charts, icons, form fields) adapt appropriately. For example, in dark mode use light text on dark cards, and adjust chart colors for visibility.
* **Audit Logs:** In the **Settings** section, include an **Audit Logs** page. This shows a chronological table: *Timestamp*, *Admin Name*, *Action Taken*, *Target Item*. Example entries: “2025-05-23 10:15 – Content Manager Alice edited Series *Space Odyssey*”, “2025-05-22 14:02 – Moderator Bob suspended User JohnDoe”. Provide search and filter (by date or admin).
* **Multi-language Support:** Design the UI so that all text can be translated (i18n ready). In Settings, add a language selector dropdown (e.g., English, Spanish). Ensure layouts can accommodate longer text. Icons or flag glyphs can indicate language choice.
* **Accessibility:** Use accessible fonts (e.g., 14px+ base, sans-serif), and ensure sufficient color contrast for text and interactive elements. Include ARIA labels on icons and form inputs for screen readers.

By following this prompt, the resulting design should be a **professional, user-friendly Super Admin Dashboard** that covers all CRUD and analytics needs, with clear navigation and visual hierarchy. Each module (Content, Users, Analytics, Publishing) should feel like a cohesive part of a unified interface, supporting MAOTT’s branding and technical integrations.
