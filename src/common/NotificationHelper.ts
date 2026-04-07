export class NotificationHelper {
  public static setForm(
    formContext: Xrm.FormContext,
    message: string,
    level: XrmEnum.FormNotificationLevel,
    uniqueId: string
  ): boolean {
    return formContext.ui.setFormNotification(message, level, uniqueId);
  }

  public static clearForm(
    formContext: Xrm.FormContext,
    uniqueId: string
  ): boolean {
    return formContext.ui.clearFormNotification(uniqueId);
  }

  public static setControl(
    formContext: Xrm.FormContext,
    logicalName: string,
    message: string,
    uniqueId: string
  ): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.StandardControl | null;
    if (!control) {
      return false;
    }

    return control.setNotification(message, uniqueId);
  }

  public static clearControl(
    formContext: Xrm.FormContext,
    logicalName: string,
    uniqueId: string
  ): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.StandardControl | null;
    if (!control) {
      return false;
    }

    return control.clearNotification(uniqueId);
  }
}
