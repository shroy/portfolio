import { registerComponent, registerHook, start } from "hooktml";
import { Contact } from "./contact";
import { Crumb } from "./crumb";
import { useDialogRoute } from "./dialog";
import { useEntrance } from "./entrance";
import { usePreview } from "./preview";
import { useSettle } from "./settle";
import { SoundToggle, useSound } from "./sound";

[Contact, Crumb, SoundToggle].forEach((component) => registerComponent(component));
[useDialogRoute, useEntrance, usePreview, useSettle, useSound].forEach((hook) => registerHook(hook));
start();
