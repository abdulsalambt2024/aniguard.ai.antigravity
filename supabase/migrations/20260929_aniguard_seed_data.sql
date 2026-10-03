-- AniGuard Seed Data Migration
-- Verified ICAR / WOAH disease data, Breeds, Livestock Herd & Clinical Records

-- 1. Insert Verified Diseases from ICAR / WOAH
INSERT INTO public.diseases (code, name, scientific_name, species_affected, disease_category, causative_agent, key_symptoms, milk_impact_description, prevention_guidance, vaccine_guidance, zoonotic_risk, economic_impact, veterinary_urgency, tier, reference_source, source_url)
VALUES
(
    'MAS001',
    'Bovine Mastitis',
    'Mastitis bovis',
    ARRAY['Cow', 'Buffalo'],
    'Inflammatory / Bacterial',
    'Staphylococcus aureus, Streptococcus uberis, E. coli',
    ARRAY['Swollen hot udder', 'Abnormal milk clots or watery milk', 'Drop in milk production', 'Fever', 'Reduced appetite'],
    'Significant sudden or progressive drop in milk yield (15-40%), altered composition, elevated somatic cell count.',
    'Strict post-milking teat dipping, clean and dry bedding, milking machine calibration, early detection using California Mastitis Test (CMT).',
    'Herd-specific bacterin vaccines available under veterinary guidance; no universal single vaccine.',
    FALSE,
    'Highest economic loss in dairy sector; premature culling, milk disposal, veterinary treatment costs.',
    'High',
    1,
    'ICAR - Central Institute for Research on Buffaloes / NDRI',
    'https://icar.org.in'
),
(
    'LSD001',
    'Lumpy Skin Disease (LSD)',
    'Capripoxvirus',
    ARRAY['Cow', 'Buffalo'],
    'Viral',
    'Lumpy skin disease virus (Poxviridae)',
    ARRAY['High fever (40-41°C)', 'Firm nodular skin lesions (2-5 cm)', 'Swollen lymph nodes', 'Edema of limbs and brisket', 'Excessive salivation', 'Lacrimation', 'Severe drop in milk'],
    'Sharp acute drop in milk yield (up to 50%), persistent loss during convalescence.',
    'Mosquito/fly/tick vector control, strict quarantine of new livestock, disinfection with 1% formalin or 2% sodium hypochlorite.',
    'Homologous live attenuated goat pox vaccine or Lumpi-ProVacInd under DAHD/state veterinary protocols.',
    FALSE,
    'Permanent hide damage, mastitis complications, severe milk loss, fertility impairment.',
    'High',
    1,
    'WOAH - World Organisation for Animal Health / DAHD India',
    'https://www.woah.org/en/disease/lumpy-skin-disease/'
),
(
    'FMD001',
    'Foot-and-Mouth Disease (FMD)',
    'Aphthovirus',
    ARRAY['Cow', 'Buffalo', 'Goat', 'Sheep'],
    'Viral',
    'Aphthovirus serotypes O, A, Asia-1',
    ARRAY['High fever', 'Blisters and erosions on tongue, dental pad and gums', 'Excessive ropy salivation', 'Vesicles between hooves causing lameness', 'Teat blisters'],
    'Drastic and rapid drop in milk production; chronic loss in high-producing exotic crosses.',
    'Biosecurity, strict animal movement controls, isolation of suspect cases, 4% sodium carbonate surface washing.',
    'Bivalent or trivalent inactivated oil-adjuvant vaccine administered biannually under National Animal Disease Control Programme (NADCP).',
    FALSE,
    'Severe trade restrictions, global quarantine, long-term milk reduction, calf mortality.',
    'Emergency',
    1,
    'WOAH / DAHD - National Animal Disease Control Programme',
    'https://www.woah.org/en/disease/foot-and-mouth-disease/'
),
(
    'HS001',
    'Hemorrhagic Septicemia (HS)',
    'Pasteurellosis',
    ARRAY['Cow', 'Buffalo'],
    'Bacterial',
    'Pasteurella multocida serotype B:2',
    ARRAY['Sudden high fever', 'Swelling in throat, brisket and submandibular area', 'Severe respiratory distress with grunting', 'Profuse salivation', 'Prostration'],
    'Immediate complete cessation of milk output accompanied by acute toxic prostration.',
    'Avoid grazing in waterlogged pastures during monsoon, protect from cold stress, immediate isolation.',
    'Alum precipitated or oil adjuvant HS vaccine administered pre-monsoon (May-June).',
    FALSE,
    'High mortality rate (up to 80% without immediate antibiotic treatment), acute loss of productive draft and dairy stock.',
    'Emergency',
    1,
    'ICAR-IVRI / ICAR-NIVEDI NADRES v2',
    'https://icar.org.in'
),
(
    'BL001',
    'Blackleg',
    'Clostridial myositis',
    ARRAY['Cow', 'Buffalo', 'Sheep'],
    'Bacterial',
    'Clostridium chauvoei',
    ARRAY['Acute lameness', 'Hot painful crackling crepitus swellings over thighs/shoulders', 'High fever', 'Depression', 'Rapid prostration'],
    'Immediate milk drop; rapid fatality often within 12-48 hours if untreated.',
    'Proper carcass disposal by deep burial with lime, avoid disturbing spore-laden soil pastures.',
    'Polyvalent clostridial bacterin pre-monsoon vaccination in endemic areas.',
    FALSE,
    'Sudden mortality in fast-growing healthy young cattle (6-24 months).',
    'Emergency',
    1,
    'MSD Veterinary Manual / ICAR',
    'https://www.msdvetmanual.com'
),
(
    'BRU001',
    'Bovine Brucellosis',
    'Brucellosis',
    ARRAY['Cow', 'Buffalo'],
    'Bacterial / Zoonotic',
    'Brucella abortus',
    ARRAY['Late-term abortion (7th-8th month)', 'Retention of fetal membranes', 'Metritis', 'Hygromas in joints', 'Reduced milk'],
    'Moderate to chronic decline in milk yield; milk safety risk.',
    'Hygienic disposal of aborted fetuses and placenta, testing and segregation, pasteurization of all dairy products.',
    'Brucella abortus Strain 19 or RB51 calfhood vaccination (4-8 months female calves only).',
    TRUE,
    'Zoonotic Undulant Fever in farmers and veterinarians; long-term reproductive losses.',
    'High',
    1,
    'WOAH / FAO / ICAR-NIVEDI',
    'https://www.woah.org'
)
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Indian Government Livestock Schemes
INSERT INTO public.govt_schemes (scheme_name, nodal_agency, target_benefit, subsidy_percentage, eligibility_criteria, application_portal_url, category)
VALUES
(
    'Rashtriya Gokul Mission (RGM)',
    'Department of Animal Husbandry and Dairying (DAHD)',
    'Genetic upgradation of bovine population, free artificial insemination with sex-sorted semen, establishment of Gokul Grams.',
    '50% capital subsidy up to ₹2 Crore for breed multiplication farms',
    'Individual farmers, SHGs, FPOs, Cooperatives possessing land and basic dairy infrastructure.',
    'https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission',
    'Breed Improvement & Multiplication'
),
(
    'Pashu Kisan Credit Card (KCC) for Animal Husbandry',
    'Ministry of Fisheries, Animal Husbandry & Dairying & RBI',
    'Collateral-free working capital loan up to ₹1.60 Lakh (and up to ₹3 Lakh at concessional interest rate of 4% with prompt repayment incentive).',
    '3% prompt repayment subvention',
    'Dairy farmers owning indigenous/crossbred cows or buffaloes with active bank account and Aadhaar.',
    'https://pib.gov.in/PressReleasePage.aspx?PRID=1646270',
    'Working Capital & Credit Support'
),
(
    'Livestock Insurance Scheme (National Livestock Mission)',
    'DAHD / State Livestock Development Boards',
    'Financial protection against death of animals due to natural calamities, diseases, surgical complications, and accidents.',
    '50% to 70% premium subsidy (up to 5 cattle per beneficiary family)',
    'Small, marginal and landless dairy farmers owning registered tagged indigenous or crossbred cattle.',
    'https://dahd.nic.in/schemes/programmes/national-livestock-mission',
    'Risk Management & Insurance'
),
(
    'Animal Husbandry Infrastructure Development Fund (AHIDF)',
    'Central Government (DAHD) & NABARD',
    'Incentivizing investments in dairy processing, meat processing, animal feed plants, and breed improvement technology.',
    '3% interest subvention with 2-year moratorium and credit guarantee up to 25%',
    'Dairy entrepreneurs, private MSMEs, FPOs, section 8 companies.',
    'https://ahidf.udyamimitra.in',
    'Infrastructure & Processing'
)
ON CONFLICT DO NOTHING;
