export type Solution = ReadonlyArray<ReadonlyArray<number>>;

export type SolveResult =
  | { readonly status: "no_solution" }
  | { readonly status: "unique_solution"; readonly solution: Solution }
  | { readonly status: "multiple_solutions"; readonly solution: Solution };
