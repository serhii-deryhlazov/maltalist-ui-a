import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService, Listing } from '../../services/listing.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.css']
})
export class ListingDetailsComponent implements OnInit {
  listing: Listing | null = null;
  currentImageIndex = 0;
  currentUser: User | null = null;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listingService: ListingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(id);
    }

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.checkOwnership();
    });
  }

  loadListing(id: string) {
    this.listingService.getListingById(id).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.checkOwnership();
      },
      error: (error) => {
        console.error('Error loading listing:', error);
        // TODO: Handle error (show not found page)
      }
    });
  }

  checkOwnership() {
    if (this.listing && this.currentUser) {
      this.isOwner = this.listing.userId === this.currentUser.id;
    } else {
      this.isOwner = false;
    }
  }

  get currentImage(): string {
    if (this.listing && this.listing.picture1) {
      return this.listing.picture1;
    }
    return '';
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }

  contactSeller() {
    if (this.listing) {
      // TODO: Implement contact functionality
      // This could open a modal, redirect to a contact form, or use Stripe for payments
      alert('Contact functionality will be implemented with Stripe integration');
    }
  }

  editListing() {
    if (this.listing) {
      // TODO: Navigate to edit page or open edit modal
      alert('Edit functionality will be implemented');
    }
  }

  deleteListing() {
    if (this.listing && confirm('Are you sure you want to delete this listing?')) {
      this.listingService.deleteListing(this.listing.id.toString()).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting listing:', error);
          alert('Failed to delete listing. Please try again.');
        }
      });
    }
  }

  copyToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // TODO: Show success message
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
