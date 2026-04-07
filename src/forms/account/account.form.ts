import { Helper } from '../../common/Helper';
import { NotificationHelper } from '../../common/NotificationHelper';
import { QueryHelper } from '../../common/QueryHelper';

class AccountForm {
  private readonly accountName = 'name';
  private readonly description = 'description';
  private readonly telephone = 'telephone1';
  private readonly primaryContact = 'primarycontactid';

  private readonly descriptionNotificationId = 'crm_account_description_warning';
  private readonly primaryContactNotificationId = 'crm_account_primary_contact_info';

  public onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);

    this.enforceNameAsRequired(formContext);
    this.validateDescriptionLength(formContext);
    void this.loadPrimaryContactInfo(formContext);
  }

  public onNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    this.enforceNameAsRequired(formContext);
  }

  public onDescriptionChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    this.validateDescriptionLength(formContext);
  }

  public onPrimaryContactChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    void this.loadPrimaryContactInfo(formContext);
  }

  private enforceNameAsRequired(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, this.accountName);
    Helper.setRequiredLevel(formContext, this.accountName, value ? 'required' : 'recommended');
  }

  private validateDescriptionLength(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, this.description);

    NotificationHelper.clearForm(formContext, this.descriptionNotificationId);

    if (!value) {
      return;
    }

    if (value.length > 250) {
      NotificationHelper.setForm(
        formContext,
        'Description is longer than 250 characters.',
        XrmEnum.FormNotificationLevel.Warning,
        this.descriptionNotificationId,
      );
    }
  }

  private async loadPrimaryContactInfo(formContext: Xrm.FormContext): Promise<void> {
    try {
      NotificationHelper.clearForm(formContext, this.primaryContactNotificationId);

      const lookup = Helper.getLookup(formContext, this.primaryContact);
      if (!lookup) {
        return;
      }

      const contact = await QueryHelper.retrieve<{
        contactid: string;
        fullname: string;
        mobilephone?: string;
        emailaddress1?: string;
      }>('contact', lookup.id, {
        select: ['contactid', 'fullname', 'mobilephone', 'emailaddress1'],
      });

      const parts = [contact.fullname];

      if (contact.mobilephone) {
        parts.push(`Mobile: ${contact.mobilephone}`);
      }

      if (contact.emailaddress1) {
        parts.push(`Email: ${contact.emailaddress1}`);
      }

      NotificationHelper.setForm(
        formContext,
        `Primary contact: ${parts.join(' | ')}`,
        XrmEnum.FormNotificationLevel.Info,
        this.primaryContactNotificationId,
      );

      if (!Helper.getText(formContext, this.telephone) && contact.mobilephone) {
        Helper.setText(formContext, this.telephone, contact.mobilephone);
      }
    } catch {
      NotificationHelper.clearForm(formContext, this.primaryContactNotificationId);
    }
  }
}

(window as any).AccountForm = new AccountForm();

export {};
