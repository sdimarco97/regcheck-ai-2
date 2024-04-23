// import express, { Request, Response } from "express";
// import {
//   BeliefSet,
//   AssertionSet,
//   Property,
//   ExploreResult,
// } from "../types/interfaces";
import {
  normaliseBeliefSet,
  generateAssertions,
} from "../utils/deCheemInternalUtils.js";

import { exploreAssertions } from "../utils/deCheemExploreUtils.js";

export const returnAssertionSet = (req, res) => {
  // console.log('req',req.body)
  try {
    const beliefSet = req.body; 
    // console.log("beliefSet",beliefSet)
    const normalisedBeliefSet = normaliseBeliefSet(beliefSet);
    console.log(JSON.stringify(normalisedBeliefSet))
    const assertionSet = generateAssertions(normalisedBeliefSet);
    res.json(assertionSet);
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while processing the request: " + error);
  }
};

export const exploreBeliefSet = (req, res) => {
  try {
    const explore = req.body.explore;

    const beliefSet = req.body.beliefSet;
    //Normalise to 'LET' scenarios
    const normalisedBeliefSet = normaliseBeliefSet(beliefSet);
    //Create assertions
    const assertionSet = generateAssertions(normalisedBeliefSet);
    //Explore assertions using 'explore'
    const exploreResults = exploreAssertions(
      explore,
      assertionSet
    );
    res.json(exploreResults);
  } catch (error) {
    res
      .status(500)
      .send("An error occurred while processing the request: " + error);
  }
};
