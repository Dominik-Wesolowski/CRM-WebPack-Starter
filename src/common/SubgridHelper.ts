export class SubgridHelper {
  public static getControl(
    formContext: Xrm.FormContext,
    subgridName: string,
  ): Xrm.Controls.GridControl | null {
    return formContext.getControl(subgridName) as Xrm.Controls.GridControl | null;
  }

  public static refresh(formContext: Xrm.FormContext, subgridName: string): boolean {
    const control = this.getControl(formContext, subgridName);
    if (!control) {
      return false;
    }

    control.refresh();
    return true;
  }

  public static getRowCount(formContext: Xrm.FormContext, subgridName: string): number | null {
    const control = this.getControl(formContext, subgridName);
    const grid = control?.getGrid();

    if (!grid) {
      return null;
    }

    return grid.getTotalRecordCount();
  }

  public static hasRows(formContext: Xrm.FormContext, subgridName: string): boolean | null {
    const rowCount = this.getRowCount(formContext, subgridName);
    return rowCount === null ? null : rowCount > 0;
  }

  public static addOnLoad(
    formContext: Xrm.FormContext,
    subgridName: string,
    handler: Xrm.Events.ContextSensitiveHandler,
  ): boolean {
    const control = this.getControl(formContext, subgridName);
    if (!control) {
      return false;
    }

    control.addOnLoad(handler as unknown as () => void);
    return true;
  }

  public static removeOnLoad(
    formContext: Xrm.FormContext,
    subgridName: string,
    handler: Xrm.Events.ContextSensitiveHandler,
  ): boolean {
    const control = this.getControl(formContext, subgridName);
    if (!control) {
      return false;
    }

    control.removeOnLoad(handler as unknown as () => void);
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
