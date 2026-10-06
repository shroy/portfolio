import { registerComponent, start } from "hooktml";
import { Kit } from "./kit";

// The 404 page's own entry: it needs the drum kit and nothing else the other pages ship.
registerComponent(Kit);
start();
