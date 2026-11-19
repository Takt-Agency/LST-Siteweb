"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

/** Point d'entrée unique de GSAP : les plugins sont enregistrés une seule fois. */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, MotionPathPlugin);

export { gsap, ScrollTrigger, SplitText, MotionPathPlugin, useGSAP };
