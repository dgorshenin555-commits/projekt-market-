// @ts-nocheck
/* icons.tsx — набор линейных иконок раздела «Заявки» (перенос icons.jsx из Cloud Design). */
import React from 'react';

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' };

const paths = {
  // nav
  grid:       <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  scan:       <><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
  pen:        <><path d="M12 19l7-7a2.5 2.5 0 0 0-3.5-3.5l-7 7L7 19z"/><path d="M14.5 6.5l3 3"/><circle cx="6" cy="20" r="1.4"/></>,
  compass:    <><circle cx="12" cy="4.6" r="1.9"/><path d="M11.1 6.3 6.3 19.6l3.4-2.4M12.9 6.3 17.7 19.6l-3.4-2.4"/><path d="M9.7 17.2h4.6"/></>,
  shield:     <><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></>,
  stamp:      <><path d="M9 4.5a3 3 0 0 1 6 0c0 1.5-1 2.2-1.3 3.5-.2 1 .3 2 1.3 2.5l1 .5a3 3 0 0 1 1.5 2.6V15H6.5v-1.4A3 3 0 0 1 8 11l1-.5c1-.5 1.5-1.5 1.3-2.5C10 6.7 9 6 9 4.5z"/><rect x="5" y="17.5" width="14" height="2.5" rx="1.2"/></>,
  database:   <><ellipse cx="12" cy="5.5" rx="7" ry="2.6"/><path d="M5 5.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/><path d="M5 11.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6"/></>,
  chat:       <><path d="M20 11.5a7.5 7.5 0 0 1-10.8 6.7L4 19.5l1.4-4.1A7.5 7.5 0 1 1 20 11.5z"/></>,
  chart:      <><path d="M5 21V11M12 21V4M19 21v-7"/></>,
  sliders:    <><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></>,
  // ui
  search:     <><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></>,
  menu:       <><path d="M4 6h16M4 12h16M4 18h16"/></>,
  pin:        <><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
  building:   <><rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></>,
  factory:    <><path d="M3 21V10l5 3V10l5 3V7l6 4v10z"/><path d="M3 21h18"/><path d="M7 17h.01M12 17h.01M16 17h.01"/></>,
  clock:      <><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></>,
  wallet:     <><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 9h18M16 13h2"/></>,
  star:       <><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z"/></>,
  portfolio:  <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6"/></>,
  comment:    <><path d="M20 12a8 8 0 0 1-11.5 7.2L4 20.5l1.4-4.3A8 8 0 1 1 20 12z"/></>,
  phone:      <><path d="M5 4h3l1.5 4.5L7.5 10a12 12 0 0 0 6 6l1.5-2 4.5 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></>,
  mail:       <><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 5.5L20 7"/></>,
  globe:      <><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.3 3.6 8.5S14.4 18.2 12 20.5C9.6 18.2 8.4 15.2 8.4 12S9.6 5.8 12 3.5z"/></>,
  plus:       <><path d="M12 5v14M5 12h14"/></>,
  arrowRight: <><path d="M5 12h13M13 6l6 6-6 6"/></>,
  chevR:      <><path d="M9 6l6 6-6 6"/></>,
  chevD:      <><path d="M6 9l6 6 6-6"/></>,
  check:      <><path d="M5 12.5l4.5 4.5L19 7"/></>,
  checkCircle:<><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.5 2.5 4.5-4.8"/></>,
  paperclip:  <><path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14.5 7"/></>,
  send:       <><path d="M21 4L3 11l7 3 3 7z"/><path d="M21 4L10 14"/></>,
  download:   <><path d="M12 4v11M7.5 11L12 15.5 16.5 11M5 20h14"/></>,
  file:       <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></>,
  copy:       <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  list:       <><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></>,
  columns:    <><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/></>,
  filter:     <><path d="M3 5h18l-7 8v5l-4 2v-7z"/></>,
  logout:     <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10M16 8l4 4-4 4"/></>,
  trophy:     <><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9.5 13.5h5l.5 3.5h-6z"/><path d="M8 21h8"/></>,
  target:     <><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/></>,
  users:      <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9"/></>,
  rocket:     <><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2a2.8 2.8 0 0 0-3-3z"/><path d="M9 14l-3-3c1.5-5 5-8 11-8 0 6-3 9.5-8 11z"/><circle cx="14.5" cy="9.5" r="1.4"/></>,
  calendar:   <><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></>,
  layers:     <><path d="M12 3l8.5 4.5L12 12 3.5 7.5z"/><path d="M3.5 12L12 16.5 20.5 12M3.5 16.5L12 21l8.5-4.5"/></>,
  cpu:        <><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2"/></>,
  box:        <><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></>,
  award:      <><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5L7 21l5-2.5L17 21l-1.5-7.5"/></>,
  bell:       <><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M10 20a2 2 0 0 0 4 0"/></>,
  eye:        <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:     <><path d="M3 3l18 18"/><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2"/><path d="M9.4 5.4A9.3 9.3 0 0 1 12 5c6 0 9.5 7 9.5 7a16.6 16.6 0 0 1-2.6 3.4M6.3 6.3A16.4 16.4 0 0 0 2.5 12S6 19 12 19a9.2 9.2 0 0 0 3.9-.9"/></>,
  user:       <><circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></>,
  edit:       <><path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/></>,
  bim:        <><rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 8h3.5a2 2 0 0 1 0 4H8zM8 12h4a2 2 0 0 1 0 4H8zM8 8v8M15 8v8"/></>,
  cert:       <><rect x="4" y="3.5" width="16" height="13" rx="2"/><path d="M8 8h8M8 11h5"/><circle cx="12" cy="18.5" r="2.5"/><path d="M10.5 20.5L9.5 23l2.5-1.5L14.5 23l-1-2.5"/></>,
  ruble:      <><path d="M8 21V4h5a4.5 4.5 0 0 1 0 9H8M6 13h7M6 17h6"/></>,
  spark:      <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></>,
  bulb:       <><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5c-.7.6-1 1.2-1 2H9c0-.8-.3-1.4-1-2A6 6 0 0 1 12 3z"/></>,
  trendUp:    <><path d="M4 17l5-5 3 3 8-8M16 7h4v4"/></>,
  trendDown:  <><path d="M4 7l5 5 3-3 8 8M16 17h4v-4"/></>,
  x:          <><path d="M6 6l12 12M18 6L6 18"/></>,
};

export function Icon({ name, size = 20, style, className, strokeWidth }) {
  const d = paths[name];
  if (!d) return null;
  const p = strokeWidth ? { ...P, strokeWidth } : P;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} className={className} {...p}>{d}</svg>
  );
}
