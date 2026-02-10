import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>The Origin Hair Collective</h1>
        <p class="tagline">Premium Raw Hair Extensions — Ethically Sourced from Southeast Asia</p>
        <p class="subtitle">
          Direct from Cambodia, Indonesia, India, Vietnam &amp; Myanmar.
          Cuticle-aligned, single-donor, unprocessed hair for the most natural look and feel.
        </p>
        <a href="#products" class="cta-button">Explore Our Collection</a>
      </div>
    </section>
  `,
  styles: `
    .hero {
      background: linear-gradient(135deg, #3b1f0b 0%, #6b3a1f 40%, #a67c52 100%);
      color: #fff;
      padding: 6rem 2rem;
      text-align: center;
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-content { max-width: 800px; }
    h1 {
      font-family: 'Georgia', serif;
      font-size: 3.5rem;
      margin-bottom: 1rem;
      color: #f5d5a0;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    .tagline {
      font-size: 1.4rem;
      color: #f0e0c0;
      margin-bottom: 1rem;
      font-style: italic;
    }
    .subtitle {
      font-size: 1.1rem;
      color: #ddd;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      padding: 1rem 2.5rem;
      background: #d4a85c;
      color: #3b1f0b;
      text-decoration: none;
      font-weight: 700;
      font-size: 1.1rem;
      border-radius: 4px;
      transition: background 0.3s;
    }
    .cta-button:hover { background: #e8c580; }
  `,
})
export class HeroComponent {}
