# design-skills

Claude Code plugin marketplace עם סקילים לעיצוב, תנועה וכיוון קריאייטיב.

## design-director

סקיל עיצוב **אישי שמשתפר מפרויקט לפרויקט**. הוא לוקח כל פרויקט React / Next.js + Tailwind לשלב הבא:

| שלב | מה קורה |
|---|---|
| **1. אבחון** | זיהוי הסטאק, צילומי מסך (רוחבים × בהיר/כהה × RTL/LTR), ציון לפי רובריקה של 12 ממדים |
| **2. כיוון** | 2–3 כיוונים קריאייטיב שונים באמת, כל אחד עם *signature element* — בלי "המראה הגנרי של AI" |
| **3. מערכת** | טוקנים ב-OKLCH, טיפוגרפיה נזילה, מצב כהה מעוצב, בדיקת ניגודיות אוטומטית (WCAG + APCA) |
| **4. תנועה** | מערכת תנועה: משכים, easing, springs, כוריאוגרפיה — מצב **מוצר** (פונקציונלי) ומצב **שיווקי** (אקספרסיבי) |
| **5. מימוש** | קוד אמיתי: CSS מודרני, Motion, GSAP, View Transitions, R3F — הכלי הקל ביותר שעושה את העבודה |
| **0. זיכרון** | לפני שמתחילים: הטעם שלך, סגנון העבודה שלך, הלקחים מהפרויקט הקודם, והתקנת שומרי האיכות |
| **6. אימות** | צילום → ביקורת → תיקון, כולל filmstrip לאנימציות, scroll-through, בדיקת זרימות, נגישות וביצועים |
| **7. רטרוספקטיבה** | דף דירוג של מה שנבנה, ומה שהסקיל מסיק מהשיחה. הלקחים הופכים לשינויים בסקיל, ב-PR שאתה מאשר |

### איך הסקיל משתפר

| מה מצטבר | איפה | מה זה נותן בפרויקט הבא |
|---|---|---|
| **הטעם שלך** | `owner/taste-profile.md` | הצעות שמתאימות לך כבר מהפעם הראשונה. לכל העדפה יש משקל מ-3− עד 3+ ומקור |
| **סגנון העבודה שלך** | `owner/working-style.md` | עבודה בדרך שמתאימה לך: קודם הגדרה, ואז דוגמאות חיות לדירוג. כולל מגבלות ידועות של הסביבה |
| **סולם המלכודות** | `references/pitfalls.md` | כל לקח מטפס בסולם: הערה, כלל, בדיקה אוטומטית, רכיב מוכן. טעות שקרתה פעם אחת לא חוזרת |
| **ספריית רכיבים** | `patterns/` | רכיבים שאהבת, מוכנים לשימוש ומתוקנים מראש |
| **יומן ומדדים** | `owner/projects.md` | בעיות בגרסה הראשונה, כמה נתפסו בבדיקה ולא בעין, סבבי תיקון. כך רואים אם האיכות באמת עולה |
| **כיול המועצה** | `design-council/learning/calibration.md` | הכרעות שקרובות יותר למה שאתה מאשר |

פקודות: `/design-retro` מריץ רטרוספקטיבה, ו-`/design-kit` מתקין בפרויקט חדש את ה-lint ל-RTL, את בדיקת הניגודיות, את ה-CI ואת `vercel.json`.

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
│   ├── a11y-performance.md     WCAG 2.2, Core Web Vitals, תקציב אפקטים
│   ├── pitfalls.md             סולם המלכודות: הערה, כלל, בדיקה, רכיב
│   └── retrospective.md        תהליך השיפור העצמי
├── owner/                      הטעם שלך, סגנון העבודה שלך, ויומן הפרויקטים
├── patterns/                   רכיבים מוכנים: UI kit, טאבים, כפתור עם מצבים, התראות, מגירה, מעברים
├── kit/                        שומרי איכות לכל פרויקט (install-kit.mjs, check-logical.mjs)
├── scripts/
│   ├── capture.mjs             צילומי מסך / filmstrip / scroll-through (PNG או JPEG)
│   ├── contrast.mjs            בדיקת ניגודיות WCAG + APCA מקובץ CSS אחד או יותר
│   ├── retro.mjs               איסוף עובדות לרטרוספקטיבה
│   └── build-rating-page.mjs   בניית דף הדירוג מצילומי המסך
└── templates/
    ├── globals.css             שכבת טוקנים ל-Tailwind v4 (תואם shadcn/ui)
    ├── motion.css              טוקני תנועה, view transitions, scroll reveal, reduced motion
    ├── motion.ts               presets ל-Motion for React, מודע לכיוון
    └── rating-page.html        תבנית דף הדירוג
```

## design-council

מועצת עיצוב שבוחנת פרויקט במצבו הנוכחי ומחליטה לאן הוא הולך מבחינת עיצוב וחוויה: מה מתאים לשלב הזה, שלושת הצעדים הבאים, ומה במפורש לא עושים עכשיו.

| | |
|---|---|
| **חברים** | יו"ר (ראש עיצוב), מנהל קריאייטיב, חוקר חוויית משתמש, מעצב מוצר ואינטראקציה, מוביל design system, מוביל עיצוב מכליל (נגישות, ביצועים, RTL/LTR, עם זכות וטו), מהנדס עיצוב, פרקליט השטן |
| **מצבים** | **מהיר**: דיון אחד עם כל הקולות. **מלא**: כל חבר כסוכן נפרד, בלי לראות את האחרים, ואחריו סבב ביקורת והכרעה |
| **שלבי פרויקט** | רעיון, אב-טיפוס, MVP, צמיחה, בוגר, עיצוב מחדש. לכל שלב מוגדר מה משקיעים ומה נמנעים |
| **תוצר** | `.council/DIRECTION.md` (הכיוון החי) ו-`.council/decisions/NNNN-*.md` (יומן החלטות עם דעות מיעוט ותנאים לדיון חוזר) |
| **הפעלה** | `/council [שאלה] [--quick\|--full]`, או שאלות כיוון כמו "לאן להמשיך?" או "כדאי לעשות X עכשיו?" |

`design-director` קורא את `.council/DIRECTION.md` ומכבד החלטות שהתקבלו.

```
plugins/design-council/
├── commands/council.md             הפקודה /council
└── skills/design-council/
    ├── SKILL.md                    תהליך הכינוס
    ├── members/                    8 חברים: מנדט, שאלות, ראיות, הטיה מוכרת
    ├── references/                 שלבים, תיק מצב, פרוטוקול דיון, פורמט החלטות
    ├── templates/                  הערכה, חקירה נגדית, רשומת החלטה, DIRECTION.md
    └── scripts/dossier.mjs         סריקה אוטומטית של הפרויקט והצעת שלב
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
    "design-director@design-skills": true,
    "design-council@design-skills": true
  }
}
```

### ידנית, ב-Claude Code

```
/plugin marketplace add i-sh-sh/design-skills
/plugin install design-director@design-skills
/plugin install design-council@design-skills
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
