/** "1 font", "9 colors" — English plural for the brand kit counters. */
export const countLabel = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;
