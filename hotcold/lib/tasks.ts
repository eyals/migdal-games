export type Level = "easy" | "medium" | "hard";

// Category is only used to avoid two similar tasks in a row.
export type Category = "body" | "person" | "object" | "room" | "show";

// active = needs floor work, jumping or balance. Hidden when "no physical effort" is on.
export type Task = { text: string; category: Category; active?: boolean };

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "easy", label: "קל", hint: "פעולה אחת פשוטה - לקטנים" },
  { id: "medium", label: "בינוני", hint: "פעולה אחת, קצת יותר מדויקת" },
  { id: "hard", label: "קשה", hint: "שני שלבים" },
];

export const TASKS: Record<Level, Task[]> = {
  easy: [
    { text: "לחבק מישהו", category: "person" },
    { text: "לתת כיף למישהו", category: "person" },
    { text: "לשבת ליד מישהו", category: "person" },
    { text: "להחזיק יד של מישהו", category: "person" },
    { text: "לשבת על הברכיים של מישהו", category: "person" },
    { text: "להביא חפץ למישהו", category: "object" },
    { text: "להרים חפץ", category: "object" },
    { text: "לשים חפץ על הראש", category: "object" },
    { text: "לשים כרית על כיסא", category: "object" },
    { text: "לשבת על הספה", category: "body" },
    { text: "לשבת על כיסא", category: "body" },
    { text: "לשכב על הספה", category: "body" },
    { text: "להרים את הידיים למעלה", category: "body" },
    { text: "לשבת על הרצפה", category: "body", active: true },
    { text: "לקפוץ", category: "body", active: true },
    { text: "לפתוח את הדלת", category: "room" },
    { text: "לכבות את האור", category: "room" },
    { text: "למחוא כפיים", category: "show" },
    { text: "לרקוד", category: "show", active: true },
  ],
  medium: [
    { text: "לחבק שני אנשים בבת אחת", category: "person" },
    { text: "להחליף מקום ישיבה עם מישהו", category: "person" },
    { text: "לעשות למישהו מסאז' בכתפיים", category: "person" },
    { text: "לתת נשיקה בלחי למישהו", category: "person" },
    { text: "ללחוץ יד למישהו", category: "person" },
    { text: "להושיב מישהו על הכיסא שלך", category: "person" },
    { text: "לשים חפץ על הראש של מישהו", category: "object" },
    { text: "לשים חפץ על השולחן", category: "object" },
    { text: "להחביא חפץ מתחת לכרית", category: "object" },
    { text: "לשבת על כרית", category: "object" },
    { text: "לשכב על הגב על השולחן", category: "body", active: true },
    { text: "לשכב על הרצפה", category: "body", active: true },
    { text: "לעמוד על רגל אחת", category: "body", active: true },
    { text: "להוריד נעל", category: "body", active: true },
    { text: "לפתוח חלון", category: "room" },
    { text: "להזיז כיסא", category: "room" },
    { text: "לשים את הידיים על הראש", category: "show" },
  ],
  hard: [
    { text: "לקחת חפץ ולתת אותו למישהו", category: "object" },
    { text: "לשים חפץ על הראש של מישהו ולחבק אותו", category: "object" },
    { text: "לקחת חפץ ממישהו ולשים אותו על הראש שלך", category: "object" },
    { text: "לקחת כרית ולשים אותה על מישהו", category: "object" },
    { text: "לקחת חפץ ולשבת איתו על הספה", category: "object" },
    { text: "להחליף מקום עם מישהו ולתת לו כיף", category: "person" },
    { text: "לשבת ליד מישהו ולהחזיק לו את היד", category: "person" },
    { text: "להושיב מישהו על הכיסא שלך ולתת לו כיף", category: "person" },
    { text: "לחבק מישהו ואז לשבת על הרצפה", category: "person", active: true },
    { text: "לשבת על הספה ולשים כרית על הראש", category: "body" },
    { text: "לשים כרית על הרצפה ולשבת עליה", category: "body", active: true },
    { text: "להוריד נעל ולשים אותה על השולחן", category: "body", active: true },
    { text: "להזיז כיסא לאמצע החדר ולשבת עליו", category: "room" },
    { text: "לפתוח את הדלת ולנופף לשלום", category: "room" },
    { text: "לכבות את האור ולשבת על הרצפה", category: "room", active: true },
  ],
};
