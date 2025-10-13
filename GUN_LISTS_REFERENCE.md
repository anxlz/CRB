# Gun Lists Reference for /setgunsmenu Command

This document contains all pre-configured gun lists organized by category. Banned guns have been excluded.

## Command Format
```
/setgunsmenu category:<CATEGORY> list1:<guns> list2:<guns> ...
```

## Banned Guns (Excluded from all lists)
- NA-45
- SVD
- XPR-50
- XPR
- Thumper
- Shorty
- SMRS
- FHJ-18
- Argus
- D13 Sector

---

## Assault Rifles (AR)
**Total: 34 guns across 4 lists**

### Usage Example:
```
/setgunsmenu category:AR list1:M4,AK117,AK-47,Type 25,ASM10,BK57,LK24,M16,ICR-1,Man-O-War list2:HBRa3,KN-44,HVK-30,DR-H,Peacekeeper MK2,FR .556,AS VAL,CR-56 AMAX,M13,Swordfish list3:Kilo 141,Oden,Krig 6,EM2,Maddox,FFAR 1,Grau 5.56,Groza,Type 19,BP50 list4:LAG 53,XM4,Vargo-S,RAM-7
```

**list1:** M4,AK117,AK-47,Type 25,ASM10,BK57,LK24,M16,ICR-1,Man-O-War

**list2:** HBRa3,KN-44,HVK-30,DR-H,Peacekeeper MK2,FR .556,AS VAL,CR-56 AMAX,M13,Swordfish

**list3:** Kilo 141,Oden,Krig 6,EM2,Maddox,FFAR 1,Grau 5.56,Groza,Type 19,BP50

**list4:** LAG 53,XM4,Vargo-S,RAM-7

---

## Submachine Guns (SMG)
**Total: 29 guns across 3 lists**

### Usage Example:
```
/setgunsmenu category:SMG list1:RUS-79U,PDW-57,HG 40,Chicom,MSMC,Razorback,Pharo,GKS,Cordite,QQ9 list2:Fennec,AGR 556,QXR,PP19 Bizon,MX9,CBR4,PPSh-41,MAC-10,KSP 45,Switchblade X9 list3:LAPA,OTs 9,Striker 45,CX-9,TEC-9,ISO,USS 9,VMP,Sten
```

**list1:** RUS-79U,PDW-57,HG 40,Chicom,MSMC,Razorback,Pharo,GKS,Cordite,QQ9

**list2:** Fennec,AGR 556,QXR,PP19 Bizon,MX9,CBR4,PPSh-41,MAC-10,KSP 45,Switchblade X9

**list3:** LAPA,OTs 9,Striker 45,CX-9,TEC-9,ISO,USS 9,VMP,Sten

---

## Sniper Rifles (SNIPER)
**Total: 11 guns across 2 lists** *(Excluded: NA-45, SVD, XPR-50)*

### Usage Example:
```
/setgunsmenu category:SNIPER list1:DL Q33,M21 EBR,Arctic .50,Locus,Outlaw,Rytec AMR,Koshka,ZRG 20mm,HDR,LW3-Tundra list2:3-Line Rifle
```

**list1:** DL Q33,M21 EBR,Arctic .50,Locus,Outlaw,Rytec AMR,Koshka,ZRG 20mm,HDR,LW3-Tundra

**list2:** 3-Line Rifle

---

## Light Machine Guns (LMG)
**Total: 13 guns across 2 lists**

### Usage Example:
```
/setgunsmenu category:LMG list1:RPD,M4LMG,UL736,S36,Chopper,Holger 26,Hades,PKM,Dingo,Bruen MK9 list2:MG42,RAAL MG,MG 82
```

**list1:** RPD,M4LMG,UL736,S36,Chopper,Holger 26,Hades,PKM,Dingo,Bruen MK9

**list2:** MG42,RAAL MG,MG 82

---

## Shotguns (SHOTGUN)
**Total: 10 guns across 1 list** *(Excluded: Argus)*

### Usage Example:
```
/setgunsmenu category:SHOTGUN list1:BY15,Striker,HS2126,HS0405,KRM-262,Echo,R9-0,JAK-12,VLK Rogue,Einhorn Revolving
```

**list1:** BY15,Striker,HS2126,HS0405,KRM-262,Echo,R9-0,JAK-12,VLK Rogue,Einhorn Revolving

---

## Marksman Rifles (MARKSMAN)
**Total: 7 guns across 1 list**

### Usage Example:
```
/setgunsmenu category:MARKSMAN list1:Kilo Bolt-Action,SKS,SP-R 208,MK2,Type 63,M1 Garand,SO-14
```

**list1:** Kilo Bolt-Action,SKS,SP-R 208,MK2,Type 63,M1 Garand,SO-14

---

## Pistols (PISTOL)
**Total: 9 guns across 1 list** *(Excluded: Shorty)*

### Usage Example:
```
/setgunsmenu category:PISTOL list1:MW11,J358,.50 GS,Renetti,Crossbow,L-CAR 9,Dobvra,Nail Gun,Machine Pistol
```

**list1:** MW11,J358,.50 GS,Renetti,Crossbow,L-CAR 9,Dobvra,Nail Gun,Machine Pistol

---

## Features

✅ **Multi-Select Menu**: Users can select multiple guns from the menu
✅ **Up to 25 guns per menu**: Discord's select menu limit
✅ **Multiple lists supported**: Combine up to 24 list parameters
✅ **Banned guns filtered**: Automatically excludes banned weapons
✅ **Flexible categories**: Use any category name you want

## Notes

- The command supports up to 24 list parameters (list1 through list24) plus 1 category = 25 total options
- Each list can contain comma-separated gun names
- All lists are combined into a single multi-select menu
- Users can select multiple guns at once from the menu
- Maximum 25 guns can be displayed in a single menu (Discord limitation)
