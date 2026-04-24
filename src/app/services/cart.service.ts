import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';


@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'swamp_cart';
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.readCart());
  private readonly notificationSubject = new Subject<string>();

  readonly cart$ = this.cartSubject.asObservable();
  readonly notifications$ = this.notificationSubject.asObservable();

  getItems(): CartItem[] {
    return this.cartSubject.value;
  }

  addItem(product: Product): void {
    const current = [...this.cartSubject.value];
    const existing = current.find((item) => item.product.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      current.push({ product, qty: 1 });
    }

    this.saveCart(current);
    this.notificationSubject.next(`${product.name} added to cart.`);
  }

  updateQuantity(productId: number, qty: number): void {
    const current = [...this.cartSubject.value];
    const target = current.find((item) => item.product.id === productId);
    if (!target) {
      return;
    }

    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }

    target.qty = qty;
    this.saveCart(current);
  }

  removeItem(productId: number): void {
    const next = this.cartSubject.value.filter((item) => item.product.id !== productId);
    this.saveCart(next);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getItemCount(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.qty, 0);
  }

  getCartTotal(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  private readCart(): CartItem[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored) as CartItem[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed;
    } catch {
      return [];
    }
  }
}
