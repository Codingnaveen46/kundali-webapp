# TERMS_REVIEW.md — Kannada terms for the Janma print report

**Status: UNVERIFIED. Terms below were drafted for the Phase 4 chapter print
layout of the Janma Kundali report (`/print/janma`, lang=kn). They have NOT
been reviewed by an astrologer or a Kannada-language reviewer. Traditions
differ, both in English and in Kannada astrological vocabulary.**

Where the existing `KANNADA_TRANSLATIONS` dictionary already carries terms
(grahas, rashis, nakshatras, dignities), those terms are reused and are not
listed below. Only the new `janma_labels` keys added in Phase 4 are listed.

| Key | English | Kannada used | Reviewer-verified? |
|---|---|---|---|
| app_name | Kundli Report | ಕುಂಡಲಿ ವರದಿ | No |
| report_kind | Vedic Astrology Report | ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯ ವರದಿ | No |
| disclaimer | Calculated by software, not reviewed by an astrologer. Traditions differ. | ಸಾಫ್ಟ್‌ವೇರ್‌ನಿಂದ ಲೆಕ್ಕ ಹಾಕಲಾಗಿದೆ; ಜ್ಯೋತಿಷ್ಯಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ. ಸಂಪ್ರದಾಯಗಳು ಬೇರೆ ಬೇರೆ ಇರಬಹುದು. | No |
| ch_basic | Basic | ಮೂಲ ಮಾಹಿತಿ | No |
| ch_kundli | Kundli | ಜಾತಕ | No |
| ch_dasha | Dasha | ದಶಾ | No |
| ch_dosha | Dosha Analysis | ದೋಷ ವಿಶ್ಲೇಷಣೆ | No |
| ch_appendix | Appendix | ಲಗ್ನ ಪ್ರತ್ಯಾಂಶ | No — "ಲಗ್ನ ಪ್ರತ್ಯಾಂಶ" was intended as "calculation annex"; please verify wording |
| sec_birth | Birth Details | ಜನನ ವಿವರಗಳು | No |
| sec_panchang | Panchang | ಪಂಚಾಂಗ | No (standard term) |
| sec_avakahada | Avakahada Details | ಅವಕಹಡಾ ವಿವರಗಳು | No — spelling of ಅವಕಹಡಾ needs review (avakahada chakra) |
| sec_lagna_kundli | Lagna Kundli (D1) | ಲಗ್ನ ಕುಂಡಲಿ (D1) | No |
| sec_navamsa | Navamsa Kundli (D9) | ನವಾಂಶ ಕುಂಡಲಿ (D9) | No |
| sec_planets | Planetary Positions | ಗ್ರಹ ಸ್ಥಿತಿಗಳು | No |
| sec_mangal | Mangal Dosha | ಮಂಗಳ ದೋಷ (ಕುಜ ದೋಷ) | No |
| sec_kaalsarpa | Kaal Sarpa Yoga | ಕಾಲ ಸರ್ಪ ಯೋಗ | No |
| sec_sadesati | Sade Sati | ಸಡೆಸತಿ | No — transliteration choice needs review (ಸಾಡೇ ಸಾತಿ?) |
| ascendant | Ascendant | ಲಗ್ನ | No (standard term) |
| ascendant_lord | Ascendant Lord | ಲಗ್ನಾಧಿಪತಿ | No |
| nakshatra_lord | Nakshatra Lord | ನಕ್ಷತ್ರಾಧಿಪತಿ | No |
| varna / vashya / yoni / gana / nadi | Varna / Vashya / Yoni / Gana / Nadi | ವರ್ಣ / ವಶ್ಯ / ಯೋನಿ / ಗಣ / ನಾಡಿ | No (standard koota terms; existing dict already used some) |
| charan | Charan (Pada) | ಚರಣ (ಪಾದ) | No |
| tatva | Tatva | ತತ್ವ | No |
| name_alphabet | Name Alphabet | ನಾಮಾಕ್ಷರ | No |
| paya | Paya (house from Lagna) | ಪಾಯ (ಲಗ್ನದಿಂದ) | No |
| paya_star | Paya (birth star school) | ಪಾಯ (ಜನ್ಮ ನಕ್ಷತ್ರ ಪದ್ಧತಿ) | No |
| yunja | Yunja | ಯುಂಜ | No — the term itself is unverified in classical literature (Narada Samhita ch. 6, as commonly quoted); Kannada spelling chosen as a transliteration |
| retro | Retro | ವಕ್ರ | No |
| combust | Combust | ಅಸ್ತ | No |
| dignity | Dignity | ಗುಣ ಸ್ಥಿತಿ | No |
| current (ACTIVE pill) | ACTIVE | ಸಕ್ರಿಯ | No |
| verified / unverified | Verified / Unverified | ಪರಿಶೀಲಿತ / ಪರಿಶೀಲಿಸದ | No |
| sec_verify | Verification Log | ಪರಿಶೀಲನಾ ದಾಖಲೆ | No |
| sec_known | Known Differences with Other Tools | ಇತರ ಸಾಧನಗಳೊಂದಿಗೆ ತಿಳಿದ ವ್ಯತ್ಯಾಸಗಳು | No |

## Known differences table wording

The "Known differences with other tools" table states rule provenance only;
its Kannada wording (aspect / this report / why the values can differ) uses
ಅಂಶ / ಈ ವರದಿ / ಮೌಲ್ಯಗಳು ಬೇರೆ ಇರಬಹುದಾದ ಕಾರಣ — unreviewed.

## Process

A human reviewer (astrology + Kannada) should verify or correct each row.
While this file is unreviewed, the report continues to carry the project
disclaimer ("Calculated by software, not reviewed by an astrologer.
Traditions differ.") on every rendering, in both languages.
