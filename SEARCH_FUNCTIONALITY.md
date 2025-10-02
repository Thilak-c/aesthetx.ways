# Search Functionality with Convex Database

This project now includes a comprehensive search functionality integrated with Convex database for real-time product search.

## Features

### Desktop Search
- **Real-time search**: As you type, products are searched in real-time using Convex
- **Debounced queries**: Search requests are debounced to avoid excessive API calls
- **Dropdown results**: Shows up to 8 search results in a dropdown below the search bar
- **Product preview**: Each result shows product imgcategory, and price
- **Direct navigation**: Click on any result to go directly to the product page
- **View all results**: Option to see all search results on a dedicated page

### Mobile Search
- **Search modal**: Full-screen search modal for mobile devices
- **Touch-friendly**: Optimized for mobile interaction
- **Same functionality**: All desktop features available on mobile

### Search Results Page
- **Dedicated page**: `/search?q=query` for viewing all search results
- **Grid layout**: Products displayed in a responsive grid
- **Pagination ready**: Currently shows up to 50 results, easily expandable
- **Empty states**: Proper handling of no results and loading states

## Technical Implementation

### Components Created
1. **SearchBar.jsx** - Desktop search component with dropdown
2. **MobileSearchModal.jsx** - Mobile search modal
3. **app/search/page.jsx** - Search results page

### Convex Integration
- Uses existing `api.products.searchProducts` function
- Real-time updates through Convex React hooks
- Optimized queries with proper loading states

### Search Features
- **Multi-field search**: Searches product name, itemId, category, and description
- **Case-insensitive**: Search works regardless of case
- **Minimum 2 characters**: Prevents excessive API calls
- **Debounced**: 300ms delay to optimize performance

## Usage

### Desktop
1. Click on the search bar in the navbar
2. Start typing to see real-time results
3. Click on any result to view the product
4. Click "View all results" to see all matches

### Mobile
1. Tap the search icon in the mobile navbar
2. Type in the search modal
3. Tap on any result to view the product
4. Use "View all results" for comprehensive search

## Customization

### Styling
- All components use Tailwind CSS classes
- Consistent with existing design system
- Responsive design for all screen sizes

### Search Behavior
- Modify debounce delay in SearchBar.jsx and MobileSearchModal.jsx
- Change result limits in the useQuery calls
- Customize search fields in the Convex function

### Results Display
- Adjust grid layout in search page
- Modify product card design
- Add additional product information

## Performance Considerations

- **Debounced queries**: Prevents excessive API calls
- **Limited results**: Shows reasonable number of results initially
- **Lazy loading**: Results load only when needed
- **Optimized imgs Next.js imimimimimgptimization

## Future Enhancements

- **Search filters**: Add category, price range filters
- **Search history**: Remember recent searches
- **Search suggestions**: Auto-complete suggestions
- **Advanced search**: More sophisticated search algorithms
- **Search analytics**: Track popular searches
