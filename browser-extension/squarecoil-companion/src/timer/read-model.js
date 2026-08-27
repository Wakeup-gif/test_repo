'use strict';

const {
  TIMER_STATES,
  deepClone,
  deepFreeze,
  isNonNegativeInteger,
  isTimestamp,
  timerKind,
  validateDocument
} = require('../data/model');
const { createQueryService, effectiveActiveEnd, localDateAt } = require('../data/ledger');

const DEFAULT_VERIFICATION_GRACE_MS = 90 * 1000;
const DEFAULT_HISTORY_LIMIT = 100;
const MAX_HISTORY_LIMIT = 500;

function operationalContextId(timer) {
  return timer.active?.contextId || timer.pending?.contextId || timer.localPause?.contextId || null;
}

function freshPositiveObservation(timer, contextId, atMs, verificationGraceMs) {
  const observation = timer.lastObservation;
  if (!observation || observation.contextId !== contextId) return false;
  if (!isTimestamp(observation.observedAtMs) || observation.observedAtMs > atMs) return false;
  if (atMs - observation.observedAtMs > verificationGraceMs) return false;
  return ['CONTEXT_DETECTED','CONTEXT_CHANGED','CONTEXT_VERIFIED','CONTEXT_METADATA_UPDATED'].includes(observation.type);
}

function readableDocument(source) {
  const document = deepClone(source);
  if (!document?.authorityView?.redacted) return document;
  if (document.authorityView.schemaVersion !== 1) throw new Error('timer-read-model-authority-view-unsupported');
  delete document.authorityView;
  document.commandReceipts = {};
  document.commandReceiptOrder = [];
  if (document.revision > 0) document.commitFence = { ownerRuntimeId:'redacted-authority-owner', coordinationEpoch:1, fencingToken:1 };
  if (document.timer?.active) {
    if (document.timer.active.accrualOwnershipBound !== true) throw new Error('timer-read-model-active-ownership-unproven');
    delete document.timer.active.accrualOwnershipBound;
    document.timer.active.accrualOwnerToken = 'redacted-authority-owner';
  }
  if (document.checkpoint?.ownershipEvidence) {
    const evidence=document.checkpoint.ownershipEvidence;
    const disposition=String(evidence.disposition||'').toUpperCase();
    if(['OWNER','OBSERVER_CONNECTED'].includes(disposition)) {
      if(evidence.ownershipBound!==true) throw new Error('timer-read-model-checkpoint-ownership-unproven');
      document.checkpoint.ownershipEvidence={ownerRuntimeId:'redacted-authority-owner',coordinationEpoch:1,fencingToken:'redacted-authority-fence',disposition};
    } else document.checkpoint.ownershipEvidence={ownerRuntimeId:null,coordinationEpoch:null,fencingToken:null,disposition};
  }
  return document;
}

function contextLabel(context) {
  return String(context?.currentLabel || context?.label || context?.shortLabel || context?.projectId || 'Unknown Context');
}

function contextStatus(document, contextId) {
  if (document.timer.active?.contextId===contextId) {
    if (document.timer.active.safetyHold) return 'VERIFICATION_HOLD';
    if (document.timer.active.provisionalSinceMs) return 'RUNNING_PROVISIONAL';
    return 'RUNNING';
  }
  if (document.timer.pending?.contextId===contextId) return 'AWAITING_CHOICE';
  if (document.timer.localPause?.contextId===contextId) return 'LOCALLY_PAUSED';
  return 'NOT_RUNNING';
}

function lastRecordedActivity(document, contextId) {
  let latest=0;
  for(const segment of document.ledger) if(segment.contextId===contextId) latest=Math.max(latest,segment.endAtMs);
  if(document.timer.active?.contextId===contextId) latest=Math.max(latest,document.timer.active.lastVerifiedAtMs,document.timer.active.startedAtMs);
  if(document.timer.pending?.contextId===contextId) latest=Math.max(latest,document.timer.pending.lastContinuityVerifiedAtMs);
  if(document.timer.localPause?.contextId===contextId) latest=Math.max(latest,document.timer.localPause.pausedAtMs);
  return latest||null;
}

function resolveHistoryLimit(value) {
  if(value===undefined) return DEFAULT_HISTORY_LIMIT;
  if(!Number.isSafeInteger(value)||value<1||value>MAX_HISTORY_LIMIT) throw new Error('timer-read-model-history-limit-invalid');
  return value;
}

