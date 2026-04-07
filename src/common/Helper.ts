export interface LookupValue {
  id: string;
  name?: string;
  entityType: string;
}

export interface OptionSetOption<T extends number = number> {
  text: string;
  value: T;
}

export class Helper {
  public static getFormContext(executionContext: Xrm.Events.EventContext): Xrm.FormContext {
    return executionContext.getFormContext();
  }

  public static getAttribute(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Xrm.Attributes.Attribute | null {
    return formContext.getAttribute(logicalName);
  }

  public static getControl<T extends Xrm.Controls.Control = Xrm.Controls.Control>(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): T | null {
    return formContext.getControl(logicalName) as T | null;
  }

  public static getStandardControl(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Xrm.Controls.StandardControl | null {
    return formContext.getControl(logicalName) as Xrm.Controls.StandardControl | null;
  }

  public static requireAttribute(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Xrm.Attributes.Attribute {
    const attribute = this.getAttribute(formContext, logicalName);

    if (!attribute) {
      throw new Error(`Attribute '${logicalName}' was not found on the form.`);
    }

    return attribute;
  }

  public static requireControl<T extends Xrm.Controls.Control = Xrm.Controls.Control>(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): T {
    const control = this.getControl<T>(formContext, logicalName);

    if (!control) {
      throw new Error(`Control '${logicalName}' was not found on the form.`);
    }

    return control;
  }

  public static hasAttribute(formContext: Xrm.FormContext, logicalName: string): boolean {
    return this.getAttribute(formContext, logicalName) !== null;
  }

  public static hasControl(formContext: Xrm.FormContext, logicalName: string): boolean {
    return this.getControl(formContext, logicalName) !== null;
  }

  public static getValue<T>(formContext: Xrm.FormContext, logicalName: string): T | null {
    const attr = this.getAttribute(formContext, logicalName);
    return attr ? (attr.getValue() as T | null) : null;
  }

  public static setValue<T>(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: T | null,
    fireOnChange = false,
  ): boolean {
    const attribute = this.getAttribute(formContext, logicalName);

    if (!attribute) {
      return false;
    }

    const currentValue = attribute.getValue() as T | null;
    if (this.areEqual(currentValue, value)) {
      return false;
    }

    attribute.setValue(value as any);

    if (fireOnChange) {
      attribute.fireOnChange();
    }

    return true;
  }

  public static clearValue(
    formContext: Xrm.FormContext,
    logicalName: string,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, null, fireOnChange);
  }

  public static isDirty(formContext: Xrm.FormContext, logicalName: string): boolean {
    const attribute = this.getAttribute(formContext, logicalName);
    return attribute ? attribute.getIsDirty() : false;
  }

  public static isDirtyAny(formContext: Xrm.FormContext, logicalNames: string[]): boolean {
    return logicalNames.some((logicalName) => this.isDirty(formContext, logicalName));
  }

  public static getRequiredLevel(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Xrm.Attributes.RequirementLevel | null {
    const attribute = this.getAttribute(formContext, logicalName);
    return attribute ? attribute.getRequiredLevel() : null;
  }

  public static setRequiredLevel(
    formContext: Xrm.FormContext,
    logicalName: string,
    level: Xrm.Attributes.RequirementLevel,
  ): boolean {
    const attribute = this.getAttribute(formContext, logicalName);

    if (!attribute) {
      return false;
    }

    if (attribute.getRequiredLevel() === level) {
      return false;
    }

    attribute.setRequiredLevel(level);
    return true;
  }

  public static setSubmitMode(
    formContext: Xrm.FormContext,
    logicalName: string,
    mode: Xrm.SubmitMode,
  ): boolean {
    const attribute = this.getAttribute(formContext, logicalName);

    if (!attribute) {
      return false;
    }

    attribute.setSubmitMode(mode);
    return true;
  }

  public static getText(formContext: Xrm.FormContext, logicalName: string): string | null {
    return this.getValue<string>(formContext, logicalName);
  }

  public static setText(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: string | null,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, value, fireOnChange);
  }

  public static getNumber(formContext: Xrm.FormContext, logicalName: string): number | null {
    return this.getValue<number>(formContext, logicalName);
  }

  public static setNumber(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: number | null,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, value, fireOnChange);
  }

  public static getBoolean(formContext: Xrm.FormContext, logicalName: string): boolean | null {
    return this.getValue<boolean>(formContext, logicalName);
  }

  public static setBoolean(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: boolean | null,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, value, fireOnChange);
  }

  public static getDate(formContext: Xrm.FormContext, logicalName: string): Date | null {
    return this.getValue<Date>(formContext, logicalName);
  }

