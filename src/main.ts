import { registerComponent, registerHook, start } from "hooktml";
import { Crumb } from "./crumb";
import { useEntrance } from "./entrance";
import { usePreview } from "./preview";
import { useSettle } from "./settle";
import { SoundToggle, useSound } from "./sound";

[Crumb, SoundToggle].forEach((component) => registerComponent(component));
[useEntrance, usePreview, useSettle, useSound].forEach((hook) => registerHook(hook));
start();
