import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService, CreateListingRequest } from '../../services/listing.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-listing.component.html',
  styleUrls: ['./create-listing.component.css']
})
export class CreateListingComponent {
  listing: CreateListingRequest = {
    name: '',
    description: '',
    price: 0,
    category: '',
    location: '',
    pictures: []
  };

  locations: string[] = [
    'Valletta', 'Sliema', 'St. Julian\'s', 'Birkirkara', 'Mosta', 'Qormi', 'Zebbug', 'Attard', 'Balzan',
    'Birzebbuga', 'Fgura', 'Floriana', 'Gzira', 'Hamrun', 'Marsaskala', 'Marsaxlokk', 'Mdina', 'Mellieha',
    'Msida', 'Naxxar', 'Paola', 'Pembroke', 'Rabat', 'San Gwann', 'Santa Venera', 'Siggiewi', 'Swieqi',
    'Tarxien', 'Vittoriosa', 'Xghajra', 'Zabbar', 'Zejtun', 'Zurrieq',
    'Gozo - Victoria', 'Gozo - Xewkija', 'Gozo - Nadur', 'Gozo - Qala', 'Gozo - Ghajnsielem',
    'Gozo - Xaghra', 'Gozo - Sannat', 'Gozo - Munxar', 'Gozo - Fontana', 'Gozo - Gharb',
    'Gozo - San Lawrenz', 'Gozo - Zebbug'
  ];

  pictureSlots = Array(10).fill(0);
  selectedFiles: (File | null)[] = Array(10).fill(null);
  previewUrls: string[] = Array(10).fill('');

  isSubmitting = false;
  errorMessage = '';

  constructor(
    private listingService: ListingService,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[index] = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls[index] = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(index: number) {
    const input = document.getElementById('picture-' + index) as HTMLInputElement;
    input.click();
  }

  onSubmit() {
    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Please log in to create a listing.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Filter out null files
    this.listing.pictures = this.selectedFiles.filter(file => file !== null) as File[];

    this.listingService.createListing(this.listing).subscribe({
      next: (createdListing) => {
        this.isSubmitting = false;
        this.router.navigate(['/listing', createdListing.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to create listing. Please try again.';
        console.error('Error creating listing:', error);
      }
    });
  }
}
