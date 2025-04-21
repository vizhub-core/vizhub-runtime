const DEBUG = false;

// Catch unresolved module identifiers
// and mark them as external,
// assuming they are set up with import maps.
export const catchAll = () => ({
  name: "catch-all-prevent-fs",

  resolveId(source: string, importer: string | undefined) {
    DEBUG &&
      console.log(
        "[catch-all-prevent-fs] resolveId",
        source,
        importer,
      );
    return { id: source, external: true };
  },
});
