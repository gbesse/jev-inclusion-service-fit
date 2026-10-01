// Objectif : vérifier que les types publics sont importables.
import { inclusionCase, rankInclusionService } from "../src/index.mjs";
const dossier = inclusionCase({
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
});
void rankInclusionService(dossier, { decide: async () => ({}) });
