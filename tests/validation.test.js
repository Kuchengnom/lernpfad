import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../fixtures/unit-1a/curriculum.json' with {type:'json'};
import { validateCurriculum, validateLearner, parseImport, backupPackage } from '../app/validation.js';
import { pastedImportText, parsePastedImport } from '../app/import-text.js';
import { newLearner, generateSession, evaluateAnswer, recordAnswer, completeSession } from '../app/engine.js';
const course = fixture.curriculum;
const copy = value => structuredClone(value);
function completed() {
  let learner = newLearner(course);
  const session = generateSession(course, learner, {now:'2026-09-09T12:00:00.000Z'});
  for (const e of session.exercises) {
    const answer = e.correctChoiceIds?.[0] ?? e.acceptedAnswers?.[0] ?? e.correctOrder ?? {text:'We visited a quiet village.',selfChecked:true};
    const result = evaluateAnswer(e, answer);
    learner = recordAnswer(learner,e,{...result,answerId:`${session.id}:${e.id}`,sessionId:session.id,curriculumId:course.id,curriculumVersion:course.version},{now:'2026-09-09T12:01:00.000Z'});
  }
  return completeSession(learner,session);
}
test('source fixture validates, first session has diverse primitives, backup is lossless',()=>{
  assert.equal(validateCurriculum(fixture),course);
  const session=generateSession(course,newLearner(course),{now:'2026-09-09T12:00:00.000Z'});
  assert.ok(new Set(session.exercises.map(e=>e.type)).size>=3);
  const learner=completed();
  assert.deepEqual(parseImport(JSON.stringify(backupPackage(course,learner))),{curriculum:course,learner});
});
test('reject malformed, future, oversized and unknown-property packages',()=>{
  assert.throws(()=>parseImport('{broken'),/gültiges JSON/);
  assert.throws(()=>parseImport(JSON.stringify({...fixture,schemaVersion:'2.0'})),/schemaVersion/);
  assert.throws(()=>parseImport(' '.repeat(5*1024*1024+1)),/groß/);
  assert.throws(()=>parseImport(JSON.stringify({...fixture,script:'anything'})),/unbekannte/);
});
test('pasted imports accept raw JSON or one complete json fence only',()=>{
  const raw=JSON.stringify(fixture);
  assert.equal(pastedImportText(raw),raw);
  assert.equal(pastedImportText(`\n\`\`\`json\n${raw}\n\`\`\`\n`),raw);
  assert.deepEqual(parsePastedImport(`\`\`\`json\n${raw}\n\`\`\``),{curriculum:course,learner:null});
  assert.throws(()=>pastedImportText(`Here is the JSON:\n\`\`\`json\n${raw}\n\`\`\``),/reines JSON/);
  assert.throws(()=>pastedImportText(`\`\`\`\n${raw}\n\`\`\``),/vollständigen/);
});
test('reject ambiguous keys, dangling sources, cyclic prerequisites and repeated tiles',()=>{
  let f=copy(fixture);f.curriculum.exercises[0].correctChoiceIds=['opt.missing'];assert.throws(()=>validateCurriculum(f),/richtige Antwort/);
  f=copy(fixture);f.curriculum.concepts[0].provenance=['src.missing'];assert.throws(()=>validateCurriculum(f),/Quelle/);
  f=copy(fixture);f.curriculum.concepts[0].dependsOn=[f.curriculum.concepts[0].id];assert.throws(()=>validateCurriculum(f),/Kreis/);
  f=copy(fixture);const tiles=f.curriculum.exercises.find(e=>e.tiles);tiles.correctOrder[0]=tiles.correctOrder[1];assert.throws(()=>validateCurriculum(f),/Wortbaustein/);
});
test('reject inflated progress, duplicate records, missing completion answers, reward tampering and course mismatch',()=>{
  const valid=completed();
  let learner=copy(valid);Object.values(learner.conceptProgress)[0].mastery=1;assert.throws(()=>validateLearner(learner,course),/Themenfortschritt/);
  learner=copy(valid);learner.answerRecords.push(learner.answerRecords[0]);assert.throws(()=>validateLearner(learner,course),/doppelt/);
  learner=copy(valid);learner.completedSessions[0].exerciseIds.pop();assert.throws(()=>validateLearner(learner,course),/unbeantwortete/);
  learner=copy(valid);learner.xp+=1;assert.throws(()=>validateLearner(learner,course),/Punkte/);
  learner=copy(valid);learner.curriculumVersion='9.0';assert.throws(()=>validateLearner(learner,course),/anderen/);
});
test('self-check exposure does not become a permanent weakness that displaces unseen concepts',()=>{
  let learner=newLearner(course);
  const writing=course.exercises.find(e=>e.id==='u1a.ex.write-detail');
  learner=recordAnswer(learner,writing,{correct:null,selfCheck:true,sessionId:'test-writing',answerId:'test-writing:first',curriculumId:course.id,curriculumVersion:course.version},{now:'2026-09-09T12:00:00.000Z'});
  const next=generateSession(course,learner,{now:'2026-09-09T12:01:00.000Z'});
  assert.ok(!next.exercises.some(e=>e.id===writing.id),'seen writing should not outrank unseen learning');
  assert.equal(learner.conceptProgress[writing.conceptIds[0]].mastery,0);
});
test('published standalone backup schema accepts a real completed export',async()=>{
  const {default:Ajv}=await import('ajv');
  const {default:curriculumSchema}=await import('../specs/schema/curriculum.schema.json',{with:{type:'json'}});
  const {default:learnerSchema}=await import('../specs/schema/learner.schema.json',{with:{type:'json'}});
  const {default:backupSchema}=await import('../specs/schema/backup.schema.json',{with:{type:'json'}});
  const ajv=new Ajv({strict:false});ajv.addSchema(curriculumSchema,'curriculum.schema.json');ajv.addSchema(learnerSchema,'learner.schema.json');
  const validate=ajv.compile(backupSchema);assert.ok(validate(backupPackage(course,completed())),JSON.stringify(validate.errors));
});
