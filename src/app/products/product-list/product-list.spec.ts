import { TestBed } from '@angular/core/testing';
import { NEVER, Observable, of, throwError } from 'rxjs';
import { Product } from '../product';
import { ProductService } from '../product-service';
import { ProductList } from './product-list';

const chais: Product = {
  ProductID: 1,
  ProductName: 'Chais',
  SupplierID: 1,
  CategoryID: 1,
  Unit: '10 boxes x 20 bags',
  Price: 18,
};

const apiNotReachable = throwError(() => new Error('API not reachable'));

function showProductList(getProducts: () => Observable<Product[]>) {
  TestBed.configureTestingModule({
    imports: [ProductList],
    providers: [{ provide: ProductService, useValue: { getProducts } }],
  });
  const fixture = TestBed.createComponent(ProductList);
  fixture.detectChanges();
  return fixture;
}

describe('ProductList', () => {
  it('shows a loading message until the API answers', () => {
    const page: HTMLElement = showProductList(() => NEVER).nativeElement;

    expect(page.querySelector('[role="status"]')?.textContent).toContain('Loading products');
  });

  it('shows the name, unit and price of each product', async () => {
    const fixture = showProductList(() => of([chais]));
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    const products = page.querySelectorAll('li');
    expect(products).toHaveLength(1);
    expect(products[0].querySelector('h2')?.textContent).toContain('Chais');
    expect(products[0].textContent).toContain('10 boxes x 20 bags');
    expect(products[0].textContent).toContain('CHF 18.00');
  });

  it('says so when there are no products', async () => {
    const fixture = showProductList(() => of([]));
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('[role="status"]')?.textContent).toContain('no products');
  });

  it('explains what to check when the API cannot be reached', async () => {
    const fixture = showProductList(() => apiNotReachable);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('REST API');
  });

  it('loads the products again when you press "Try again"', async () => {
    let apiAnswer: Observable<Product[]> = apiNotReachable;
    const fixture = showProductList(() => apiAnswer);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;

    apiAnswer = of([chais]);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelectorAll('li')).toHaveLength(1);
  });
});
