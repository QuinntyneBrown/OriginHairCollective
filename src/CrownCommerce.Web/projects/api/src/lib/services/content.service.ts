import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_CONFIG } from '../api.config';
import type { ContentPage, CreateTestimonialRequest, FaqItem, GalleryImage, Testimonial, UpdateTestimonialRequest } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_CONFIG).baseUrl}/api/content`;

  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.baseUrl}/testimonials`);
  }

  createTestimonial(request: CreateTestimonialRequest): Observable<Testimonial> {
    return this.http.post<Testimonial>(`${this.baseUrl}/testimonials`, request);
  }

  // TODO: Verify backend PUT endpoint exists at /api/content/testimonials/{id}
  updateTestimonial(id: string, request: UpdateTestimonialRequest): Observable<Testimonial> {
    return this.http.put<Testimonial>(`${this.baseUrl}/testimonials/${id}`, request);
  }

  getGallery(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.baseUrl}/gallery`);
  }

  getGalleryByCategory(category: string): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[]>(`${this.baseUrl}/gallery/category/${category}`);
  }

  getFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.baseUrl}/faqs`);
  }

  getFaqsByCategory(category: string): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.baseUrl}/faqs/category/${category}`);
  }

  getPages(): Observable<ContentPage[]> {
    return this.http.get<ContentPage[]>(`${this.baseUrl}/pages`);
  }

  getPage(slug: string): Observable<ContentPage> {
    return this.http.get<ContentPage>(`${this.baseUrl}/pages/${slug}`);
  }

  // TODO: Verify backend DELETE endpoint exists at /api/content/testimonials/{id}
  deleteTestimonial(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/testimonials/${id}`);
  }
}
