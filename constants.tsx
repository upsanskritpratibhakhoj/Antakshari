
import React from 'react';
import { SHLOKA_DATABASE } from './data/shlokaDatabase';

// Sample starting shlokas for random initialization
const STARTING_SHLOKAS = [
  {
    text: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः ।\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ॥",
    translation: "",
    lastChar: "य"
  },
  {
    text: "वसुदेवसुतं देवं कंसचाणूरमर्दनम् ।\nदेवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥",
    translation: "",
    lastChar: "म"
  },
  {
    text: "सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥",
    translation: "",
    lastChar: "त"
  },
  {
    text: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ।\nगुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः ॥",
    translation: "",
    lastChar: "न"
  },
  {
    text: "यस्य स्मृत्या च नामोक्त्या तपःपूजाक्रियादिषु ।\nन्यूनं संपूर्णतां याति सद्यो वन्दे तमच्युतम् ॥",
    translation: "",
    lastChar: "म"
  }
];

// Function to get a random initial shloka
export const getRandomInitialShloka = () => {
  const randomIndex = Math.floor(Math.random() * STARTING_SHLOKAS.length);
  return STARTING_SHLOKAS[randomIndex];
};

export const RULES = [
  "केवल प्रामाणिक संस्कृत श्लोक ही मान्य हैं।",
  "आपका श्लोक इनपुट बॉक्स में दिखाए गए विशिष्ट अक्षर से शुरू होना चाहिए।",
  "चुनौती का अक्षर पिछले श्लोक की अंतिम ध्वनि (अक्षर) से प्राप्त होता है।",
  "देवनागरी लिपि में श्लोक प्रदान करें।",
  "बेहतर परिणाम पाने के लिए रघुवंशम्, कुमारसंभवम्, मेघदूतम् नैषधीयचरितम्, किरातार्जुनीयम्, शिशुपालवधम्, चंद्रालोक, मुहूर्तचिंतामणि, नीतिसंग्रह-मित्रलाभ, नीतिशतकम्, अमरुशतकम्, चौरपञ्चाशिका, पुरुषार्थोपदेश या प्रतापविजय के श्लोक के आरंभिक न्यूनतम दो पद लिखें।"
];
