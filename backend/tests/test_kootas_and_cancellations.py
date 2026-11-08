"""Unit tests for every Koota in Ashtakoota Milan and classical cancellation edge cases."""

import pytest
from app.calculations.ashtakoota import (
    calculate_varna, calculate_vashya, calculate_tara, calculate_yoni,
    calculate_graha_maitri, calculate_gana, calculate_bhakoot, calculate_nadi,
    calculate_ashtakoota
)
from app.calculations.doshas import check_mangal_dosha
from app.calculations.dosha_samya import calculate_dosha_samya


def test_varna_koota():
    # Groom Brahmin, Bride Kshatriya -> 1.0 (Anuloma)
    assert calculate_varna("Cancer", "Aries")["points"] == 1.0
    # Both Brahmin -> 1.0
    assert calculate_varna("Cancer", "Pisces")["points"] == 1.0
    # Groom Shudra, Bride Brahmin -> 0.0 (Pratiloma)
    assert calculate_varna("Gemini", "Cancer")["points"] == 0.0


def test_vashya_koota():
    # Mutual Vashya / Same sign -> 2.0
    assert calculate_vashya("Aries", "Aries")["points"] == 2.0
    # Aries -> Leo is Vashya -> 1.0 or 2.0
    assert calculate_vashya("Aries", "Leo")["points"] >= 1.0
    # Unrelated signs -> 0.0
    assert calculate_vashya("Gemini", "Aries")["points"] == 0.0


def test_tara_koota():
    # Same nakshatra (Ashwini & Ashwini): count 1 (Janma), not in [2,4,6,8,9] -> 0.0
    res_same = calculate_tara(0, 0)
    assert res_same["points"] == 0.0
    # Ashwini (0) and Bharani (1):
    # Bride (0) to Groom (1) = 2 (Sampat - auspicious)
    # Groom (1) to Bride (0) = 27 (mod 9 = 9 Paramamitra - auspicious)
    res_good = calculate_tara(1, 0)
    assert res_good["points"] == 3.0


def test_yoni_koota_and_enemy_yonis():
    # Same Yoni (Ashwini & Shatabhisha - Horse) -> 4.0
    res_horse = calculate_yoni("Ashwini", "Shatabhisha")
    assert res_horse["points"] == 4.0
    assert not res_horse["is_sworn_enemy"]
    
    # Sworn enemies: Cow vs Tiger (Uttara Phalguni vs Chitra) -> 0.0
    res_cow_tiger = calculate_yoni("Uttara Phalguni", "Chitra")
    assert res_cow_tiger["points"] == 0.0
    assert res_cow_tiger["is_sworn_enemy"]
    
    # Sworn enemies: Elephant vs Lion (Bharani vs Dhanishta) -> 0.0
    res_ele_lion = calculate_yoni("Bharani", "Dhanishta")
    assert res_ele_lion["points"] == 0.0
    assert res_ele_lion["is_sworn_enemy"]
    
    # Sworn enemies: Dog vs Deer (Ardra vs Anuradha) -> 0.0
    res_dog_deer = calculate_yoni("Ardra", "Anuradha")
    assert res_dog_deer["points"] == 0.0
    assert res_dog_deer["is_sworn_enemy"]
    
    # Sworn enemies: Cat vs Rat (Punarvasu vs Magha) -> 0.0
    res_cat_rat = calculate_yoni("Punarvasu", "Magha")
    assert res_cat_rat["points"] == 0.0
    assert res_cat_rat["is_sworn_enemy"]
    
    # Sworn enemies: Serpent vs Mongoose (Rohini vs Uttara Ashadha) -> 0.0
    res_serp_mong = calculate_yoni("Rohini", "Uttara Ashadha")
    assert res_serp_mong["points"] == 0.0
    assert res_serp_mong["is_sworn_enemy"]


def test_graha_maitri():
    # Same sign ruler (Aries & Scorpio - both Mars) -> 5.0
    assert calculate_graha_maitri("Aries", "Scorpio")["points"] == 5.0
    # Natural mutual friends (Sun & Jupiter -> Leo & Sagittarius) -> 5.0
    assert calculate_graha_maitri("Leo", "Sagittarius")["points"] == 5.0
    # Natural mutual enemies (Sun & Saturn -> Leo & Capricorn) -> 0.0
    assert calculate_graha_maitri("Leo", "Capricorn")["points"] == 0.0


def test_gana_koota():
    # Deva + Deva -> 6.0
    assert calculate_gana("Ashwini", "Pushya")["points"] == 6.0
    # Manushya + Manushya -> 6.0
    assert calculate_gana("Bharani", "Rohini")["points"] == 6.0
    # Rakshasa + Rakshasa -> 6.0
    assert calculate_gana("Krittika", "Magha")["points"] == 6.0
    # Deva (Groom) + Rakshasa (Bride) -> 0.0
    assert calculate_gana("Ashwini", "Krittika")["points"] == 0.0


