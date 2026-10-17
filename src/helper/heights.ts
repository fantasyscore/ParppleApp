/** Selectable heights in feet/inches, 4'0" up to 7'11" */
export const HEIGHTS_FT: string[] = [];
for (let ft = 4; ft <= 7; ft++) {
  for (let inch = 0; inch < 12; inch++) {
    HEIGHTS_FT.push(`${ft}'${inch}"`);
  }
}

/** Selectable heights in centimetres, 140 cm up to 210 cm */
export const HEIGHTS_CM: string[] = [];
for (let cm = 140; cm <= 210; cm++) {
  HEIGHTS_CM.push(`${cm} cm`);
}
