
import React from 'react';

export const INITIAL_SHLOKA = {
  text: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः ।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ॥",
  translation: "",
  lastChar: "य"
};

export const RULES = [
  "Only authentic Sanskrit Shlokas are valid.",
  "Your Shloka must start with the specific letter shown in the input box.",
  "The challenge letter is derived from the last sound (Akshara) of the previous shloka.",
  "Provide the shloka in Devanagari script or via voice recording.",
  "Only Devanagari script is shown for a traditional practice experience."
];
