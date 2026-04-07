import { Helper } from '../../common/Helper';
import { NotificationHelper } from '../../common/NotificationHelper';
import { QueryHelper } from '../../common/QueryHelper';

interface AccountSummary {
  accountid: string;
  name: string;
  telephone1?: string;
}

namespace sha.contact.form {
  const firstName = 'firstname';
  const lastName = 'lastname';
  const fullName = 'fullname';
  const parentCustomer = 'parentcustomerid';
  const mobilePhone = 'mobilephone';

  const nameNotificationId = 'sha_contact_name_warning';
  const mobileNotificationId = 'sha_contact_mobile_warning';
  const parentNotificationId = 'sha_contact_parent_info';

  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);

    syncFullName(formContext);
    validateMobile(formContext);
    void loadParentCustomerInfo(formContext);
  }

  export function onFirstNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    syncFullName(formContext);
  }

  export function onLastNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    syncFullName(formContext);
  }

  export function onParentCustomerChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    void loadParentCustomerInfo(formContext);
  }

  export function onMobilePhoneChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    validateMobile(formContext);
  }

  function syncFullName(formContext: Xrm.FormContext): void {
    const first = Helper.getText(formContext, firstName) ?? '';
    const last = Helper.getText(formContext, lastName) ?? '';
    const value = `${first} ${last}`.trim();

    Helper.setText(formContext, fullName, value || null);

    if (!value) {
      NotificationHelper.setForm(
        formContext,
        'First name or last name is empty.',
        XrmEnum.FormNotificationLevel.Warning,
        nameNotificationId,
      );
      return;
    }

    NotificationHelper.clearForm(formContext, nameNotificationId);
  }

  function validateMobile(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, mobilePhone);

    NotificationHelper.clearControl(formContext, mobilePhone, mobileNotificationId);

    if (!value) {
      return;
    }

    if (value.replace(/\s+/g, '').length < 7) {
      NotificationHelper.setControl(
        formContext,
        mobilePhone,
        'Mobile phone looks too short.',
        mobileNotificationId,
      );
    }
  }

  async function loadParentCustomerInfo(formContext: Xrm.FormContext): Promise<void> {
    NotificationHelper.clearForm(formContext, parentNotificationId);

    const lookup = Helper.getLookup(formContext, parentCustomer);
    if (!lookup || lookup.entityType !== 'account') {
      return;
    }

    const account = await QueryHelper.retrieve<AccountSummary>('account', lookup.id, {
      select: ['accountid', 'name', 'telephone1'],
    });

    const info = account.telephone1
      ? `Parent account: ${account.name} | Phone: ${account.telephone1}`
      : `Parent account: ${account.name}`;

    NotificationHelper.setForm(
      formContext,
      info,
      XrmEnum.FormNotificationLevel.Info,
      parentNotificationId,
    );
  }
}
