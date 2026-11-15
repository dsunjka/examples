import React from 'react';
import {BildV, FloV, ListeV, MerkeV, TitleV, VergleichV} from './basic';
import {GeldV, RechnungV, StellenwertV, UhrV, ZahlenstrahlV, ZehnerfeldV} from './math';
import {SceneV, sceneHasFlo} from './scene';
import {BuchstabenV, SatzV, SilbenV} from './sprache';
import {StrasseV, WasserV, ZahnV} from './sach';
import type {VProps} from './types';

type Entry = {
  comp: React.FC<VProps>;
  /** eigener Hintergrund (Backdrop wird nicht gezeichnet) */
  ownBg?: boolean;
  /** Standard-Hintergrund, wenn visual.bg fehlt */
  bg?: string;
  /** Flo in der Ecke ausblenden */
  noCornerFlo?: (v: any) => boolean;
};

export const VISUALS: Record<string, Entry> = {
  title: {comp: TitleV, bg: 'plain', noCornerFlo: () => true},
  flo: {comp: FloV, bg: 'plain', noCornerFlo: () => true},
  scene: {comp: SceneV, bg: 'meadow', noCornerFlo: sceneHasFlo},
  zehnerfeld: {comp: ZehnerfeldV},
  zahlenstrahl: {comp: ZahlenstrahlV},
  rechnung: {comp: RechnungV},
  stellenwert: {comp: StellenwertV},
  uhr: {comp: UhrV},
  geld: {comp: GeldV},
  silben: {comp: SilbenV},
  buchstaben: {comp: BuchstabenV},
  satz: {comp: SatzV},
  strasse: {comp: StrasseV, ownBg: true},
  wasser: {comp: WasserV},
  zahn: {comp: ZahnV, bg: 'bathroom'},
  liste: {comp: ListeV},
  vergleich: {comp: VergleichV},
  bild: {comp: BildV},
  merke: {comp: MerkeV},
};

export const VISUAL_TYPES = Object.keys(VISUALS);
