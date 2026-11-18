export class SubgridHelper {
  public static getControl(
    formContext: Xrm.FormContext,
    subgridName: string,
  ): Xrm.Controls.GridControl | null {
    const control = formContext.getControl<Xrm.Controls.GridControl>(subgridName);
    return typeof control?.getGrid === 'function' ? control : null;
  }

  public static refresh(formContext: Xrm.FormContext, subgridName: string): boolean {
    const control = this.getControl(formContext, subgridName);
    if (!control) {
      return false;
    }

    control.refresh();
    return true;
  }

  public static getTotalRecordCount(formContext: Xrm.FormContext, subgridName: string): number | null {
    const control = this.getControl(formContext, subgridName);
    const grid = control?.getGrid();

    if (!grid) {
      return null;
    }

    return grid.getTotalRecordCount();
  }

  /** @deprecated Use getTotalRecordCount to clarify that this includes all pages. */
  public static getRowCount(formContext: Xrm.FormContext, subgridName: string): number | null {
    return this.getTotalRecordCount(formContext, subgridName);
  }

  public static hasRows(formContext: Xrm.FormContext, subgridName: string): boolean | null {
    const rowCount = this.getTotalRecordCount(formContext, subgridName);
    return rowCount === null ? null : rowCount > 0;
  }

  public static addOnLoad(
    formContext: Xrm.FormContext,
    subgridName: string,
    handler: Xrm.Events.GridControl.LoadEventHandler,
  ): boolean {
    const control = this.getControl(formContext, subgridName);
    if (typeof control?.addOnLoad !== 'function') {
      return false;
    }

    control.addOnLoad(handler);
    return true;
  }

  public static removeOnLoad(
    formContext: Xrm.FormContext,
    subgridName: string,
    handler: Xrm.Events.GridControl.LoadEventHandler,
  ): boolean {
    const control = this.getControl(formContext, subgridName);
    if (typeof control?.removeOnLoad !== 'function') {
      return false;
    }

    // Dataverse expects the original handler reference. The declarations omit its context here.
    control.removeOnLoad(handler as () => void);
    return true;
  }

  public static setVisible(
    formContext: Xrm.FormContext,
    subgridName: string,
    visible: boolean,
  ): boolean {
    const control = this.getControl(formContext, subgridName);
    if (!control) {
      return false;
    }

    control.setVisible(visible);
    return true;
  }
}
