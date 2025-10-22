import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListingService, Listing } from '../../services/listing.service';
import { AuthService, User } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listing-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-details.component.html',
  styleUrls: ['./listing-details.component.css']
})
export class ListingDetailsComponent implements OnInit {
  listing: Listing | null = null;
  pictures: string[] = [];
  currentImageIndex = 0;
  currentUser: User | null = null;
  isOwner = false;
  showPromoteModal = false;
  selectedType = 'week';

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
        // Fetch pictures
        this.listingService.getListingPictures(id).subscribe({
          next: (pics) => {
            this.pictures = pics;
          },
          error: (err) => {
            console.error('Error loading pictures:', err);
            this.pictures = [];
          }
        });

        // Check for promotion success
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('promotion') === 'success') {
          const type = urlParams.get('type');
          const expirationDate = new Date();
          if (type === 'week') {
            expirationDate.setDate(expirationDate.getDate() + 7);
          } else {
            expirationDate.setMonth(expirationDate.getMonth() + 1);
          }
          this.listingService.createPromotion({
            listingId: listing.id,
            expirationDate: expirationDate.toISOString(),
            category: listing.category
          }).subscribe({
            next: () => {
              alert('Listing promoted successfully!');
              window.history.replaceState({}, '', window.location.pathname);
            },
            error: (err: any) => {
              console.error('Error promoting listing:', err);
              alert('Failed to promote listing.');
            }
          });
        }
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
    if (this.pictures.length > 0) {
      return this.pictures[this.currentImageIndex];
    }
    return this.listing?.picture1 || '/assets/img/placeholder.png';
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

  promoteListing() {
    this.showPromoteModal = true;
  }

  confirmPromotion() {
    const stripe = (window as any).Stripe('pk_test_51S7JlICjFdJ7izyJ4a9AJUPconADc29JQKxPX8MpAfM56xvONX6HfSDgpvs5I32RZjaBq1uxCzrIbwxzzfpFIAGy00e9WUDWHI');
    const priceId = this.selectedType === 'week' ? 'price_1S84D4CjFdJ7izyJ7cddtZCf' : 'price_1S84D4CjFdJ7izyJWk98XDT4';
    stripe.redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      successUrl: window.location.href + '?promotion=success&type=' + this.selectedType,
      cancelUrl: window.location.href,
    }).then((result: any) => {
      if (result.error) {
        alert('Payment failed: ' + result.error.message);
      }
    });
    this.showPromoteModal = false;
  }

  cancelPromotion() {
    this.showPromoteModal = false;
  }
}
