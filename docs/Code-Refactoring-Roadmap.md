# 🛠️ Code Refactoring Roadmap (Post-MVP)

_A concise, phased plan to eliminate duplication, enforce DRY principles, and prepare the Gigavibe codebase for long-term scalability.  All changes begin **after MVP user testing** and will be executed in non-breaking feature branches._

---

## 🔎 Background

Internal review surfaced clusters of duplicated logic that increase maintenance cost:

• **Challenge domain** – two independent `ChallengeService` implementations  
• **Audio domain** – four overlapping playback/recording services + scattered hooks  
• **API layer** – `ApiService` _and_ `fetcher.ts` wrap fetch separately  
• **Hooks** – `useChallenge` vs `useUnifiedChallenge`, multiple audio hooks repeating logic  
• **File layout** – services split between `src/services/` and `src/lib/` with no clear rule  

The roadmap below resolves these issues while aligning with existing architecture guidelines (modular, service-oriented, TypeScript-first).

---

## 📅 Phased Implementation

| Phase | Goal | Key Tasks | Duration* |
|-------|------|-----------|-----------|
| **1. Inventory & Test Coverage** | Freeze behaviour before refactor | • Catalogue runtime usages of duplicated modules<br>• Add snapshot/unit tests around public APIs of duplicated services & hooks | 1 week |
| **2. Service Consolidation** | Single source of truth per domain | • Select canonical implementation (e.g. keep `src/services/ChallengeService.ts`)<br>• Merge features from secondary versions into canonical file<br>• Deprecate superseded files with TODO banner | 1-2 weeks |
| **3. Hook Unification** | Remove overlapping state logic | • Collapse `useChallenge` into `useUnifiedChallenge`<br>• Merge audio-related hooks into `useAudioPlayback`, `useAudioRecording`, `useAudioAnalysis` | 1 week |
| **4. Directory Re-org** | Clear, predictable structure | ```
src/
  services/        # all domain services
    audio/
    challenge/
    api/
  hooks/
    audio/
    challenges/
  utils/
  types/
``` |
| **5. API Layer DRY-ing** | One HTTP wrapper | • Fold `fetcher.ts` logic into `ApiService` (or vice-versa)<br>• Export typed helper: `api.fetch<T>(endpoint, opts)` | 2-3 days |
| **6. Gradual Migration** | Swap imports safely | • Provide codemod scripts / eslint rule to forbid old paths<br>• Update imports module-by-module, run test suite | 1-2 weeks |
| **7. Hardening & Cleanup** | Remove deprecated files | • Delete deprecated services/hooks after green CI<br>• Final lint pass & documentation updates | 2-3 days |

_*Rough estimates; adjust based on team capacity._

---

## 🧩 Non-Functional Requirements

1. **No Breaking Changes Before GA** – refactor branches stay behind a feature flag or are merged only after MVP feedback is incorporated.  
2. **Automated Tests Required** – every consolidated module must reach baseline coverage before deleting duplicates.  
3. **CI Gates** – lint, type-check, unit + integration tests must pass on each phase branch.  
4. **Documentation** – update `docs/Technical.md` + component READMEs per phase.

---

## ✅ Definition of Done

- Zero duplicate domain services or hooks in `main`
- All modules live in the agreed directory structure
- API surface documented in `/docs/Technical.md`
- Test coverage ≥ previous baseline
- Developer onboarding time reduced (subjective survey)

---

## ✋ Next Steps

1. Maintain this roadmap in sync with `docs/Roadmap.md` milestones.  
2. Open **`refactor/phase-1-inventory`** branch once MVP feedback window closes.  
3. Track progress via GitHub project board **“DRY Refactor”**.

Together these steps will keep the codebase **clean, modular, and performant** as Gigavibe scales beyond the MVP.
