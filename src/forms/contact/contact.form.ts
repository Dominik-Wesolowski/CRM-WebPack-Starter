import { Helper } from '../../common/Helper';
import { NotificationHelper } from '../../common/NotificationHelper';
import { QueryHelper } from '../../common/QueryHelper';

class ContactForm {
  private readonly firstName = 'firstname';
  private readonly lastName = 'lastname';
  private readonly fullName = 'fullname';
  private readonly parentCustomer = 'parentcustomerid';
  private readonly mobilePhone = 'mobilephone';

  private readonly nameNotificationId = 'crm_contact_name_warning';
  private readonly mobileNotificationId = 'crm_contact_mobile_warning';
  private readonly parentNotificationId = 'crm_contact_parent_info';

  public onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);

    this.syncFullName(formContext);
    this.validateMobile(formContext);
    void this.loadParentCustomerInfo(formContext);
  }

  public onFirstNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    this.syncFullName(formContext);
  }

  public onLastNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    this.syncFullName(formContext);
  }

  public onParentCustomerChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    void this.loadParentCustomerInfo(formContext);
  }

  public onMobilePhoneChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    this.validateMobile(formContext);
  }

  private syncFullName(formContext: Xrm.FormContext): void {
    const first = Helper.getText(formContext, this.firstName) ?? '';
    const last = Helper.getText(formContext, this.lastName) ?? '';
    const value = `${first} ${last}`.trim();

    Helper.setText(formContext, this.fullName, value || null);

    if (!value) {
      NotificationHelper.setForm(
        formContext,
        'First name or last name is empty.',
        XrmEnum.FormNotificationLevel.Warning,
        this.nameNotificationId,
      );
      return;
    }

    NotificationHelper.clearForm(formContext, this.nameNotificationId);
  }

  private validateMobile(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, this.mobilePhone);

    NotificationHelper.clearControl(formContext, this.mobilePhone, this.mobileNotificationId);

    if (!value) {
      return;
    }

    if (value.replace(/\s+/g, '').length < 7) {
      NotificationHelper.setControl(
        formContext,
        this.mobilePhone,
        'Mobile phone looks too short.',
        this.mobileNotificationId,
      );
    }
  }

  private async loadParentCustomerInfo(formContext: Xrm.FormContext): Promise<void> {
    try {
      NotificationHelper.clearForm(formContext, this.parentNotificationId);

      const lookup = Helper.getLookup(formContext, this.parentCustomer);
      if (!lookup || lookup.entityType !== 'account') {
        return;
      }

      const account = await QueryHelper.retrieve<{
        accountid: string;
        name: string;
        telephone1?: string;
      }>('account', lookup.id, {
        select: ['accountid', 'name', 'telephone1'],
      });

      const info = account.telephone1
        ? `Parent account: ${account.name} | Phone: ${account.telephone1}`
        : `Parent account: ${account.name}`;

      NotificationHelper.setForm(
        formContext,
        info,
        XrmEnum.FormNotificationLevel.Info,
        this.parentNotificationId,
      );
    } catch {
      NotificationHelper.clearForm(formContext, this.parentNotificationId);
    }
  }
}

(window as any).ContactForm = new ContactForm();

export {};
