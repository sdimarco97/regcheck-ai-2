// import {
//   ScenarioType,
//   Belief,
//   ModalType,
//   BeliefSet,
//   Consequence,
//   Property,
//   AssertionSet,
//   Assertion,
// } from "../types/interfaces";

import _ from "lodash";
export function deduplicateProperties(properties) {
  return _.uniqWith(properties, (a, b) => {
    return a.sentence === b.sentence && a.valence === b.valence;
  });
}

export function invertValences(properties) {
  return properties.map((property) => ({
    ...property,
    valence: !property.valence,
  }));
}

export function createAlwaysAssertions(
  filters,
  adjectives
){
  return adjectives.map((adj) => {
    // Create a copy of the adjective with an inverted valence
    const modifiedAdjective = { ...adj, valence: !adj.valence };
    // Combine the filters with the modified adjective
    return [...filters, modifiedAdjective];
  });
}

export function breakdownBelief(CompoundBelief) {
  switch (CompoundBelief.scenario.type) {
    case "MUTUAL_EXCLUSION":
    //fall-through to next case
    case "MUTUAL_INCLUSION":
      const modalType =
        CompoundBelief.scenario.type === "MUTUAL_EXCLUSION"
          ? "Never"
          : "Always";
      const result = CompoundBelief.scenario.antecedents.map(
        (antecedent, i) => ({
          ...CompoundBelief,
          scenario: {
            ...CompoundBelief.scenario,
            type: "IF_THEN",
            antecedents: [antecedent],
            consequences: CompoundBelief.scenario.antecedents
              .filter((_, v) => i !== v)
              .map(
                (fp) => ({ modal: modalType, properties: fp })
              ),
          },
        })
      );
      return result;
    default:
      return [CompoundBelief];
  }
}

export function normaliseBeliefSet(beliefSet) {
  let normalisedBeliefSet = {
    beliefs: [],
    beliefSetName: beliefSet.beliefSetName,
    beliefSetOwner: beliefSet.beliefSetOwner,
    beliefSetVersion: beliefSet.beliefSetVersion,
    blindReferenceExternalIdArray: beliefSet.blindReferenceExternalIdArray,
  };

  for (let i = 0; i < beliefSet.beliefs.length; i++) {
    const currentBelief = beliefSet.beliefs[i];
    const type = currentBelief.scenario.type;

    if (type === "IF_THEN") {
      normalisedBeliefSet.beliefs.push(currentBelief);
    } else if (type === "MUTUAL_EXCLUSION" || type === "MUTUAL_INCLUSION") {
      normalisedBeliefSet.beliefs = normalisedBeliefSet.beliefs.concat(
        breakdownBelief(currentBelief)
      );
    }
  }
  return normalisedBeliefSet;
}

export function generateAssertions(beliefSet){
  let assertionSet = { assertions: [] };

  beliefSet.beliefs.forEach((belief) => {
    if (belief.scenario.type === "IF_THEN") {
      belief.scenario.antecedents.forEach((antecedent) => {
        belief.scenario.consequences.forEach((consequence) => {
          if (consequence.modal === "Always") {
            let toExclude = createAlwaysAssertions(
              antecedent,
              consequence.properties.filter(
                (obj) =>
                  !antecedent.map((fp) => fp.sentence).includes(obj.sentence)
              )
            );
            toExclude.forEach((item) => {
              let assertObj = {
                exclude: true, //Always set to exclude. This line can be removed in the future to speed up the program, as I'm not generating 'possible' cases anymore to save memory.
                properties: item,
                sourceBeliefId: belief.beliefUniqueId,
              };
              assertionSet.assertions.push(assertObj);
            });
          } else if (consequence.modal === "Never") {
            let assertObj = {
              exclude: true, //Always set to exclude. This line can be removed in the future to speed up the program, as I'm not generating 'possible' cases anymore to save memory.
              properties: antecedent.concat(consequence.properties),
              sourceBeliefId: belief.beliefUniqueId,
            };
            assertionSet.assertions.push(assertObj);
          }
        });
      });
    }
  });

  return assertionSet;
}
