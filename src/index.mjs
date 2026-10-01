// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "strong_match": "adéquation_forte",
  "possible_match": "adéquation_possible",
  "weak_match": "adéquation_faible",
  "out_of_scope": "hors_périmètre"
});
const CRITERIA = Object.freeze({
  "strong_match": "adéquation forte",
  "possible_match": "adéquation possible",
  "weak_match": "adéquation faible",
  "out_of_scope": "hors périmètre"
});
export function inclusionCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function rankInclusionService(input, provider) {
  const record = inclusionCase(input);
  if (record.serviceStatus === "closed") return { decision: "out_of_scope", label: DECISIONS["out_of_scope"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce orientation d’insertion à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-inclusion-service-fit <dossier.json>");
  const dossier = inclusionCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à rankInclusionService avec un fournisseur Jev configuré." }, null, 2));
}
