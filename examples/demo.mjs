// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { rankInclusionService } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "exemple-1",
  "text": "Personne en recherche d’emploi, sans véhicule, ayant besoin d’une solution de mobilité pour accepter des horaires décalés.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "strong_match", probabilities: {
  "strong_match": 0.82,
  "possible_match": 0.06,
  "weak_match": 0.06,
  "out_of_scope": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 120, output_tokens: 0 } }));
const résultat = await rankInclusionService(dossier, provider);
assert.equal(résultat.decision, "strong_match");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
