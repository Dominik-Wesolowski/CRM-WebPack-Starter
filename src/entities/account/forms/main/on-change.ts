import { updateDescriptionWarning } from '../../services/accountService';

export function registerOnChange(formContext: Xrm.FormContext): void {
  formContext.getAttribute('description')?.addOnChange(onDescriptionChange);
}

function onDescriptionChange(executionContext: Xrm.Events.Attribute.ChangeEventContext): void {
  updateDescriptionWarning(executionContext.getFormContext());
}
