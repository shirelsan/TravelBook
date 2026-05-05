# TravelBook ✈️
אפליקציית React לניהול יומן מסעות

## התקנה והפעלה

### שלב 1 – התקן את json-server
```bash
npm install -g json-server
```

### שלב 2 – הפעל את השרת המקומי
```bash
# מהתיקייה הראשית של הפרויקט
json-server --watch server/db.json --port 3001
```

### שלב 3 – הפעל את אפליקציית React
```bash
npm install
npm start
```

האפליקציה תפתח בכתובת: http://localhost:3000

---

## משתמשי דמו
| Username | Password |
|----------|----------|
| Bret     | pass1234 |
| Antonette| pass1234 |
| Samantha | pass1234 |

---

## מבנה הפרויקט
```
travelbook/
├── server/
│   └── db.json              ← מסד הנתונים של JSON-Server
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AuthContext.jsx  ← ניהול משתמש מחובר (Local Storage)
│   ├── services/
│   │   └── api.js           ← כל קריאות ה-REST API
│   ├── components/
│   │   ├── ProtectedRoute.jsx
│   │   └── InfoModal.jsx
│   ├── pages/
│   │   ├── Login.jsx        ← /login
│   │   ├── Register.jsx     ← /register (שני שלבים)
│   │   ├── Home.jsx         ← /home (layout עם sidebar)
│   │   ├── Todos.jsx        ← /home/todos
│   │   ├── Posts.jsx        ← /home/posts
│   │   └── Albums.jsx       ← /home/albums + /home/albums/:albumId
│   ├── styles/
│   │   └── ...              ← קבצי CSS
│   ├── App.jsx              ← React Router ראשי
│   └── index.js
└── package.json
```

---

## דרישות שמומשו ✅

### חלק א – מבנה המידע
- [x] db.json מבוסס על jsonplaceholder עם נתוני מסעות

### חלק ב – JSON-Server
- [x] שרת מקומי על port 3001
- [x] תמונות מ-picsum.photos (במקום placeholder הפגום)

### חלק ג – React
- [x] `/login` – login עם username + password
- [x] `/register` – שני שלבים (בדיקת username + פרטים מלאים)
- [x] `/home` – sidebar עם כפתורים: Info, Todos, Posts, Albums, Logout
- [x] כפתור Info – modal עם פרטי המשתמש
- [x] כפתור Logout – מחיקת Local Storage + חזרה ל-login
- [x] URL אינפורמטיבי לכל עמוד
- [x] Local Storage לשמירת המשתמש המחובר

### חלק ד – Todos
- [x] הצגת רשימת todos של המשתמש הפעיל
- [x] id + כותרת + checkbox ביצוע
- [x] select למיון (id / כותרת / ביצוע)
- [x] חיפוש (id / כותרת / מצב)
- [x] הוספה / מחיקה / עדכון תוכן / עדכון מצב

### חלק ה – Posts
- [x] הצגת posts במצב סקירה (id + כותרת)
- [x] חיפוש (id / כותרת)
- [x] הוספה / מחיקה / עדכון
- [x] בחירת post להצגה מלאה + תוכן
- [x] הצגת comments לpost שנבחר
- [x] הוספת comment עם זיהוי המשתמש
- [x] עריכה/מחיקת comment רק אם שייך למשתמש הפעיל

### חלק ו – Albums
- [x] סקירה (id + כותרת)
- [x] חיפוש (id / כותרת)
- [x] לחיצה על album → הצגת photos שלו
- [x] הצגת תמונות בשלבים (pagination + כפתור Load More)
- [x] lightbox לתמונה בגדול
- [x] יצירת albums חדשים
- [x] ניהול תמונות (הוספה / מחיקה / עדכון)