def test_bhakoot_and_cancellations():
    # 1. Auspicious 1/7 Samasaptaka (Aries 0 and Libra 6) -> 7.0
    res_17 = calculate_bhakoot(0, 6)
    assert res_17["points"] == 7.0
    assert not res_17["has_dosha"]
    
    # 2. 6/8 Shadashtaka with SAME LORD (Aries 0 and Scorpio 7 - both Mars)
    # Must be cancelled -> 7.0 points!
    res_68_mars = calculate_bhakoot(0, 7)
    assert res_68_mars["is_cancelled"]
    assert res_68_mars["points"] == 7.0
    assert not res_68_mars["has_dosha"]
    
    # 3. 6/8 Shadashtaka with SAME LORD (Taurus 1 and Libra 6 - both Venus)
    # Must be cancelled -> 7.0 points!
    res_68_venus = calculate_bhakoot(1, 6)
    assert res_68_venus["is_cancelled"]
    assert res_68_venus["points"] == 7.0
    
    # 4. 6/8 Shadashtaka UNEXEMPT (Gemini 2 and Scorpio 7) -> 0.0 points
    res_68_unexempt = calculate_bhakoot(2, 7)
    assert not res_68_unexempt["is_cancelled"]
    assert res_68_unexempt["points"] == 0.0
    assert res_68_unexempt["has_dosha"]
    
    # 5. 2/12 Dwirdwadasha with SAME LORD (Capricorn 9 and Aquarius 10 - both Saturn)
    # Must be cancelled -> 7.0 points!
    res_212_saturn = calculate_bhakoot(9, 10)
    assert res_212_saturn["is_cancelled"]
    assert res_212_saturn["points"] == 7.0
    
    # 6. 2/12 Dwirdwadasha UNEXEMPT (Aries 0 and Taurus 1) -> 0.0 points
    res_212_unexempt = calculate_bhakoot(0, 1)
    assert not res_212_unexempt["is_cancelled"]
    assert res_212_unexempt["points"] == 0.0
    assert res_212_unexempt["has_dosha"]
    
    # 7. 5/9 Navapanchama with FRIENDLY LORDS (Cancer 3 and Pisces 11 - Moon & Jupiter)
    res_59_friends = calculate_bhakoot(3, 11)
    assert res_59_friends["is_cancelled"]
    assert res_59_friends["points"] == 7.0


def test_nadi_and_cancellations():
    # 1. Different Nadis (Ashwini Adi 0 vs Bharani Madhya 1) -> 8.0 points
    res_diff = calculate_nadi(0, 1, 0, 0, 1, 1)
    assert res_diff["points"] == 8.0
    assert not res_diff["has_dosha"]
    
    # 2. Same Nadi UNEXEMPT (Ashwini 0 and Ardra 5 - both Adi, different rashis Aries vs Gemini) -> 0.0 points
    res_same = calculate_nadi(0, 5, 0, 2, 1, 1)
    assert res_same["points"] == 0.0
    assert res_same["has_dosha"]
    
    # 3. Same Rashi, Different Nakshatras (Ardra 5 and Punarvasu 6 - both in Gemini, both Adi Nadi)
    # Must be cancelled -> 8.0 points!
    res_same_rashi = calculate_nadi(5, 6, 2, 2, 1, 1)
    assert res_same_rashi["is_cancelled"]
    assert res_same_rashi["points"] == 8.0
    assert not res_same_rashi["has_dosha"]
    
    # 4. Same Nakshatra, Different Rashis (Krittika 2 - Pada 1 Aries, Pada 2 Taurus)
    # Both Antya Nadi, but span Aries and Taurus -> CANCELLED -> 8.0 points!
    res_same_nak_diff_rashi = calculate_nadi(2, 2, 0, 1, 1, 2)
    assert res_same_nak_diff_rashi["is_cancelled"]
    assert res_same_nak_diff_rashi["points"] == 8.0
    
    # 5. Classically Exempt Nakshatras (Rohini 3 and Shravana 21 - both Antya Nadi, both in exempt list)
    # Must be cancelled -> 8.0 points!
    res_exempt = calculate_nadi(3, 21, 1, 9, 1, 1)
    assert res_exempt["is_cancelled"]
    assert res_exempt["points"] == 8.0


def test_mangal_dosha_and_cancellations():
    # Mars in 1st in Aries (own sign) -> CANCELLED
    m1 = check_mangal_dosha(mars_sign_idx=0, mars_house=1, moon_sign_idx=4, venus_sign_idx=5)
    assert m1["is_cancelled"]
    assert m1["severity"] == "Cancelled"
    
    # Mars in 8th in Cancer (debilitated) -> CANCELLED
    m2 = check_mangal_dosha(mars_sign_idx=3, mars_house=8, moon_sign_idx=4, venus_sign_idx=5)
    assert m2["is_cancelled"]
    
    # Mars in 7th in Gemini (unexempt) -> ACTIVE
    m3 = check_mangal_dosha(mars_sign_idx=2, mars_house=7, moon_sign_idx=4, venus_sign_idx=5)
    assert not m3["is_cancelled"]
    assert m3["is_present"]


def test_dosha_samya():
    # Both cancelled / no dosha -> Harmony
    m_clean = {"is_cancelled": True, "afflicted_from": {"lagna": False, "moon": False, "venus": False}}
    res_clean = calculate_dosha_samya(m_clean, m_clean)
    assert res_clean["is_balanced"]
    assert "Complete Harmony" in res_clean["verdict"]
    
    # Both having Lagna Mars -> Dosha Samya Achieved
    m_aff = {"is_cancelled": False, "afflicted_from": {"lagna": True, "moon": False, "venus": False}}
    res_matched = calculate_dosha_samya(m_aff, m_aff)
    assert res_matched["is_balanced"]
    assert "Dosha Samya Achieved" in res_matched["verdict"]
