import { updateDescriptionWarning } from '../../services/accountService';
import { registerOnChange } from './on-change';

export function onLoad(executionContext: Xrm.Events.LoadEventContext): void {
  const formContext = executionContext.getFormContext();

  if (executionContext.getEventArgs().getDataLoadState() === XrmEnum.FormDataLoadState.InitialLoad) {
    registerOnChange(formContext);
  }

  updateDescriptionWarning(formContext);
}
