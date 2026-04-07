export class NavigationHelper {
  public static async openForm(
    entityName: string,
    entityId?: string,
    openInNewWindow = false,
  ): Promise<void> {
    const options: Xrm.Navigation.EntityFormOptions = {
      entityName,
      openInNewWindow,
    };

    if (entityId) {
      options.entityId = entityId.replace(/[{}]/g, '');
    }

    await Xrm.Navigation.openForm(options);
  }

  public static async openCreateForm(
    entityName: string,
    parameters?: Record<string, string>,
  ): Promise<void> {
    const options: Xrm.Navigation.EntityFormOptions = {
      entityName,
    };

    await Xrm.Navigation.openForm(options, parameters);
  }

  public static async openQuickCreate(
    entityName: string,
    parameters?: Record<string, string>,
  ): Promise<void> {
    const options: Xrm.Navigation.EntityFormOptions = {
      entityName,
      useQuickCreateForm: true,
    };

    await Xrm.Navigation.openForm(options, parameters);
  }

  public static async openRecord(entityName: string, entityId: string): Promise<void> {
    await this.openForm(entityName, entityId);
  }

  public static openWebResource(
    webResourceName: string,
    data?: string,
    width?: number,
    height?: number,
  ): void {
    const options = {} as Xrm.Navigation.OpenWebresourceOptions;

    if (typeof width === 'number') {
      options.width = width;
    }

    if (typeof height === 'number') {
      options.height = height;
    }

    Xrm.Navigation.openWebResource(webResourceName, options, data);
  }

  public static async navigateToCustomPage(
    name: string,
    entityName?: string,
    recordId?: string,
  ): Promise<void> {
    const pageInput: Xrm.Navigation.CustomPage = {
      pageType: 'custom',
      name,
    };

    if (entityName) {
      pageInput.entityName = entityName;
    }

    if (recordId) {
      pageInput.recordId = recordId.replace(/[{}]/g, '');
    }

    await Xrm.Navigation.navigateTo(pageInput);
  }

  public static async openAlert(text: string, title?: string): Promise<void> {
    await Xrm.Navigation.openAlertDialog({
      text,
      title,
    });
  }

  public static async openConfirm(text: string, title?: string): Promise<boolean> {
    const result = await Xrm.Navigation.openConfirmDialog({
      text,
      title,
    });

    return result.confirmed;
  }

  public static async openUrl(url: string): Promise<void> {
    await Xrm.Navigation.openUrl(url);
  }
}
