import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <section class="about" id="about">
      <h2>Our Story</h2>
      <div class="about-content">
        <div class="about-text">
          <p>
            The Origin Hair Collective was founded on a simple principle: every person deserves access
            to the finest quality raw hair extensions, ethically and transparently sourced.
          </p>
          <p>
            We travel directly to Cambodia, Indonesia, India, Vietnam, and Myanmar to build
            personal relationships with our suppliers. Each strand is carefully selected,
            cuticle-aligned, and minimally processed to preserve its natural beauty.
          </p>
          <p>
            Our commitment goes beyond quality. We ensure fair wages for every community
            we partner with, creating a supply chain built on respect and mutual benefit.
          </p>
        </div>
        <div class="sourcing-highlights">
          <div class="highlight">
            <span class="highlight-number">5</span>
            <span class="highlight-label">Source Countries</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">100%</span>
            <span class="highlight-label">Raw & Unprocessed</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">Single</span>
            <span class="highlight-label">Donor Hair</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .about {
      padding: 4rem 2rem;
      background: #faf6f1;
    }
    h2 {
      font-family: 'Georgia', serif;
      font-size: 2.5rem;
      color: #3b1f0b;
      text-align: center;
      margin-bottom: 2rem;
    }
    .about-content {
      max-width: 1000px;
      margin: 0 auto;
    }
    .about-text {
      max-width: 700px;
      margin: 0 auto 2.5rem;
      text-align: center;
    }
    .about-text p {
      color: #555;
      line-height: 1.8;
      font-size: 1.05rem;
      margin-bottom: 1rem;
    }
    .sourcing-highlights {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
    }
    .highlight {
      text-align: center;
      padding: 1.5rem;
    }
    .highlight-number {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: #d4a85c;
      font-family: 'Georgia', serif;
    }
    .highlight-label {
      display: block;
      color: #6b3a1f;
      font-size: 0.95rem;
      margin-top: 0.3rem;
    }
  `,
})
export class AboutComponent {}