  public static setDate(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: Date | null,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, value, fireOnChange);
  }

  public static getLookup(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): { id: string; name?: string; entityType: string } | null {
    const values = this.getValue<Xrm.LookupValue[]>(formContext, logicalName);

    if (!values || values.length === 0) {
      return null;
    }

    const value = values[0];

    return {
      id: this.normalizeGuid(value.id),
      name: value.name,
      entityType: value.entityType,
    };
  }

  public static getLookups(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Array<{ id: string; name?: string; entityType: string }> {
    const values = this.getValue<Xrm.LookupValue[]>(formContext, logicalName);

    if (!values || values.length === 0) {
      return [];
    }

    return values.map((x) => ({
      id: this.normalizeGuid(x.id),
      name: x.name,
      entityType: x.entityType,
    }));
  }

  public static getLookupId(formContext: Xrm.FormContext, logicalName: string): string | null {
    return this.getLookup(formContext, logicalName)?.id ?? null;
  }

  public static getLookupName(formContext: Xrm.FormContext, logicalName: string): string | null {
    return this.getLookup(formContext, logicalName)?.name ?? null;
  }

  public static getLookupEntityType(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): string | null {
    return this.getLookup(formContext, logicalName)?.entityType ?? null;
  }

  public static setLookup(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: { id: string; name?: string; entityType: string } | null,
    fireOnChange = false,
  ): boolean {
    const lookupValue = value
      ? [
          {
            id: this.ensureBracedGuid(value.id),
            name: value.name ?? '',
            entityType: value.entityType,
          },
        ]
      : null;

    return this.setValue(formContext, logicalName, lookupValue, fireOnChange);
  }

  public static clearLookup(
    formContext: Xrm.FormContext,
    logicalName: string,
    fireOnChange = false,
  ): boolean {
    return this.setLookup(formContext, logicalName, null, fireOnChange);
  }

  public static getOptionSetValue<T extends number = number>(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): T | null {
    return this.getValue<T>(formContext, logicalName);
  }

  public static setOptionSetValue<T extends number = number>(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: T | null,
    fireOnChange = false,
  ): boolean {
    return this.setValue(formContext, logicalName, value, fireOnChange);
  }

  public static getOptionSetText(formContext: Xrm.FormContext, logicalName: string): string | null {
    const attribute = formContext.getAttribute(
      logicalName,
    ) as Xrm.Attributes.OptionSetAttribute | null;

    if (!attribute) {
      return null;
    }

    return attribute.getText();
  }

  public static getOptions(
    formContext: Xrm.FormContext,
    logicalName: string,
  ): Array<{ text: string; value: number }> {
    const attribute = formContext.getAttribute(
      logicalName,
    ) as Xrm.Attributes.OptionSetAttribute | null;

    if (!attribute) {
      return [];
    }

    return attribute.getOptions().map((option) => ({
      text: option.text,
      value: option.value,
    }));
  }

  public static clearOptions(formContext: Xrm.FormContext, logicalName: string): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.OptionSetControl | null;

    if (!control) {
      return false;
    }

    control.clearOptions();
    return true;
  }

  public static addOption(
    formContext: Xrm.FormContext,
    logicalName: string,
    option: { text: string; value: number },
    index?: number,
  ): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.OptionSetControl | null;

    if (!control) {
      return false;
    }

    if (typeof index === 'number') {
      control.addOption(option, index);
    } else {
      control.addOption(option);
    }

    return true;
  }

  public static removeOption(
    formContext: Xrm.FormContext,
    logicalName: string,
    value: number,
  ): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.OptionSetControl | null;

    if (!control) {
      return false;
    }

    control.removeOption(value);
    return true;
  }

  public static removeOptionsExceptSelected(
    formContext: Xrm.FormContext,
    logicalName: string,
    allowedValues: number[],
  ): boolean {
    const control = formContext.getControl(logicalName) as Xrm.Controls.OptionSetControl | null;
    const attribute = formContext.getAttribute(
      logicalName,
    ) as Xrm.Attributes.OptionSetAttribute | null;

    if (!control || !attribute) {
      return false;
    }

    const selectedValue = attribute.getValue();
    const allowed = new Set<number>(allowedValues);

    if (selectedValue !== null) {
      allowed.add(selectedValue);
    }

    for (const option of attribute.getOptions()) {
      if (!allowed.has(option.value)) {
        control.removeOption(option.value);
      }
    }

    return true;
  }

  public static setVisible(
    formContext: Xrm.FormContext,
    logicalName: string,
    visible: boolean,
  ): boolean {
    const control = this.getStandardControl(formContext, logicalName);

    if (!control) {
      return false;
    }

    control.setVisible(visible);
    return true;
  }

  public static setMultipleVisible(
    formContext: Xrm.FormContext,
    logicalNames: string[],
    visible: boolean,
  ): void {
    for (const logicalName of logicalNames) {
      this.setVisible(formContext, logicalName, visible);
    }
  }

  public static setDisabled(
    formContext: Xrm.FormContext,
    logicalName: string,
    disabled: boolean,
  ): boolean {
    const control = this.getStandardControl(formContext, logicalName);

    if (!control) {
      return false;
    }

    control.setDisabled(disabled);
    return true;
  }

  public static setMultipleDisabled(
    formContext: Xrm.FormContext,
    logicalNames: string[],
    disabled: boolean,
  ): void {
    for (const logicalName of logicalNames) {
      this.setDisabled(formContext, logicalName, disabled);
    }
  }

  public static setFocus(formContext: Xrm.FormContext, logicalName: string): boolean {
    const control = this.getStandardControl(formContext, logicalName);

    if (!control) {
      return false;
    }

    control.setFocus();
    return true;
  }

  public static setLabel(
    formContext: Xrm.FormContext,
    logicalName: string,
    label: string,
  ): boolean {
    const control = this.getStandardControl(formContext, logicalName);

    if (!control) {
      return false;
    }

    control.setLabel(label);
    return true;
  }

  public static showTab(formContext: Xrm.FormContext, tabName: string, visible: boolean): boolean {
    const tab = formContext.ui.tabs.get(tabName);

    if (!tab) {
      return false;
    }

    tab.setVisible(visible);
    return true;
  }

  public static setTabDisplayState(
    formContext: Xrm.FormContext,
    tabName: string,
    state: 'expanded' | 'collapsed',
  ): boolean {
    const tab = formContext.ui.tabs.get(tabName);

    if (!tab) {
      return false;
    }

    tab.setDisplayState(state);
    return true;
  }

  public static showSection(
    formContext: Xrm.FormContext,
    tabName: string,
    sectionName: string,
    visible: boolean,
  ): boolean {
    const tab = formContext.ui.tabs.get(tabName);
    const section = tab?.sections.get(sectionName);

    if (!section) {
      return false;
    }

    section.setVisible(visible);
    return true;
  }

  public static setSectionLabel(
    formContext: Xrm.FormContext,
    tabName: string,
    sectionName: string,
    label: string,
  ): boolean {
    const tab = formContext.ui.tabs.get(tabName);
    const section = tab?.sections.get(sectionName);

    if (!section) {
      return false;
    }

    section.setLabel(label);
    return true;
  }

  public static getId(formContext: Xrm.FormContext): string | null {
    const id = formContext.data.entity.getId();
    return id ? this.normalizeGuid(id) : null;
  }

  public static getEntityName(formContext: Xrm.FormContext): string {
    return formContext.data.entity.getEntityName();
  }

  public static getFormId(formContext: Xrm.FormContext): string | undefined {
    return formContext.ui.formSelector.getCurrentItem()?.getId();
  }

  public static getFormType(formContext: Xrm.FormContext): XrmEnum.FormType {
    return formContext.ui.getFormType();
  }

  public static isCreate(formContext: Xrm.FormContext): boolean {
    return this.getFormType(formContext) === XrmEnum.FormType.Create;
  }

  public static isUpdate(formContext: Xrm.FormContext): boolean {
    return this.getFormType(formContext) === XrmEnum.FormType.Update;
  }

  public static isReadOnly(formContext: Xrm.FormContext): boolean {
    return this.getFormType(formContext) === XrmEnum.FormType.ReadOnly;
  }

  public static async save(
    formContext: Xrm.FormContext,
    saveMode?: Xrm.EntitySaveMode,
  ): Promise<void> {
    if (typeof saveMode === 'number') {
      await formContext.data.save({ saveMode });
      return;
    }

    await formContext.data.save();
  }

  public static async refresh(formContext: Xrm.FormContext, save: boolean): Promise<void> {
    await formContext.data.refresh(save);
  }

  public static normalizeGuid(value: string): string {
    return value.replace(/[{}]/g, '').toLowerCase();
  }

  public static ensureBracedGuid(value: string): string {
    return `{${this.normalizeGuid(value)}}`;
  }

  private static areEqual<T>(left: T | null, right: T | null): boolean {
    if (left === right) {
      return true;
    }

    if (left instanceof Date && right instanceof Date) {
      return left.getTime() === right.getTime();
    }

    return false;
  }
}
