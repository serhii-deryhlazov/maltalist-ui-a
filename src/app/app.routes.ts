import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'profile/:id', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'create', loadComponent: () => import('./pages/create-listing/create-listing.component').then(m => m.CreateListingComponent) },
  { path: 'listing/:id', loadComponent: () => import('./pages/listing-details/listing-details.component').then(m => m.ListingDetailsComponent) },
  { path: '**', redirectTo: '/home' }
];
