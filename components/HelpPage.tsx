import React from 'react';

interface HelpPageProps {
  onBack: () => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-saffron transition-colors group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-base sm:text-lg">Back to Home</span>
      </button>

      {/* Header */}
      <div className="text-center space-y-3 py-4">
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-base sm:text-lg font-bold">
          Help / सहायता
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 devanagari">
          श्लोक चक्र <span className="text-saffron">(श्लोकान्त्याक्षरी)</span>
        </h1>
      </div>

      {/* About Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">ऐप के बारे में</span>
        </h2>
        <div className="space-y-4 text-gray-600 text-base sm:text-lg leading-relaxed">
          <p className="devanagari">
            श्लोक चक्र (श्लोकान्त्याक्षरी) ऐप में संस्कृत के <span className="font-bold text-saffron">15 से अधिक</span> प्रमुख काव्य-ग्रन्थों के चयनित श्लोक संग्रहित हैं, जिनमें प्रमुख हैं—
          </p>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="devanagari text-gray-700 font-medium text-base sm:text-lg">
              रघुवंश, कुमारसंभवम्, शिशुपालवधम्, किरातार्जुनीयम्, नैषधीयचरितम्, नीतिशतकम्, वैराग्यशतकम्, अमरुशतकम्, हितोपदेश, मुहूर्तचिन्तामणि, प्रतापविजयम् आदि।
            </p>
          </div>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-bold">✓</span>
              <span className="devanagari">प्रत्येक श्लोक के अंत में ग्रन्थ, सर्ग/अध्याय एवं श्लोक संख्या का स्पष्ट उल्लेख दिया गया है।</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-bold">✓</span>
              <span className="devanagari">यह सुविधा अध्ययन, अभ्यास एवं शोध के लिए अत्यन्त उपयोगी है।</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">श्लोकान्त्याक्षरी कैसे खेलें?</span>
        </h2>
        <div className="space-y-5">
          {[
            { step: 1, title: 'वेबसाइट खोलें', desc: 'https://shlok.upsanskritpratibhakhoj.com' },
            { step: 2, title: 'नया खेल प्रारम्भ करें', desc: 'Start New Game पर क्लिक करें।' },
            { step: 3, title: 'प्रणाली का श्लोक', desc: 'प्रणाली स्वयं एक श्लोक लिखेगी और अगले श्लोक के लिए आरम्भिक अक्षर देगी।' },
            { step: 4, title: 'अपना श्लोक लिखें', desc: 'दिए गए अक्षर से शुरू होने वाला निर्धारित ग्रन्थ का श्लोक लिखें।' }
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-saffron text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-md">
                {step}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 devanagari text-lg sm:text-xl">{title}</h3>
                <p className="text-gray-600 text-base sm:text-lg devanagari">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing Rules Section */}
      <section className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">श्लोक लिखने के नियम (महत्वपूर्ण)</span>
        </h2>
        <ul className="space-y-4 text-gray-700 text-base sm:text-lg">
          <li className="flex items-start gap-3">
            <span className="text-orange-600 mt-1 font-bold">•</span>
            <span className="devanagari">श्लोक केवल उन्हीं ग्रन्थों से मान्य होंगे, जो ऐप में सम्मिलित हैं।</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-600 mt-1 font-bold">•</span>
            <div className="devanagari">
              <span className="font-medium">श्लोक के न्यूनतम दो पद लिखना अनिवार्य है।</span>
              <ul className="mt-2 ml-4 space-y-1 text-base text-gray-600">
                <li>• पद = सुबन्त / तिङन्त पद</li>
                <li>• जैसे श्लोक में संधि-समासयुक्त पद हों, उसी रूप में लिखें।</li>
              </ul>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-orange-600 mt-1 font-bold">•</span>
            <div className="devanagari">
              <span>अपूर्ण या गलत श्लोक पर यह संदेश आएगा—</span>
              <div className="mt-2 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-base italic border border-red-100">
                "Please provide a valid Sanskrit shloka starting with …"
              </div>
            </div>
          </li>
        </ul>
      </section>

