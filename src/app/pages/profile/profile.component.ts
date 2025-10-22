import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ListingService, ListingSummary } from '../../services/listing.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  userListings: ListingSummary[] = [];
  isEditMode = false;

  constructor(
    private authService: AuthService,
    private listingService: ListingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadUserListings(user.id);
      }
    });

    // Set up Google Sign-in callback for non-authenticated users
    (window as any).onGoogleSignIn = (response: any) => {
      this.authService.handleGoogleSignIn(response).subscribe({
        next: (user) => {
          if (user && user.id) {
            this.router.navigate(['/profile', user.id]);
          }
        },
        error: (err) => {
          console.error('Google login error:', err);
          alert('Google login failed.');
        }
      });
    };
  }

  loadUserListings(userId: string) {
    this.listingService.getUserListings(userId).subscribe({
      next: (listings) => {
        this.userListings = listings;
      },
      error: (error) => {
        console.error('Error loading user listings:', error);
      }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/create']);
  }

  navigateToListing(id: number) {
    this.router.navigate(['/listing', id]);
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    // TODO: Implement edit profile functionality
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getMainImage(listing: ListingSummary): string {
    return listing.picture || '/assets/img/placeholder.png';
  }
}
