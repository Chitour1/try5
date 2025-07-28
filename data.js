// جدول مراحل المراجعة المتباعدة
export const SRS_STAGES = [
    // Stage 0: Learning phase
    { name: "مرحلة التعلم", intervalDays: 1, reps: 6 }, // After learning, next review is in 1 day
    // Stage 1: First review (Day 1)
    { name: "مراجعة اليوم التالي", intervalDays: 3, reps: 4 }, // After 1st review, next is in 3 days (total 4 days from start)
    // Stage 2: Second review (Day 4)
    { name: "مراجعة بعد 3 أيام", intervalDays: 7, reps: 3 }, // After 2nd review, next is in 7 days (total 11 days from start)
    // Stage 3: Third review (Day 11)
    { name: "مراجعة بعد 7 أيام", intervalDays: 19, reps: 2 }, // After 3rd review, next is in 19 days (total 30 days from start)
    // Stage 4: Fourth review (Day 30)
    { name: "مراجعة بعد 30 يومًا", intervalDays: 30, reps: 2 }, // After 4th review, next is in 30 days (mastery practice)
    // Stage 5: Mastered
    { name: "مرحلة الإتقان", intervalDays: Infinity, reps: 0 }
];

// مكتبة الدروس والجمل
export const LESSON_LIBRARY = {
    "المستوى الأول": {
        'about': {
            title: "about",
            sentences: [
                { id: "ab_01", en: "I read a book about animals.", ar: "قرأت كتابًا عن الحيوانات.", context: "حرف جر: عن / بخصوص", highlight: "about", pronunciation_en: "/aɪ rɛd ə bʊk əˈbaʊt ˈænɪməlz/", pronunciation_ar: "آي ريد أَ بوك أَباوت آنيمالز.", tip_ar: "الفعل 'read' في الماضي يُنطق 'red' لكن يكتب بنفس الشكل. 'about' توضح موضوع الكتاب." },
                { id: "ab_02", en: "What about going to the park?", ar: "ماذا عن الذهاب إلى الحديقة؟", context: "مع السؤال: “What about…?”", highlight: "What about", pronunciation_en: "/wɒt əˈbaʊt ˈɡoʊɪŋ tə ðə pɑːrk?/", pronunciation_ar: "وات أَباوت غوينغ تو ذَا بارك؟", tip_ar: "التركيب 'What about...?' يستخدم لتقديم اقتراح. الفعل الذي يليه يأخذ '-ing'." },
                { id: "ab_03", en: "I have about $10.", ar: "لدي حوالي 10 دولارات.", context: "ظرف: تقريبًا / حوالي", highlight: "about", pronunciation_en: "/aɪ hæv əˈbaʊt tɛn ˈdɒlərz/", pronunciation_ar: "آي هاف أَباوت تين دولارز.", tip_ar: "هنا 'about' تعني 'تقريبًا' أو 'حوالي' وتأتي قبل الأرقام والكميات." },
                { id: "ab_04", en: "The class starts at about 9 o’clock.", ar: "يبدأ الدرس حوالي الساعة 9.", context: "مع الوقت", highlight: "about", pronunciation_en: "/ðə klɑːs stɑːrts æt əˈbaʊt naɪn əˈklɒk/", pronunciation_ar: "ذَا كلاس ستارتس آت أَباوت ناين أُكلوك.", tip_ar: "الفعل 'starts' يأخذ 's' لأنه مع الفاعل المفرد 'The class' في زمن المضارع البسيط." },
                { id: "ab_05", en: "He’s about 12 years old.", ar: "عمره حوالي 12 سنة.", context: "مع العمر / الطول / المسافة", highlight: "about", pronunciation_en: "/hiz əˈbaʊt twɛlv jɪərz oʊld/", pronunciation_ar: "هيز أَباوت تويلف ييرز أولد.", tip_ar: "'He's' هي اختصار لـ 'He is'. نستخدم 'about' مع العمر والقياسات لقول 'حوالي'." },
                { id: "ab_06", en: "This phone is about the same as mine.", ar: "هذا الهاتف بنفس سعر هاتفي تقريبًا.", context: "في المقارنة", highlight: "about the same", pronunciation_en: "/ðɪs foʊn ɪz əˈbaʊt ðə seɪm æz maɪn/", pronunciation_ar: "ذيس فون إز أَباوت ذَا سيم آز ماين.", tip_ar: "التركيب 'the same as' يستخدم للمقارنة بين شيئين متماثلين." },
                { id: "ab_07", en: "I’m about to leave.", ar: "أنا على وشك المغادرة.", context: "مع “to be about to”", highlight: "about to", pronunciation_en: "/aɪm əˈbaʊt tə liːv/", pronunciation_ar: "آيم أَباوت تو ليف.", tip_ar: "التركيب 'to be about to' + (فعل) يعني 'على وشك أن يفعل شيئًا'." },
                { id: "ab_08", en: "She talked about her trip.", ar: "تحدثت عن رحلتها.", context: "مع \"ask/talk/know about\"", highlight: "about", pronunciation_en: "/ʃi tɔːkt əˈbaʊt hər trɪp/", pronunciation_ar: "شي توكت أَباوت هير تريب.", tip_ar: "الفعل 'talked' هو الماضي من 'talk'. نضيف '-ed' للأفعال المنتظمة في الماضي." },
                { id: "ab_09", en: "It’s about time!", ar: "حان الوقت!", context: "في التعبيرات اليومية", highlight: "about time", pronunciation_en: "/ɪts əˈbaʊt taɪm!/", pronunciation_ar: "إتس أَباوت تايم!", tip_ar: "التعبير 'It's about time!' يعني 'لقد حان الوقت أخيرًا' ويستخدم للتعبير عن نفاد الصبر." },
                { id: "ab_10", en: "Don’t worry about it.", ar: "لا تقلق بشأن ذلك.", context: "في التعبيرات اليومية", highlight: "about it", pronunciation_en: "/doʊnt ˈwʌri əˈbaʊt ɪt/", pronunciation_ar: "دونت ووري أَباوت إت.", tip_ar: "'Don't' هي اختصار لـ 'Do not' وتستخدم للنفي في زمن المضارع البسيط." },
            ]
        }
    }
};
