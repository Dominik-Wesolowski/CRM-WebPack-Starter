type StageResult = 'success' | 'invalid' | 'dirtyForm' | 'preventDefault';
export type SetActiveStageResult = StageResult | 'unreachable';
export type MoveNextResult = StageResult | 'crossEntity' | 'stageGate' | 'end';
export type MovePreviousResult = StageResult | 'crossEntity' | 'stageGate' | 'beginning';

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

  public static setActiveStage(formContext: Xrm.FormContext, stageId: string): Promise<SetActiveStageResult> {
    return new Promise((resolve) => {
      formContext.data.process.setActiveStage(stageId, (result) => resolve(result as SetActiveStageResult));
    });
  }

  public static moveNext(formContext: Xrm.FormContext): Promise<MoveNextResult> {
    return new Promise((resolve) => {
      formContext.data.process.moveNext((result) => resolve(result as MoveNextResult));
    });
  }

  public static movePrevious(formContext: Xrm.FormContext): Promise<MovePreviousResult> {
    return new Promise((resolve) => {
      formContext.data.process.movePrevious((result) => resolve(result as MovePreviousResult));
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
