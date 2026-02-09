
# LiveBid - Auction Platform (Phase 1: Core Pages)

## Overview
Build a polished, responsive auction marketplace frontend inspired by LiveAuctioneers, using mock data and static content. Focus on 3 core pages with a shared layout, premium design, and interactive micro-animations.

---

## Design Foundation
- **Color palette**: Dark teal (#003E4D) as primary accent, white backgrounds, red for urgency/CTAs
- **Typography**: Playfair Display for headings, Inter for body text
- **Consistent card system** with hover lift effects, skeleton loading states
- **Fully responsive**: mobile-first with hamburger nav, stacked cards, swipeable carousels

---

## Shared Layout
- **Sticky Header**: Logo, centered search bar with autocomplete dropdown, action icons (Alerts, My Items, Won Items, Account), secondary category navigation bar
- **Footer**: Multi-column links (Company, Winning, Selling, Help, Social), trust badges, app download links, legal links
- **Floating elements**: Feedback tab (left), chat widget button (bottom-right), back-to-top button

---

## Page 1: Homepage
- **Hero section**: Large serif heading "Let's go treasure-hunting", email newsletter signup, circular category quick-access icons
- **Featured Auctions Carousel**: Dark teal background, mosaic image layout, ghost "EXPLORE" button, dot navigation
- **Featured Auctioneers Row**: Horizontally scrolling grayscale logos, colorize on hover
- **Searches to Follow**: Cards with 3-image preview grids, item/follower counts, "Follow This Search" CTA
- **Trending Items Grid**: 4-column responsive grid of item cards with save button, countdown, estimate, current bid, ratings

---

## Page 2: Search Results / Item Listing
- **Filter bar**: Keyword search, "All Filters" button, category/location/shipping dropdowns, sort selector
- **Filter drawer** (slide-in sidebar): Location checkboxes, price range inputs, auction type, auction house search
- **Item grid**: 4-column responsive layout of item cards with Featured badge, save heart, time remaining, title, auctioneer rating, estimate, current bid
- **Pagination** at bottom

---

## Page 3: Item Detail
- **Sub-header**: Back to search link, breadcrumb navigation, auction countdown, lot number, prev/next lot arrows
- **Image gallery**: Vertical thumbnail strip + large main image with prev/next arrows
- **Bidding widget** (right panel): Save button, item title, estimate, live countdown timer, starting price with lock icon, quick bid amount buttons, max bid dropdown, full-width "Place Bid" button, registration link
- **Tabs below fold**: Description, Shipping & Payment, Condition Report
- **Auctioneer info box**: Logo, follow button, ask a question link
- **Related items**: Horizontal scrolling row of similar item cards

---

## Page 4: Authentication Modal
- **Split layout modal**: Featured auction image on left, form on right
- **Login form**: Email/username input, password with show/hide toggle, red "Log In" button, forgot password link
- **Social logins**: Google and Apple buttons with divider
- **Toggle to registration** form

---

## Interactive Features (Mock Data)
- Countdown timers with color changes (green → orange → red as time decreases)
- Heart save animation (fill + pulse)
- Card hover lift effects with shadow transitions
- Search autocomplete with category suggestions
- Image lightbox/zoom on item detail page
- Skeleton loading states for cards and images
- Swipeable carousels using Embla Carousel

---

## Mock Data
- ~20 sample auction items across categories (Art, Jewelry, Furniture, Coins, Fashion)
- 5-6 sample auction houses with logos
- Simulated bid amounts and countdown end times
- Sample item descriptions and condition reports
