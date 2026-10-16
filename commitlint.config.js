import conventional from "@commitlint/config-conventional";
import createPreset from "conventional-changelog-conventionalcommits";

export default {
  ...conventional,
  parserPreset: {
    name: "conventional-changelog-conventionalcommits",
    parserOpts: createPreset().parser,
  },
};
