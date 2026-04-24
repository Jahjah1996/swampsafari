import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

interface CheckoutPayloadItem {
  productId: number;
  qty: number;
}

interface CheckoutResponse {
  orderId: number;
  total: number;
}

export interface DashboardOrderItem {
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface DashboardOrder {
  id: number;
  total: number;
  status: string;
  created_at: string;
  items: DashboardOrderItem[];
}

export interface TourBooking {
  id: number;
  tour_type: string;
  group_size: number | null;
  preferred_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export interface UserProfile {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  parish_state: string;
  postal_code: string;
  country: string;
}

interface TourBookingPayload {
  tourType: string;
  groupSize: number | null;
  preferredDate: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  private readonly api = `${environment.apiBaseUrl}`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/products`);
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/products/${productId}`);
  }

  checkout(items: CheckoutPayloadItem[]): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.api}/orders/checkout`, { items }, { headers: this.authHeaders() });
  }

  getMyOrders(): Observable<DashboardOrder[]> {
    return this.http.get<DashboardOrder[]>(`${this.api}/orders/my-orders`, { headers: this.authHeaders() });
  }

  getMyTourBookings(): Observable<TourBooking[]> {
    return this.http.get<TourBooking[]>(`${this.api}/tours/my-bookings`, { headers: this.authHeaders() });
  }

  createTourBooking(payload: TourBookingPayload): Observable<{ bookingId: number; status: string }> {
    return this.http.post<{ bookingId: number; status: string }>(`${this.api}/tours/book`, payload, {
      headers: this.authHeaders()
    });
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/account/profile`, { headers: this.authHeaders() });
  }

  saveMyProfile(profile: UserProfile): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/account/profile`, profile, { headers: this.authHeaders() });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getToken() || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