function createTimerReadModel(getDocument, options={}) {
  if(typeof getDocument!=='function') throw new Error('timer-read-model-source-required');
  const now=options.now||(()=>Date.now());
  const verificationGraceMs=options.verificationGraceMs??DEFAULT_VERIFICATION_GRACE_MS;
  if(!isNonNegativeInteger(verificationGraceMs)) throw new Error('timer-read-model-verification-grace-invalid');

  function snapshot(view={}) {
    const source=getDocument();
    if(!source) throw new Error('data-document-unavailable');
    const document=readableDocument(source);
    validateDocument(document);
    const atMs=view.atMs===undefined?now():view.atMs;
    if(!isTimestamp(atMs)) throw new Error('timer-read-model-at-invalid');
    const historyLimit=resolveHistoryLimit(view.historyLimit);
    const queries=createQueryService(()=>document,{now:()=>atMs});
    const state=timerKind(document.timer);
    const currentContextId=operationalContextId(document.timer);
    const requestedSelection=view.selectedContextId||currentContextId;
    const selectedContextId=requestedSelection&&document.contexts[requestedSelection]?requestedSelection:null;
    const active=document.timer.active;
    const held=Boolean(active?.safetyHold);
    const provisional=Boolean(active?.provisionalSinceMs)&&!held;
    const effectiveEndAtMs=active?effectiveActiveEnd(active,atMs):null;
    const positiveCurrent=currentContextId?freshPositiveObservation(document.timer,currentContextId,atMs,verificationGraceMs):false;
    const pendingReady=state===TIMER_STATES.PENDING&&document.timer.pending.continuityState==='VALID'&&positiveCurrent;
    const localResumeReady=state===TIMER_STATES.LOCAL_PAUSED&&positiveCurrent;

    const contextRows=Object.values(document.contexts).map(context=>{
      const contextId=context.contextId;
      const recordedAtMs=lastRecordedActivity(document,contextId);
      const lastSeenAtMs=isTimestamp(context.lastSeenAtMs)?context.lastSeenAtMs:null;
      return { contextId,kind:context.kind,projectId:context.kind==='job'?String(context.projectId):null,label:contextLabel(context),shortLabel:String(context.shortLabel||context.projectId||'General'),workspaceMembership:context.workspaceMembership||null,archivedAtMs:context.archivedAtMs??null,lastSeenAtMs,lastRecordedActivityAtMs:recordedAtMs,lastActivityAtMs:Math.max(lastSeenAtMs||0,recordedAtMs||0)||null,todayMs:queries.getContextToday(contextId,atMs),totalMs:queries.getContextTotal(contextId,atMs),legacyUnattributedMs:Math.max(0,Number(context.legacyUnattributedMs)||0),status:contextStatus(document,contextId),isOperational:contextId===currentContextId,isSelected:contextId===selectedContextId };
    }).sort((left,right)=>left.isOperational!==right.isOperational?(left.isOperational?-1:1):(right.lastActivityAtMs||0)-(left.lastActivityAtMs||0)||left.label.localeCompare(right.label));

    const todayDate=localDateAt(atMs,document.workdayZone);
    const todayByContext=queries.getDayByContext(todayDate,atMs).map(row=>{const context=document.contexts[row.contextId]||null;return{contextId:row.contextId,label:contextLabel(context),shortLabel:String(context?.shortLabel||context?.projectId||'General'),durationMs:row.durationMs};}).sort((left,right)=>right.durationMs-left.durationMs||left.label.localeCompare(right.label));
    const historyRows=document.ledger.slice().sort((left,right)=>right.endAtMs-left.endAtMs||right.startAtMs-left.startAtMs||right.segmentId.localeCompare(left.segmentId)).slice(0,historyLimit).map(segment=>{const context=document.contexts[segment.contextId]||null;return{segmentId:segment.segmentId,sessionId:segment.sessionId,cycleId:segment.cycleId,contextId:segment.contextId,label:contextLabel(context),shortLabel:String(context?.shortLabel||context?.projectId||'General'),startAtMs:segment.startAtMs,endAtMs:segment.endAtMs,durationMs:segment.durationMs,localDate:segment.localDate,certainty:segment.certainty||null,startCause:segment.startCause||null,endReason:segment.endReason||null};});

    return deepFreeze({
      revision:document.revision,updatedAtMs:document.updatedAtMs,workdayZone:document.workdayZone,queryAtMs:atMs,timerState:state,operationalStatus:currentContextId?contextStatus(document,currentContextId):'NOT_RUNNING',reason:document.timer.lastReason||null,currentContextId,currentContext:currentContextId?deepClone(document.contexts[currentContextId]):null,selectedContextId,selectedContext:selectedContextId?deepClone(document.contexts[selectedContextId]):null,todayTotalMs:queries.getTodayTotal(atMs),weekTotalMs:queries.getWeekTotal(atMs),currentContextTodayMs:currentContextId?queries.getContextToday(currentContextId,atMs):0,currentContextTotalMs:currentContextId?queries.getContextTotal(currentContextId,atMs):0,selectedContextTodayMs:selectedContextId?queries.getContextToday(selectedContextId,atMs):0,selectedContextTotalMs:selectedContextId?queries.getContextTotal(selectedContextId,atMs):0,contextRows,todayByContext,historyRows,
      running:active?{sessionId:active.sessionId,cycleId:active.cycleId,startedAtMs:active.startedAtMs,effectiveEndAtMs,elapsedMs:Math.max(0,effectiveEndAtMs-active.startedAtMs),lastVerifiedAtMs:active.lastVerifiedAtMs,provisional,held,holdAtMs:active.safetyHold?.holdAtMs??null,holdReason:active.safetyHold?.reason??null}:null,
      pending:document.timer.pending?{contextId:document.timer.pending.contextId,safeStartAnchorMs:document.timer.pending.safeStartAnchorMs,lastContinuityVerifiedAtMs:document.timer.pending.lastContinuityVerifiedAtMs,continuityState:document.timer.pending.continuityState}:null,
      localPause:document.timer.localPause?{contextId:document.timer.localPause.contextId,cycleId:document.timer.localPause.cycleId,pausedAtMs:document.timer.localPause.pausedAtMs}:null,
      availableActions:{localPause:state===TIMER_STATES.ACTIVE,resume:pendingReady,startFresh:pendingReady,localResume:localResumeReady},
      commandPreconditions:{expectedRevision:document.revision,expectedContextId:currentContextId,expectedSessionId:active?.sessionId||null}
    });
  }
  return {snapshot};
}

module.exports={DEFAULT_VERIFICATION_GRACE_MS,DEFAULT_HISTORY_LIMIT,MAX_HISTORY_LIMIT,operationalContextId,freshPositiveObservation,readableDocument,contextLabel,contextStatus,createTimerReadModel};
