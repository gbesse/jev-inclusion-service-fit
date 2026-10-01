// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { rankInclusionService } from "../src/index.mjs";
const client = createJevClient();
const résultat = await rankInclusionService({
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
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
