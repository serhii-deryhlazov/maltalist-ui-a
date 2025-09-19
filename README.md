# Maltalist Angular

This is an Angular conversion of the original Maltalist jQuery application. The project has been completely rewritten using modern Angular 17 with standalone components.

## Features Converted

### ✅ Completed
- **Home Page**: Listing grid with filtering, searching, sorting, and pagination
- **Profile Page**: User profile with listings display and authentication
- **Create Listing Page**: Form with file upload for up to 10 images
- **Listing Details Page**: Image carousel, contact functionality, edit/delete for owners
- **Navigation**: Responsive navbar with Google Sign-In integration
- **Authentication**: Google OAuth integration with user session management
- **Responsive Design**: Mobile-first approach with breakpoints
- **API Integration**: HttpClient services for all CRUD operations
- **Routing**: Angular Router with lazy loading
- **Forms**: Template-driven forms with validation
- **File Upload**: Multiple image upload with preview
- **Styling**: Converted CSS with Angular component styles

### 🔧 Architecture Improvements
- **Standalone Components**: Modern Angular 17 architecture
- **Services**: Dedicated services for API calls and state management
- **TypeScript**: Full type safety with interfaces
- **Reactive Programming**: RxJS for async operations
- **Component Communication**: Input/Output for component interaction
- **Dependency Injection**: Angular DI system
- **Lazy Loading**: Route-based code splitting

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/
│   │   └── footer/
│   ├── pages/
│   │   ├── home/
│   │   ├── profile/
│   │   ├── create-listing/
│   │   └── listing-details/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── listing.service.ts
│   ├── app.component.ts
│   ├── app.routes.ts
│   └── app.config.ts
├── assets/
│   ├── css/
│   ├── img/
│   └── js/
└── styles.css
```

## Key Differences from jQuery Version

### 1. **Component-Based Architecture**
- Each page is now a standalone Angular component
- Better separation of concerns
- Reusable components

### 2. **Type Safety**
- Full TypeScript support
- Interface definitions for all data models
- Compile-time error checking

### 3. **Reactive Programming**
- RxJS observables for async operations
- Better handling of API responses
- Automatic subscription management

### 4. **Modern Development Experience**
- Hot reload during development
- Better debugging tools
- Improved IDE support

### 5. **Performance**
- Lazy loading of components
- Tree shaking for smaller bundles
- Optimized change detection

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## API Integration

The application expects the same API endpoints as the original jQuery version:

- `GET /api/listings` - Get all listings with filters
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/auth/google` - Google authentication

## Google Sign-In Setup

Update the client ID in the navbar component:
```typescript
data-client_id="YOUR_GOOGLE_CLIENT_ID"
```

## Features to Implement

- [ ] Edit listing functionality
- [ ] Profile editing
- [ ] Stripe payment integration
- [ ] Real-time notifications
- [ ] Advanced search filters
- [ ] Image optimization
- [ ] Error handling improvements
- [ ] Loading states
- [ ] Unit tests

## Migration Notes

1. **jQuery Dependencies**: All jQuery code has been replaced with Angular equivalents
2. **DOM Manipulation**: Direct DOM manipulation replaced with Angular data binding
3. **Event Handling**: jQuery event handlers replaced with Angular event binding
4. **AJAX Calls**: jQuery AJAX replaced with Angular HttpClient
5. **Routing**: Hash-based routing replaced with Angular Router
6. **State Management**: Local variables replaced with Angular services and RxJS

This Angular version maintains the same user experience while providing a more maintainable and scalable codebase.
