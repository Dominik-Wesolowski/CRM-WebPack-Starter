export class BpfHelper {
  public static getActiveProcess(formContext: Xrm.FormContext): Xrm.ProcessFlow.Process | null {
    return formContext.data.process.getActiveProcess();
  }

  public static getActiveStage(formContext: Xrm.FormContext): Xrm.ProcessFlow.Stage | null {
    return formContext.data.process.getActiveStage();
  }

  public static getActiveStageId(formContext: Xrm.FormContext): string | null {
    const stage = this.getActiveStage(formContext);
    return stage ? stage.getId() : null;
  }

  public static getActiveStageName(formContext: Xrm.FormContext): string | null {
    const stage = this.getActiveStage(formContext);
    return stage ? stage.getName() : null;
  }

  public static setActiveStage(formContext: Xrm.FormContext, stageId: string): Promise<string> {
    return new Promise((resolve) => {
      formContext.data.process.setActiveStage(stageId, (result) => resolve(result));
    });
  }

  public static moveNext(formContext: Xrm.FormContext): Promise<string> {
    return new Promise((resolve) => {
      formContext.data.process.moveNext((result) => resolve(result));
    });
  }

  public static movePrevious(formContext: Xrm.FormContext): Promise<string> {
    return new Promise((resolve) => {
      formContext.data.process.movePrevious((result) => resolve(result));
    });
  }

  public static addOnStageChange(
    formContext: Xrm.FormContext,
    handler: Xrm.Events.ContextSensitiveHandler
  ): void {
    formContext.data.process.addOnStageChange(handler);
  }

  public static removeOnStageChange(
    formContext: Xrm.FormContext,
    handler: Xrm.Events.ContextSensitiveHandler
  ): void {
    formContext.data.process.removeOnStageChange(handler);
  }

  public static addOnPreStageChange(
    formContext: Xrm.FormContext,
    handler: Xrm.Events.ContextSensitiveHandler
  ): void {
    formContext.data.process.addOnPreStageChange(handler);
  }

  public static removeOnPreStageChange(
    formContext: Xrm.FormContext,
    handler: Xrm.Events.ContextSensitiveHandler
  ): void {
    formContext.data.process.removeOnPreStageChange(handler);
  }
}
