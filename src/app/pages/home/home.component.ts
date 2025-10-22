import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ListingService, ListingSummary, GetAllListingsResponse } from '../../services/listing.service';

interface FilterOption {
  category: string;
  icon: string;
  label: string;
  selected: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  filters: FilterOption[] = [
    { category: '', icon: 'apps', label: 'All', selected: true },
    { category: 'Electronics', icon: 'devices', label: 'Electronics', selected: false },
    { category: 'Furniture', icon: 'chair', label: 'Furniture', selected: false },
    { category: 'Clothing', icon: 'apparel', label: 'Clothing', selected: false },
    { category: 'Vehicles', icon: 'pedal_bike', label: 'Vehicles', selected: false },
    { category: 'Real Estate', icon: 'real_estate_agent', label: 'Real Estate', selected: false },
    { category: 'Sports&Hobby', icon: 'sports_tennis', label: 'Sports&Hobby', selected: false },
    { category: 'Books', icon: 'auto_stories', label: 'Books', selected: false },
    { category: 'Other', icon: 'construction', label: 'Other', selected: false }
  ];

  locations: string[] = [
    'Valletta', 'Sliema', 'St. Julian\'s', 'Birkirkara', 'Mosta', 'Qormi', 'Zebbug', 'Attard', 'Balzan',
    'Birzebbuga', 'Fgura', 'Floriana', 'Gzira', 'Hamrun', 'Marsaskala', 'Marsaxlokk', 'Mdina', 'Mellieha',
    'Msida', 'Naxxar', 'Paola', 'Pembroke', 'Rabat', 'San Gwann', 'Santa Venera', 'Siggiewi', 'Swieqi',
    'Tarxien', 'Vittoriosa', 'Xghajra', 'Zabbar', 'Zejtun', 'Zurrieq',
    'Gozo - Victoria', 'Gozo - Xewkija', 'Gozo - Nadur', 'Gozo - Qala', 'Gozo - Ghajnsielem',
    'Gozo - Xaghra', 'Gozo - Sannat', 'Gozo - Munxar', 'Gozo - Fontana', 'Gozo - Gharb',
    'Gozo - San Lawrenz', 'Gozo - Zebbug'
  ];

  listings: ListingSummary[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 9;

  searchQuery = '';
  selectedLocation = '';
  selectedSort = 'date_desc';
  selectedCategory = '';

  private searchTimeout: any;

  constructor(
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadListings();
  }

  selectFilter(filter: FilterOption) {
    this.filters.forEach(f => f.selected = false);
    filter.selected = true;
    this.selectedCategory = filter.category;
    this.currentPage = 1;
    this.loadListings();
  }

  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadListings();
    }, 300);
  }

  onLocationChange() {
    this.currentPage = 1;
    this.loadListings();
  }

  onSortChange() {
    this.currentPage = 1;
    if (this.selectedSort !== 'distance') {
      this.selectedLocation = '';
    }
    this.loadListings();
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadListings();
    }
  }

  loadListings() {
    this.loading = true;
    if (this.selectedCategory) {
      // Fetch promoted listings first
      this.listingService.getPromotedListings(this.selectedCategory).subscribe({
        next: (promoted) => {
          // Mark as promoted (already done in service)
          // promoted.forEach(p => p.isPromoted = true);
          // Then fetch all listings
          this.listingService.getAllListings({
            page: this.currentPage,
            pageSize: this.pageSize,
            category: this.selectedCategory,
            location: this.selectedLocation,
            search: this.searchQuery,
            sort: this.selectedSort
          }).subscribe({
            next: (response: GetAllListingsResponse) => {
              const promotedIds = new Set(promoted.map(p => p.id));
              const nonPromoted = response.listings.filter(l => !promotedIds.has(l.id));
              this.listings = [...promoted, ...nonPromoted];
              this.totalPages = Math.ceil(response.totalNumber / this.pageSize);
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading listings:', error);
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error loading promoted listings:', err);
          // Fallback to loading all listings
          this.listingService.getAllListings({
            page: this.currentPage,
            pageSize: this.pageSize,
            category: this.selectedCategory,
            location: this.selectedLocation,
            search: this.searchQuery,
            sort: this.selectedSort
          }).subscribe({
            next: (response: GetAllListingsResponse) => {
              this.listings = response.listings;
              this.totalPages = Math.ceil(response.totalNumber / this.pageSize);
              this.loading = false;
            },
            error: (error) => {
              console.error('Error loading listings:', error);
              this.loading = false;
            }
          });
        }
      });
    } else {
      // No category selected, load all listings
      this.listingService.getAllListings({
        page: this.currentPage,
        pageSize: this.pageSize,
        category: this.selectedCategory,
        location: this.selectedLocation,
        search: this.searchQuery,
        sort: this.selectedSort
      }).subscribe({
        next: (response: GetAllListingsResponse) => {
          this.listings = response.listings;
          this.totalPages = Math.ceil(response.totalNumber / this.pageSize);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading listings:', error);
          this.loading = false;
        }
      });
    }
  }

  navigateToListing(id: number) {
    this.router.navigate(['/listing', id]);
  }

  getMainImage(listing: ListingSummary): string {
    return listing.picture || '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  formatPrice(price: number): string {
    return price.toLocaleString();
  }
}
