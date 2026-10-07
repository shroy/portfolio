import { registerComponent, registerHook, start } from "hooktml";
import { useBackTransition } from "./back-transition";
import { Contact } from "./contact";
import { Crumb } from "./crumb";
import { useDialogRoute } from "./dialog";
import { useEntrance } from "./entrance";
import { usePreview } from "./preview";
import { useSettle } from "./settle";
import { SoundToggle, useSound } from "./sound";
import { useSwipeDismiss } from "./swipe-dismiss";

[Contact, Crumb, SoundToggle].forEach((component) => registerComponent(component));
[useBackTransition, useDialogRoute, useEntrance, usePreview, useSettle, useSound, useSwipeDismiss].forEach((hook) => registerHook(hook));
start();
