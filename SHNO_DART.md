# Chno dert bach nsal7o l-mochkil 🛠️

Salam kho.
Hada howa char7 mbassat dyal chno dert bach n7ello l-mochkil dyal **Error 400**:

1. **L-mochkil fin kan?**
   L-code dyal l-page `TalentPoolPage.tsx` kan kaysifet 3 dyal l-ma3loumat zayda l `Supabase`:
   - `experience_years`
   - `german_level`
   - `sap_track`
   
   Walakin l-table `applications` f l-base de données dyalek **ma fihach had l-colonnes**. Dakchi 3lach Supabase kan kayrjje3 "Error 400" (ya3ni 'mafhmtch hadchi li siftili').

2. **Chno dert ana? (L-7el l-mo2a99at)**
   Mchit l l-fichier `TalentPoolPage.tsx` w "desactivit" (commented out) hadok l-tlat dyal l-champs.
   Ya3ni daba l-form walat katsifet ghir l-ma3loumat l-asasiya (smiya, email, cv...) li dija 3ndhom blast-hom f l-base de données.
   **Natija:** L-inscription ghatkhdem mzyan bla error.

3. **Chno khassek dir bach tkhdem 100%? (L-7el l-niha2i)**
   Bach tba9a tkhzen hadok l-ma3loumat (`experience`, `german`, `sap`), khassek tzidhom f l-base de données dyalek.
   Khassek t-runni hadak l-script SQL li 3titk f **Supabase SQL Editor**:

   ```sql
   ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
   ALTER TABLE applications ADD COLUMN IF NOT EXISTS german_level text;
   ALTER TABLE applications ADD COLUMN IF NOT EXISTS sap_track text;
   ```

   Ila drti hadchi, ymken lina nraj3o l-code kima kan bach ybda ysauvegardihum. Walakin daba, "l-inscription" ra khdama.
