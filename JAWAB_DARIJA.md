# Risala men AI (Antigravity) 🤖

## Kho, rani hllit l-mochkila dyal `Error 400`. ✅

L-mochkila kant f an l-form kadefa3 chi ma3loumat (b7al `german_level`, `sap_track`, `experience_years`) li ba9i ma 3ndekch f l-base de données.
Daba rani **desactivithoum** bach t9dar t-inscrire bla machakil.

### Ach dir db:
1. **Refresh** l page dyal Talent Pool: `http://localhost:8080/talent-pool`
2. 3awd 3mar l-informatioln dyalek.
3. Ghadi doz lik l-inscription mzyan bla error! 🎉

### Mola7ada Mohima:
Hadouk l-ma3loumat zayda (`german_level`, etc.) **maghadinch itsajlou db** 7itach desactivithoum mo2a9atan.
Bach itsajlou, khassek darouri t-runni hadak l-script SQL li 3titk f **Supabase SQL Editor**:

```sql
ALTER TABLE applications ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS german_level text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS sap_track text;
```

Walakin l-mohim huwa l-inscription ghada doz db!
Projet khdam mzyan.
