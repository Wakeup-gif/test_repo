'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {formatDuration,safeProjectId,deriveVisibleTabs}=require('../../src/ui/workspace-ui');

test('UT-B2-PROTOUI-001 duration formatting stays stable for live and compact surfaces',()=>{assert.equal(formatDuration(3_661_000),'01:01:01');assert.equal(formatDuration(3_661_000,{compact:true}),'1h 01m');assert.equal(formatDuration(-1),'00:00:00');});
test('UT-B2-PROTOUI-002 job navigation accepts only positive integer SquareCoil IDs',()=>{assert.equal(safeProjectId('260701'),'260701');assert.equal(safeProjectId(' 42 '),'42');assert.equal(safeProjectId('0'),null);assert.equal(safeProjectId('260701x'),null);assert.equal(safeProjectId('../260701'),null);});
test('UT-B2-PROTOUI-003 visible tabs keep operational and selected contexts protected inside the five-job cap',()=>{const rows=Array.from({length:8},(_,index)=>({contextId:`job:${index+1}`,label:`Job ${index+1}`,lastActivityAtMs:100-index}));const visible=deriveVisibleTabs(rows,{hiddenContextIds:['job:8','job:7'],selectedContextId:'job:8',operationalContextId:'job:7'});assert.equal(visible.length,5);assert.equal(visible.some(row=>row.contextId==='job:8'),true);assert.equal(visible.some(row=>row.contextId==='job:7'),true);});