      {/* Accuracy Check Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">शुद्धता जाँच प्रणाली</span>
        </h2>
        <div className="space-y-4 text-gray-600 text-base sm:text-lg devanagari">
          <p>यह ऐप केवल श्लोक पहचानता ही नहीं, बल्कि उसकी भाषिक शुद्धता भी जाँचता है—</p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="text-orange-600 mt-1 font-bold">•</span>
              <div>
                <span>यदि कोई शब्द हल्की त्रुटि से लिखा जाए</span>
                <div className="mt-1 text-base text-gray-500 italic">
                  (जैसे <span className="text-red-500">*विरम्यतां भूतवती*</span> के स्थान पर <span className="text-red-500">*विम्यतां भूवती*</span>),
                </div>
                <span>तब भी प्रणाली अक्षर-स्तर पर पहचान कर निर्णय करती है।</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-orange-600 mt-1 font-bold">•</span>
              <span>यदि अपेक्षित दो पूर्ण पद नहीं लिखे गए हों, तो श्लोक अस्वीकार कर दिया जाएगा।</span>
            </li>
          </ul>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 mt-4">
            <p className="text-green-700 font-medium text-base sm:text-lg">
              इस प्रकार ऐप पाठ-शुद्धि, अनुशासन और अभ्यास—तीनों को सुदृढ़ करता है।
            </p>
          </div>
        </div>
      </section>

      {/* Score System Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">अंक प्रणाली (Score Board)</span>
        </h2>
        <div className="space-y-3 text-gray-600 text-base sm:text-lg devanagari">
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>प्रणाली द्वारा दिए गए श्लोक</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>आपके द्वारा लिखे गए सही श्लोक</span>
          </div>
          <div className="bg-saffron text-white p-4 rounded-xl mt-3 font-medium text-base sm:text-lg">
            प्रत्येक के लिए <span className="text-3xl font-bold">५</span> अंक स्वतः स्कोर बोर्ड पर जुड़ते हैं।
          </div>
        </div>
      </section>

      {/* Audio Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">शुद्ध उच्चारण एवं श्रवण अभ्यास</span>
        </h2>
        <div className="space-y-4 text-gray-600 text-base sm:text-lg devanagari">
          <p>ऐप में चुनिंदा श्लोकों के छन्दोविधानयुक्त MP3 उपलब्ध हैं, जिससे—</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-center gap-3">
              <span className="text-orange-600 font-bold">•</span>
              <span>शुद्ध उच्चारण</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-orange-600 font-bold">•</span>
              <span>लय एवं ताल</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-orange-600 font-bold">•</span>
              <span>मधुर पाठ / गायन का अभ्यास सरलता से किया जा सकता है।</span>
            </li>
          </ul>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-3">
            <p className="text-orange-700 text-base sm:text-lg font-medium">
              विशेष रूप से बच्चों एवं नवशिक्षार्थियों के लिए उपयोगी।
            </p>
          </div>
        </div>
      </section>

      {/* Typing Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 sm:p-8 rounded-2xl shadow-lg border border-blue-200">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">अंग्रेज़ी कीबोर्ड से संस्कृत टाइपिंग</span>
        </h2>
        <div className="space-y-4 text-gray-600 text-base sm:text-lg devanagari">
          <p>संस्कृत कीबोर्ड न जानने वालों के लिए—</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-center gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>अंग्रेज़ी में टाइप करें</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>प्रणाली स्वतः संस्कृत में बदल देगी</span>
            </li>
          </ul>
          <div className="bg-white p-5 rounded-xl border border-blue-200 mt-3 flex items-center justify-center gap-6">
            <span className="text-2xl font-bold text-blue-600">Raama</span>
            <span className="text-3xl text-gray-400">→</span>
            <span className="text-2xl font-bold text-saffron devanagari">राम</span>
          </div>
        </div>
      </section>

      {/* Competition Section */}
      <section className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg border border-orange-50">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="devanagari">प्रतियोगिता अभ्यास हेतु विशेष उपयोग</span>
        </h2>
        <div className="space-y-4 text-gray-600 text-base sm:text-lg devanagari">
          <p>यह ऐप विशेष रूप से श्लोकान्त्याक्षरी प्रतियोगिता की तैयारी के लिए उपयोगी है—</p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>श्लोक की शुद्धता जाँच</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>भूले हुए श्लोक खोजकर पूरा पाठ देखना</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <span>क्रम, शब्द-रचना एवं पाठ का अभ्यास</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer Section */}
      <section className="bg-saffron p-6 sm:p-8 rounded-2xl shadow-lg text-white text-center">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold devanagari">श्लोक चक्र (श्लोकान्त्याक्षरी)</h2>
          <p className="text-white/90 devanagari text-base sm:text-lg">
            संस्कृत अभ्यास, प्रतियोगिता और शुद्ध उच्चारण—तीनों का एक विश्वसनीय डिजिटल माध्यम।
          </p>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
