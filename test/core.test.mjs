// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { inclusionCase, rankInclusionService } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "serviceStatus": "closed"
};
const casPrincipal = {
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
const casÀRevoir = {
  "id": "revue-1",
  "text": "Demande d’aide générale mêlant logement, budget et retour à l’emploi, sans priorité ni commune de résidence.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => inclusionCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await rankInclusionService(casLimite, provider)).decision, "out_of_scope");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "strong_match", probabilities: {
  "strong_match": 0.82,
  "possible_match": 0.06,
  "weak_match": 0.06,
  "out_of_scope": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await rankInclusionService(casPrincipal, provider);
  assert.equal(résultat.decision, "strong_match");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "possible_match", probabilities: {
  "strong_match": 0.16,
  "possible_match": 0.52,
  "weak_match": 0.16,
  "out_of_scope": 0.16
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await rankInclusionService(casÀRevoir, provider);
  assert.equal(résultat.decision, "possible_match");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
