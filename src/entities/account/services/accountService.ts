export function updateDescriptionWarning(formContext: Xrm.FormContext): void {
  const description = formContext.getAttribute<Xrm.Attributes.StringAttribute>('description')?.getValue();
  const notificationId = 'crm_account_description_warning';

  if (description && description.length > 250) {
    formContext.ui.setFormNotification('Description is longer than 250 characters.', 'WARNING', notificationId);
  } else {
    formContext.ui.clearFormNotification(notificationId);
  }
}
