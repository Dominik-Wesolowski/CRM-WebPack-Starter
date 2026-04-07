import { Helper } from '../../common/Helper';
import { NotificationHelper } from '../../common/NotificationHelper';
import { QueryHelper } from '../../common/QueryHelper';

interface ContactSummary {
  contactid: string;
  fullname: string;
  mobilephone?: string;
  emailaddress1?: string;
}

namespace sha.account.form {
  const accountName = 'name';
  const description = 'description';
  const telephone = 'telephone1';
  const primaryContact = 'primarycontactid';

  const descriptionNotificationId = 'sha_account_description_warning';
  const primaryContactNotificationId = 'sha_account_primary_contact_info';

  export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);

    enforceNameAsRequired(formContext);
    validateDescriptionLength(formContext);
    void loadPrimaryContactInfo(formContext);
  }

  export function onNameChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    enforceNameAsRequired(formContext);
  }

  export function onDescriptionChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    validateDescriptionLength(formContext);
  }

  export function onPrimaryContactChange(executionContext: Xrm.Events.EventContext): void {
    const formContext = Helper.getFormContext(executionContext);
    void loadPrimaryContactInfo(formContext);
  }

  function enforceNameAsRequired(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, accountName);
    Helper.setRequiredLevel(formContext, accountName, value ? 'required' : 'recommended');
  }

  function validateDescriptionLength(formContext: Xrm.FormContext): void {
    const value = Helper.getText(formContext, description);

    NotificationHelper.clearForm(formContext, descriptionNotificationId);

    if (!value) {
      return;
    }

    if (value.length > 250) {
      NotificationHelper.setForm(
        formContext,
        'Description is longer than 250 characters.',
        XrmEnum.FormNotificationLevel.Warning,
        descriptionNotificationId,
      );
    }
  }

  async function loadPrimaryContactInfo(formContext: Xrm.FormContext): Promise<void> {
    NotificationHelper.clearForm(formContext, primaryContactNotificationId);

    const lookup = Helper.getLookup(formContext, primaryContact);
    if (!lookup) {
      return;
    }

    const contact = await QueryHelper.retrieve<ContactSummary>('contact', lookup.id, {
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
      primaryContactNotificationId,
    );

    if (!Helper.getText(formContext, telephone) && contact.mobilephone) {
      Helper.setText(formContext, telephone, contact.mobilephone);
    }
  }
}
