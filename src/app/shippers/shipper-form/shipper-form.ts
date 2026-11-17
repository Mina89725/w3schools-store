import { Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FieldTree, FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { refusalReason } from '../../api';
import { NewShipper } from '../new-shipper';
import { ShipperService } from '../shipper-service';

const longestText = 255;

function emptyShipper(): NewShipper {
  return { ShipperName: '', Phone: '' };
}

@Component({
  imports: [FormField, FormRoot],
  selector: 'app-shipper-form',
  templateUrl: './shipper-form.html',
})
export class ShipperForm {
  private readonly shipperService = inject(ShipperService);
  private readonly injector = inject(Injector);

  protected readonly shipper = signal(emptyShipper());
  protected readonly savedShipperId = signal<number | undefined>(undefined);
  protected readonly refusal = signal<string | undefined>(undefined);
  protected readonly saveFailed = signal(false);

  protected readonly shipperForm = form(
    this.shipper,
    (field) => {
      required(field.ShipperName, { message: 'Enter the name of the shipper.' });
      maxLength(field.ShipperName, longestText, {
        message: `The name can have at most ${longestText} characters.`,
      });
      required(field.Phone, { message: 'Enter a phone number.' });
      maxLength(field.Phone, longestText, {
        message: `The phone number can have at most ${longestText} characters.`,
      });
    },
    {
      submission: {
        action: () => this.saveShipper(),
        onInvalid: () => this.focusFirstInvalidFieldAfterRender(),
      },
    },
  );

  protected showsError(field: FieldTree<string>): boolean {
    return field().touched() && field().invalid();
  }

  private focusFirstInvalidFieldAfterRender() {
    afterNextRender(
      () => {
        const firstError = this.shipperForm().errorSummary()[0];
        firstError?.fieldTree().focusBoundControl();
      },
      { injector: this.injector },
    );
  }

  private async saveShipper() {
    this.clearMessages();
    try {
      const newId = await firstValueFrom(this.shipperService.createShipper(this.shipper()));
      this.savedShipperId.set(newId);
      this.shipperForm().reset(emptyShipper());
    } catch (error) {
      this.showSaveError(error);
    }
  }

  private clearMessages() {
    this.savedShipperId.set(undefined);
    this.refusal.set(undefined);
    this.saveFailed.set(false);
  }

  private showSaveError(error: unknown) {
    const reason = refusalReason(error);
    if (reason) {
      this.refusal.set(reason);
      return;
    }
    this.saveFailed.set(true);
  }
}
