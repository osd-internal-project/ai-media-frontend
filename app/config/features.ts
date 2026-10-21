/** Unfinished features. Flip a flag to true to bring the whole surface back. */
export const FEATURES = {
  /** Public Social / Communication: posts, approval queue, social connections, quick Share in All Activity. */
  social: false,
  /** Plans, checkout, credits. SUPER_ADMIN sees these regardless — see canSeeBilling. */
  billing: false,
  /** Browser video editor tab in a project (in development). */
  videoEditor: true,
} as const;
