import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  userId: string;
  picture1: string | null;
  createdAt: string;
  updatedAt: string;
  isPromoted?: boolean;
}

export interface ListingSummary {
  id: number;
  title: string;
  price: number;
  category: string;
  location: string | null;
  picture: string | null;
  createdAt: string;
  isPromoted?: boolean;
}

export interface GetAllListingsResponse {
  listings: ListingSummary[];
  totalNumber: number;
  page: number;
}

export interface CreateListingRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  location: string;
  pictures: File[];
}

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  constructor(private http: HttpClient) {}

  getAllListings(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    location?: string;
    search?: string;
    sort?: string;
  }): Observable<GetAllListingsResponse> {
    let httpParams = new HttpParams();

    if (params) {
      // Map Angular params to original API params
      if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
      if (params.pageSize !== undefined) httpParams = httpParams.set('limit', params.pageSize.toString());
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.location) httpParams = httpParams.set('location', params.location);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
    }

    return this.http.get<GetAllListingsResponse>(`/Listings/minimal`, { params: httpParams });
  }

  getListingById(id: string): Observable<Listing> {
    return this.http.get<Listing>(`/Listings/${id}`);
  }

  createListing(listing: CreateListingRequest): Observable<Listing> {
    const formData = new FormData();
    formData.append('name', listing.name);
    formData.append('description', listing.description);
    formData.append('price', listing.price.toString());
    formData.append('category', listing.category);
    formData.append('location', listing.location);

    listing.pictures.forEach((file, index) => {
      formData.append(`Picture${index + 1}`, file);
    });

    return this.http.post<Listing>(`/Listings`, formData);
  }

  updateListing(id: string, listing: Partial<Listing>): Observable<Listing> {
    return this.http.put<Listing>(`/Listings/${id}`, listing);
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`/Listings/${id}`);
  }

  getUserListings(userId: string): Observable<ListingSummary[]> {
    return this.http.get<ListingSummary[]>(`/Listings/${userId}/listings`);
  }

  getListingPictures(id: string): Observable<string[]> {
    return this.http.get<string[]>(`/pictures/${id}`);
  }

  createPromotion(request: { listingId: number; expirationDate: string; category: string }): Observable<any> {
    return this.http.post('/Promotions', request);
  }

  getPromotedListings(category: string): Observable<ListingSummary[]> {
    return this.http.get<Listing[]>(`/Promotions/promoted/${category}`).pipe(
      map(listings => listings.map(l => ({
        id: l.id,
        title: l.title,
        price: l.price,
        category: l.category,
        location: l.location,
        picture: l.picture1,
        createdAt: l.createdAt,
        isPromoted: true
      } as ListingSummary)))
    );
  }
}
