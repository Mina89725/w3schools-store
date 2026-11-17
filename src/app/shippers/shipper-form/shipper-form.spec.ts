import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { NewShipper } from '../new-shipper';
import { ShipperService } from '../shipper-service';
import { ShipperForm } from './shipper-form';

const apiNotReachable = throwError(() => new Error('API not reachable'));
const apiRefuses = throwError(
  () => new HttpErrorResponse({ status: 400, error: { error: 'Data too long for column' } }),
);

function showShipperForm(createShipper: (shipper: NewShipper) => Observable<number>) {
  TestBed.configureTestingModule({
    imports: [ShipperForm],
    providers: [{ provide: ShipperService, useValue: { createShipper } }],
  });
  const fixture = TestBed.createComponent(ShipperForm);
  fixture.detectChanges();
  return fixture;
}

function typeInto(page: HTMLElement, selector: string, text: string) {
  const input = page.querySelector(selector) as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

function fillInSpeedyMail(page: HTMLElement) {
  typeInto(page, '#shipper-name', 'Speedy Mail');
  typeInto(page, '#shipper-phone', '031 555 12 34');
}

describe('ShipperForm', () => {
  it('shows the error of a field only after you have left it', async () => {
    const fixture = showShipperForm(() => of(4));
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('.field-error')).toBeNull();

    page.querySelector('#shipper-name')?.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(page.querySelector('#shipper-name-error')?.textContent).toContain('Enter the name');
    expect(page.querySelector('#shipper-phone-error')).toBeNull();
  });

  it('points out empty fields, moves to the first one once its error shows, and sends nothing', async () => {
    let sentShipper: NewShipper | undefined;
    const fixture = showShipperForm((shipper) => {
      sentShipper = shipper;
      return of(4);
    });
    const page: HTMLElement = fixture.nativeElement;
    let errorWhenFocused: string | undefined;
    page.querySelector('#shipper-name')?.addEventListener('focus', () => {
      errorWhenFocused = page.querySelector('#shipper-name-error')?.textContent;
    });

    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.textContent).toContain('Enter a phone number.');
    expect(document.activeElement?.id).toBe('shipper-name');
    expect(errorWhenFocused).toContain('Enter the name of the shipper.');
    expect(page.querySelector('#shipper-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(sentShipper).toBeUndefined();
  });

  it('points out a name that is too long for the database and sends nothing', async () => {
    let sentShipper: NewShipper | undefined;
    const fixture = showShipperForm((shipper) => {
      sentShipper = shipper;
      return of(4);
    });
    const page: HTMLElement = fixture.nativeElement;

    fillInSpeedyMail(page);
    typeInto(page, '#shipper-name', 'x'.repeat(256));
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('#shipper-name-error')?.textContent).toContain('at most 255');
    expect(sentShipper).toBeUndefined();
  });

  it('saves the shipper and shows its new number', async () => {
    let sentShipper: NewShipper | undefined;
    const fixture = showShipperForm((shipper) => {
      sentShipper = shipper;
      return of(4);
    });
    const page: HTMLElement = fixture.nativeElement;

    fillInSpeedyMail(page);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(sentShipper).toEqual({ ShipperName: 'Speedy Mail', Phone: '031 555 12 34' });
    expect(page.querySelector('[role="status"]')?.textContent).toContain('no. 4');
    expect(page.querySelector<HTMLInputElement>('#shipper-name')?.value).toBe('');
  });

  it('shows the reason when the REST API refuses the shipper', async () => {
    const fixture = showShipperForm(() => apiRefuses);
    const page: HTMLElement = fixture.nativeElement;

    fillInSpeedyMail(page);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Data too long for column');
    expect(page.querySelector('[role="alert"]')?.textContent).not.toContain('cannot reach');
  });

  it('explains what to check when the REST API cannot be reached', async () => {
    const fixture = showShipperForm(() => apiNotReachable);
    const page: HTMLElement = fixture.nativeElement;

    fillInSpeedyMail(page);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain(
      'cannot reach the REST API',
    );
    expect(page.querySelector<HTMLInputElement>('#shipper-name')?.value).toBe('Speedy Mail');
  });

  it('removes the old message when you save again', async () => {
    let apiAnswer: Observable<number> = apiNotReachable;
    const fixture = showShipperForm(() => apiAnswer);
    const page: HTMLElement = fixture.nativeElement;
    fillInSpeedyMail(page);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    apiAnswer = of(4);
    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(page.querySelector('[role="alert"]')).toBeNull();
    expect(page.querySelector('[role="status"]')?.textContent).toContain('no. 4');
  });
});
