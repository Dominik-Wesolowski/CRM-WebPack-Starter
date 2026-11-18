export function onLoad(executionContext: Xrm.Events.EventContext): void {
  const formContext = executionContext.getFormContext();
  console.debug('Form loaded:', formContext.data.entity.getEntityName());
}
