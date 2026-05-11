# Dynamic Content Loader - Implementation Guide

This guide explains how to dynamically load Blog, Actualité, and Mining Intelligence content from the EMI Dashboard API.

## Files Created/Updated

- **`assets/js/dynamic-content-loader.js`** - Main loader library with functions for all content types
- **`blog.html`** - Updated to load blog posts dynamically
- **`intelligence.html`** - Updated to load mining intelligence dynamically

## Quick Implementation

### 1. For Blog Posts

**Add script tags to your HTML:**
```html
<script src="./assets/js/dynamic-content-loader.js"></script>
<script>
  // Load blog posts dynamically into container
  document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts('container-id');
  });
</script>
```

**HTML Structure Required:**
```html
<div id="blog-track">
  <!-- Content will be loaded here -->
</div>
```

**With Slider (if using carousel):**
```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts('blog-track');
  });

  // Reinitialize slider after content loads
  var originalRenderBlogPosts = renderBlogPosts;
  renderBlogPosts = function(containerId, posts) {
    originalRenderBlogPosts(containerId, posts);
    setTimeout(function() {
      initBlogSlider(); // Your slider init function
    }, 100);
  };
</script>
```

### 2. For Mining Intelligence

**Add script tags:**
```html
<script src="./assets/js/dynamic-content-loader.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    loadIntelligence('intel-track');
  });
</script>
```

**HTML Structure Required:**
```html
<div class="intel-slider-wrap">
  <div class="intel-slider-track" id="intel-track">
    <!-- Slides will be loaded here -->
  </div>
  
  <div class="intel-slider-nav">
    <button class="intel-arrow" id="intel-prev">←</button>
    <div class="intel-dots-container"></div>
    <button class="intel-arrow" id="intel-next">→</button>
  </div>
</div>
```

### 3. For Actualité/News

**Add script tags:**
```html
<script src="./assets/js/dynamic-content-loader.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    loadActualites('actualites-container');
  });
</script>
```

**HTML Structure Required:**
```html
<div id="actualites-container">
  <!-- Content will be loaded here -->
</div>
```

## API Endpoints

The loader fetches from these endpoints (running on `http://localhost:5000/api`):

- **Blog:** `/api/blog`
  - Returns array of published blog posts
  - Fields: `title_en`, `title_fr`, `text_en`, `text_fr`, `category`, `icon`, `image_url`, `status`, `createdAt`

- **Intelligence:** `/api/intelligence`
  - Returns array of published intelligence items
  - Fields: `title_en`, `title_fr`, `text_en`, `text_fr`, `category`, `icon`, `image_url`, `status`, `createdAt`

- **Actualité:** `/api/actualite`
  - Returns array of published news items
  - Fields: `title_en`, `title_fr`, `text_en`, `text_fr`, `category`, `icon`, `image_url`, `status`, `createdAt`

## Features

### Loading Animation
- Skeleton loaders shown while content fetches
- Smooth fade-in animation for new content
- Staggered animation for cards (each card animates with delay)

### Responsive Design
- Cards automatically adjust based on container
- Blog slider adapts to screen size
- Intelligence slider maintains full-width responsiveness

### Bilingual Support
- Automatically shows content in current language
- Respects localStorage `emi_lang` setting
- Updates content when language changes

### Error Handling
- Graceful fallback if API is unavailable
- Shows user-friendly error messages
- Preserves static content as backup

## Functions Available

### Public Functions

#### `loadBlogPosts(containerId)`
Loads published blog posts and renders them as cards.
- **Parameter:** containerId (string) - ID of the container to render into
- **Returns:** None (populates DOM asynchronously)

#### `loadActualites(containerId)`
Loads published actualité/news items and renders them as cards.
- **Parameter:** containerId (string) - ID of the container
- **Returns:** None (populates DOM asynchronously)

#### `loadIntelligence(trackId)`
Loads published intelligence items and renders as slides.
- **Parameter:** trackId (string) - ID of the slider track
- **Returns:** None (populates DOM asynchronously)

### Internal Functions

#### `showLoadingSkeleton(containerId, count)`
Displays skeleton loading placeholders.

#### `renderBlogPosts(containerId, posts)`
Renders blog posts into the container (called by loadBlogPosts).

#### `renderActualites(containerId, items)`
Renders actualité items into the container (called by loadActualites).

#### `renderIntelligenceSlides(trackId, items)`
Renders intelligence slides into the slider track (called by loadIntelligence).

#### `escHtml(value)`
Escapes HTML special characters for security.

#### `formatDate(dateStr, lang)`
Formats date strings based on language preference.

## Styling Notes

The loader injects CSS animations automatically:
- `@keyframes slideUp` - Card entrance animation
- `@keyframes fadeIn` - Slide entrance animation
- `.skeleton-loader` - Loading state styling
- `.content-empty` - Empty state styling

Make sure your pages have corresponding CSS for:
- `.blog-card` - Blog/actualité card container
- `.blog-card-img` - Card image area
- `.blog-body` - Card content area
- `.intel-slide` - Intelligence slide container
- `.intel-grid` - Two-column layout for intelligence

## Language Switching

Content automatically updates when language changes:
```javascript
// Change language (example)
setLang('fr'); // Loads French content
```

The loader respects the global `setLang()` function already defined in your pages.

## Examples

### Example 1: Add to New Page

```html
<!DOCTYPE html>
<html>
<body>
  <div id="blog-posts">
    <!-- Blog cards will load here -->
  </div>
  
  <script src="./assets/js/dynamic-content-loader.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      loadBlogPosts('blog-posts');
    });
  </script>
</body>
</html>
```

### Example 2: Multiple Content Types on Same Page

```html
<div id="blog-section">
  <h2>Blog Posts</h2>
  <div id="blog-posts"></div>
</div>

<div id="intel-section">
  <h2>Mining Intelligence</h2>
  <div class="intel-slider-wrap">
    <div class="intel-slider-track" id="intel-track"></div>
    <div class="intel-slider-nav">
      <button id="intel-prev">←</button>
      <button id="intel-next">→</button>
    </div>
  </div>
</div>

<div id="news-section">
  <h2>Latest News</h2>
  <div id="actualites"></div>
</div>

<script src="./assets/js/dynamic-content-loader.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    loadBlogPosts('blog-posts');
    loadIntelligence('intel-track');
    loadActualites('actualites');
  });
</script>
```

## Troubleshooting

### Content Not Loading
1. Check if backend server is running on `http://localhost:5000`
2. Verify API endpoint is accessible: `http://localhost:5000/api/blog`
3. Check browser console for error messages
4. Ensure container IDs match in HTML and JavaScript

### Slider Not Working
1. Confirm CSS classes match your stylesheet (`.intel-slide`, etc.)
2. Check that dots are being created dynamically
3. Verify event listeners are attached after content loads

### Styling Issues
1. Confirm your CSS file includes styles for `.blog-card`, `.intel-slide`
2. Check that animation classes are not overridden
3. Verify responsive breakpoints match your design

### Language Not Switching
1. Check that `setLang()` function is available globally
2. Verify `emi_lang` is stored in localStorage
3. Ensure all content has `data-en` and `data-fr` attributes

## Future Enhancements

Potential improvements you can add:
- Pagination for blog/actualité lists
- Search/filter functionality
- Category filtering
- Load more/infinite scroll
- Individual post/item detail pages
- Comments section
- Related items suggestions
