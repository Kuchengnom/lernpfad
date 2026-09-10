import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../fixtures/french-smoke/curriculum.json' with {type:'json'};
import {parseImport, backupPackage} from '../app/validation.js';
import {newLearner, generateSession, evaluateAnswer, recordAnswer, completeSession} from '../app/engine.js';

test('French five-type curriculum validates and completed progress survives backup import',()=>{
  const {curriculum}=parseImport(JSON.stringify(fixture));
  let learner=newLearner(curriculum);
  const session=generateSession(curriculum,learner,{seed:'fr-test'});
  assert.equal(new Set(session.exercises.map(e=>e.type)).size,5);
  for(const e of session.exercises){
    const answer=e.correctChoiceIds?.[0]??e.acceptedAnswers?.[0]??e.correctOrder??{text:"Je m'appelle Camille.",selfChecked:true};
    const result=evaluateAnswer(e,answer);
    assert.equal(result.correct,e.type==='writing'?null:true);
    learner=recordAnswer(learner,e,{...result,sessionId:session.id,answerId:`${session.id}:${e.id}`,curriculumId:curriculum.id,curriculumVersion:curriculum.version});
  }
  learner=completeSession(learner,session);
  assert.deepEqual(parseImport(JSON.stringify(backupPackage(curriculum,learner))).learner,learner);
  const unsupported=structuredClone(fixture);unsupported.curriculum.targetLanguage='es';
  assert.throws(()=>parseImport(JSON.stringify(unsupported)));
});
test('French accents stay significant; canonical Unicode and authored apostrophe variants are accepted',()=>{
  const exercise=fixture.curriculum.exercises.find(e=>e.type==='text-input');
  for(const answer of ["l'été","l’été","  L'ÉTÉ  ","l'été".normalize('NFD')]) assert.equal(evaluateAnswer(exercise,answer).correct,true);
  for(const answer of ["l'ete",'été','summer']) assert.equal(evaluateAnswer(exercise,answer).correct,false);
});
