const templates=[
['vanguard_blade','Vanguard Blade','weapon','blade','attack'],['arcane_focus','Arcane Focus','weapon','staff','attack'],['falcon_device','Falcon Device','weapon','ranged','attack'],
['guard_helm','Guardian Helm','helmet','helmet','defense'],['mystic_hood','Mystic Hood','helmet','hood','hp'],['eagle_cap','Eagle Cap','helmet','cap','critRate'],
['plate_armor','Old Kingdom Plate','armor','armor','defense'],['sage_robe','Sage Moon Robe','armor','robe','hp'],['ranger_coat','Ranger Field Coat','armor','coat','attackSpeed'],
['iron_boots','Iron March Boots','boots','boots','defense'],['wind_boots','Windrunner Boots','boots','boots','attackSpeed'],['pilgrim_shoes','Pilgrim Shoes','boots','boots','hp'],
['ruby_ring','Ruby Oath Ring','ring','ring','attack'],['emerald_ring','Emerald Guard Ring','ring','ring','defense'],['sapphire_ring','Sapphire Focus Ring','ring','ring','critRate'],
['sun_necklace','Suncrest Necklace','necklace','necklace','hp'],['moon_necklace','Moonwell Necklace','necklace','necklace','attack'],['wolf_necklace','Wolf Fang Necklace','necklace','necklace','critDamage'],
['steel_gloves','Steelbreaker Gloves','gloves','gloves','attack'],['silk_gloves','Silkweave Gloves','gloves','gloves','attackSpeed'],['healer_gloves','Dawn Healer Gloves','gloves','gloves','hp'],
['war_belt','War Captain Belt','belt','belt','defense'],['rune_belt','Runic Channel Belt','belt','belt','attack'],['traveler_belt','Traveler Supply Belt','belt','belt','hp'],
['phoenix_feather','Phoenix Feather','accessory','feather','critDamage'],['ancient_compass','Ancient Compass','accessory','compass','attackSpeed'],['guardian_charm','Guardian Charm','accessory','charm','defense'],
['firstlight_blade','Firstlight Blade','weapon','blade','attack'],['void_focus','Voidglass Focus','weapon','staff','critRate'],['storm_device','Stormcoil Device','weapon','ranged','attackSpeed'],
['dragon_helm','Dragoncrest Helm','helmet','helmet','defense'],['celestial_armor','Celestial Armor','armor','armor','hp'],['shadow_boots','Shadowstep Boots','boots','boots','attackSpeed'],
['king_ring','Kingmaker Ring','ring','ring','critDamage'],['oracle_necklace','Oracle Necklace','necklace','necklace','critRate'],['mythic_emblem','Mythic Hero Emblem','accessory','charm','attack']];
export const equipmentCatalog=Object.freeze(templates.map(([id,name,slot,icon,mainStat],index)=>({id,name,slot,icon,mainStat,basePower:8+index*1.35,allowedHeroes:slot==='weapon'?(icon==='blade'?['fighter','holySword']:icon==='staff'?['mage','healer']:['gunner']):null})));
export const equipmentMap=Object.fromEntries(equipmentCatalog.map(item=>[item.id,item]));
