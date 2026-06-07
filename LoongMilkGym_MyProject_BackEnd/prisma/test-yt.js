const ids = {
  "barbell_bicep_curl": "54x2WF1_Suc",
  "hammer_curl": "BRVDS6HVR9Q",
  "incline_dumbbell_curl": "uCUaRFlA9vE",
  "tricep_rope_pushdown": "vB5OHsJ3EME",
  "skull_crushers": "S0fmDR60X-o",
  "overhead_dumbbell_extension": "YbX7Wd8jQ-Q",

  // Backup IDs
  "backup_tricep_rope_pushdown_bowflex": "2-LAMcpzODU",
  "backup_skull_crushers": "K3mFeNz4e3w",
  "backup_incline_dumbbell_curl": "XhIsIcjIbCw"
};

async function checkVideo(name, id) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      console.log(`[VALID] ${name} (${id}) -> Title: "${data.title}"`);
      return true;
    } else {
      console.log(`[INVALID] ${name} (${id}) -> HTTP ${res.status}`);
      return false;
    }
  } catch (e) {
    console.log(`[ERROR] ${name} (${id}) -> ${e.message}`);
    return false;
  }
}

async function main() {
  for (const [name, id] of Object.entries(ids)) {
    await checkVideo(name, id);
  }
}

main();
