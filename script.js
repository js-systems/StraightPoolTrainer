// Supabase-Verbindung
const SUPABASE_URL = "https://clarmtdbguledewscalk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYXJtdGRiZ3VsZWRld3NjYWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNjIwMjUsImV4cCI6MjA1NTgzODAyNX0.5kSb9k10OV2OwUjD66-FanBHLY5uOsZHx9abg2qXMfo";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Globaler Punktestand
let score = 0;

// Funktion zum Hinzufügen von Punkten
function addPoints(points) {
    score += points;
    document.getElementById("score").textContent = score;
}

// Lädt die Runs aus der Supabase-Datenbank
async function loadRuns() {
    try {
        const { data: runs, error } = await supabase
            .from("runs")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            throw error;
        }

        let historyTable = document.getElementById("runHistory");
        historyTable.innerHTML = "";
        runs.forEach(run => {
            let row = `<tr><td>${run.points}</td><td>${run.reason}</td><td>${new Date(run.date).toLocaleString()}</td></tr>`;
            historyTable.innerHTML += row;
        });
    } catch (error) {
        console.error("Fehler beim Laden:", error);
    }
}

// Funktion zum Beenden eines Laufs
async function endRun(reason) {
    let finalScore = reason === "Foul" ? Math.max(0, score - 1) : score;

    try {
        const { data, error } = await supabase
            .from("runs")
            .insert([{ points: finalScore, reason: reason, date: new Date() }]);

        if (error) {
            throw error;
        }

        console.log("Run gespeichert:", data);
        loadRuns(); // Tabelle neu laden
    } catch (error) {
        console.error("Fehler beim Speichern:", error);
    }

    score = 0;
    document.getElementById("score").textContent = score;
}

// Reset-Tabelle
function resetHistory() {
    if (confirm("Bist du sicher, dass du die Tabelle zurücksetzen möchtest?")) {
        supabase
            .from("runs")
            .delete()
            .then(() => {
                loadRuns();
            })
            .catch((error) => {
                console.error("Fehler beim Zurücksetzen:", error);
            });
    }
}

// Lädt die Runs beim Laden der Seite
document.addEventListener("DOMContentLoaded", loadRuns);
