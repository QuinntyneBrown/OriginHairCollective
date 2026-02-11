import { type Page } from '@playwright/test';
import { HeaderComponent } from '../components/header.component';
import { FooterComponent } from '../components/footer.component';
import { MobileNavComponent } from '../components/mobile-nav.component';
import { HeroSection } from '../sections/hero.section';
import { TrustBarSection } from '../sections/trust-bar.section';
import { BrandStorySection } from '../sections/brand-story.section';
import { ProductsSection } from '../sections/products.section';
import { BenefitsSection } from '../sections/benefits.section';
import { TestimonialsSection } from '../sections/testimonials.section';
import { CommunitySection } from '../sections/community.section';
import { FinalCtaSection } from '../sections/final-cta.section';

export class HomePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;
  readonly mobileNav: MobileNavComponent;
  readonly hero: HeroSection;
  readonly trustBar: TrustBarSection;
  readonly brandStory: BrandStorySection;
  readonly products: ProductsSection;
  readonly benefits: BenefitsSection;
  readonly testimonials: TestimonialsSection;
  readonly community: CommunitySection;
  readonly finalCta: FinalCtaSection;

  constructor(private page: Page) {
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.mobileNav = new MobileNavComponent(page);
    this.hero = new HeroSection(page);
    this.trustBar = new TrustBarSection(page);
    this.brandStory = new BrandStorySection(page);
    this.products = new ProductsSection(page);
    this.benefits = new BenefitsSection(page);
    this.testimonials = new TestimonialsSection(page);
    this.community = new CommunitySection(page);
    this.finalCta = new FinalCtaSection(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }
}
