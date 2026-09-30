export function councilChiefToDecisionEvidence(brief) {
  if (!brief || brief.schema !== 'council-chief-v1') {
    throw new TypeError('council-chief-v1 brief is required');
  }
  const recommendation = brief.recommendation;
  if (!recommendation?.project || !recommendation?.nextMove) {
    throw new TypeError('Council recommendation with project and nextMove is required');
  }

  return {
    schema: 'openaction.decision-evidence.v1',
    source: 'council-chief-v1',
    project: recommendation.project,
    selected_path: recommendation.nextMove,
    rationale: recommendation.rationale || 'Council supplied no rationale.',
    confidence_estimate: recommendation.confidencePercent ?? null,
    evidence_type: recommendation.evidenceType || 'council_inference',
    alternatives: (brief.alternatives || []).slice(0, 4).map((item) => ({
      project: item.project,
      next_move: item.nextMove,
      rationale: item.rationale,
      confidence_estimate: item.confidencePercent ?? null
    })),
    decision_owner: 'human',
    authority_granted: 'none',
    advisory: true,
    rule: 'Council evidence may inform a choice; it does not authorize execution or convert inference into observed fact.'
  };
}
