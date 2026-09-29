# design-skills

Claude Code plugin marketplace עם סקילים לעיצוב, תנועה וכיוון קריאייטיב.

## design-director

סקיל שלוקח כל פרויקט React / Next.js + Tailwind לשלב הבא:

| שלב | מה קורה |
|---|---|
| **1. אבחון** | זיהוי הסטאק, צילומי מסך (רוחבים × בהיר/כהה × RTL/LTR), ציון לפי רובריקה של 12 ממדים |
| **2. כיוון** | 2–3 כיוונים קריאייטיב שונים באמת, כל אחד עם *signature element* — בלי "המראה הגנרי של AI" |
| **3. מערכת** | טוקנים ב-OKLCH, טיפוגרפיה נזילה, מצב כהה מעוצב, בדיקת ניגודיות אוטומטית (WCAG + APCA) |
| **4. תנועה** | מערכת תנועה: משכים, easing, springs, כוריאוגרפיה — מצב **מוצר** (פונקציונלי) ומצב **שיווקי** (אקספרסיבי) |
| **5. מימוש** | קוד אמיתי: CSS מודרני, Motion, GSAP, View Transitions, R3F — הכלי הקל ביותר שעושה את העבודה |
| **6. אימות** | צילום → ביקורת → תיקון, כולל filmstrip לאנימציות ו-scroll-through, נגישות וביצועים |

עברית ואנגלית שוות ערך: logical properties בלבד, אנימציות שמתהפכות לפי כיוון, זוגות גופנים עבריים-לטיניים, ובדיקה בשני הכיוונים.

### מבנה

```
plugins/design-director/skills/design-director/
├── SKILL.md                    תהליך העבודה והכללים
├── references/                 ידע שנטען לפי צורך
│   ├── audit-rubric.md         רובריקת אבחון + פורמט דוח
│   ├── creative-direction.md   בריף, אנטי-גנרי, ארכיטיפים, signature element
│   ├── design-system.md        טוקנים, OKLCH, dark mode, טיפוגרפיה, Tailwind v4
│   ├── motion.md               עקרונות, טוקנים, בחירת כלי, תבניות קוד
│   ├── modern-css.md           קטלוג פיצ'רים עם רמות תמיכה ו-fallbacks
│   ├── creative-tech.md        kinetic type, scroll stories, shaders, 3D, SVG
│   ├── bidi.md                 RTL ⇄ LTR: layout, גופנים, תוכן מעורב, תנועה
│   └── a11y-performance.md     WCAG 2.2, Core Web Vitals, תקציב אפקטים
├── scripts/
│   ├── capture.mjs             צילומי מסך / filmstrip / scroll-through (Playwright)
│   └── contrast.mjs            בדיקת ניגודיות WCAG + APCA ישירות מקובץ CSS
└── templates/
    ├── globals.css             שכבת טוקנים ל-Tailwind v4 (תואם shadcn/ui)
    ├── motion.css              טוקני תנועה, view transitions, scroll reveal, reduced motion
    └── motion.ts               presets ל-Motion for React, מודע לכיוון
```

## התקנה

### בכל פרויקט, אוטומטית (מומלץ)

הוסיפו ל-`.claude/settings.json` של הפרויקט — כך הסקיל זמין לכל מי שעובד על הפרויקט, כולל סשנים בענן:

```json
{
  "extraKnownMarketplaces": {
    "design-skills": {
      "source": { "source": "github", "repo": "i-sh-sh/design-skills" }
    }
  },
  "enabledPlugins": {
    "design-director@design-skills": true
  }
}
```

### ידנית, ב-Claude Code

```
/plugin marketplace add i-sh-sh/design-skills
/plugin install design-director@design-skills
```

עדכון: `/plugin marketplace update design-skills`.

> הריפו פרטי? צריך הרשאת קריאה אליו (git credentials מקומיים, או גישת GitHub בסשן הענן).

## שימוש

הסקיל מופעל אוטומטית בבקשות עיצוב ("שדרג את דף הנחיתה", "תוסיף אנימציות לדשבורד", "תבנה design system עם dark mode"), או ידנית:

```
/design-director:design-director שדרג את דף הבית
```

הסקריפטים עובדים גם עצמאית:

```bash
node <skill>/scripts/capture.mjs --url http://localhost:3000 --widths 390,1440 --themes light,dark --dirs ltr,rtl
node <skill>/scripts/contrast.mjs --css app/globals.css
```

## פיתוח הסקיל

- `evals/evals.json` — פרומפטים לבדיקה (with-skill מול baseline).
- כל שינוי ב-`templates/` — לוודא קומפילציה עם Tailwind v4 ו-typecheck של `motion.ts` מול `motion`.
- מספרי גרסה: `plugins/design-director/.claude-plugin/plugin.json` ו-`.claude-plugin/marketplace.json`.
