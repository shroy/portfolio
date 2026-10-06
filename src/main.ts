import { registerComponent, registerHook, start } from "hooktml";
import { Crumb } from "./crumb";
import { useEntrance } from "./entrance";
import { useSettle } from "./settle";
import { SoundToggle, useSound } from "./sound";

[Crumb, SoundToggle].forEach((component) => registerComponent(component));
[useEntrance, useSettle, useSound].forEach((hook) => registerHook(hook));
start();
