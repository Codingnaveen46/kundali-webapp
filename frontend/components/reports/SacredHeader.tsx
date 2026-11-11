import React from "react";

/**
 * SacredHeader — traditional invocation block for the print report covers:
 * Ganesha emblem (top centre), Om + mantra line, and an auspicious blessing.
 * The emblem is a local line-art PNG on white, so it blends into the printed
 * A4 sheet and stays crisp at print resolution.
 */

const MANTRA = "\u0950 \u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903 \u00B7 Om Shri Ganeshaya Namah";

export const SacredHeader: React.FC<{ blessing: string }> = ({ blessing }) => (
  <div className="pc-sacred">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/ganesha.png" alt="" className="pc-sacred-emblem" />
    <div className="pc-sacred-mantra">{MANTRA}</div>
    <div className="pc-sacred-blessing">{blessing}</div>
  </div>
);
