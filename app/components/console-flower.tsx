"use client";

import { useEffect } from "react";
import { EMAIL } from "@/app/lib/contact";

const FLOWER = String.raw`
       _ _
     _(   )_
    (_  @  _)
      (_ _)
        |  _
        | / )
     _  |/_/
    ( \ |
     \_\|
  ~~~~~~|~~~~~~
`;

// Module scope so Strict Mode's double effect and client navigations log it once.
let logged = false;

export function ConsoleFlower() {
  useEffect(() => {
    if (logged) return;
    logged = true;
    console.log(
      `%c${FLOWER}%c\nHola, curious one! Thanks for looking under the hood.\nSay hi: ${EMAIL}\n`,
      "color:#e879a6;font-family:monospace;font-weight:bold",
      "color:inherit;font-family:inherit",
    );
  }, []);
  return null;
}
