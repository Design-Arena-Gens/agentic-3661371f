const scheduleData = [
  {
    origin: "Downtown",
    destination: "Airport",
    times: ["06:15", "07:45", "09:30", "12:00", "14:15", "16:45", "19:10", "21:30"],
  },
  {
    origin: "Downtown",
    destination: "University",
    times: ["05:50", "07:05", "08:20", "09:50", "11:10", "13:25", "15:00", "17:40", "20:05"],
  },
  {
    origin: "Downtown",
    destination: "Harbor",
    times: ["06:00", "07:30", "09:00", "10:30", "12:30", "15:45", "18:10"],
  },
  {
    origin: "Airport",
    destination: "Downtown",
    times: ["06:50", "08:20", "10:05", "12:35", "14:40", "17:15", "20:00", "22:15"],
  },
  {
    origin: "Airport",
    destination: "University",
    times: ["07:10", "09:30", "11:40", "13:50", "16:05", "18:20", "21:10"],
  },
  {
    origin: "University",
    destination: "Downtown",
    times: ["06:20", "07:40", "09:15", "11:00", "13:10", "15:30", "17:50", "20:10"],
  },
  {
    origin: "University",
    destination: "Harbor",
    times: ["06:45", "08:15", "10:00", "12:20", "14:40", "17:05", "19:30"],
  },
  {
    origin: "Harbor",
    destination: "Downtown",
    times: ["05:55", "07:25", "08:55", "10:25", "12:45", "16:00", "18:25", "20:35"],
  },
];

const originSelect = document.getElementById("origin");
const destinationSelect = document.getElementById("destination");
const scheduleTable = document.getElementById("schedule-table");
const form = document.getElementById("route-form");
const resultSection = document.getElementById("result");
const resultTitle = document.getElementById("result-title");
const nextTime = document.getElementById("next-time");
const waitTime = document.getElementById("wait-time");

const uniqueOrigins = Array.from(new Set(scheduleData.map((route) => route.origin))).sort();

function populateOriginOptions() {
  originSelect.innerHTML = uniqueOrigins.reduce((options, origin) => {
    return `${options}<option value="${origin}">${origin}</option>`;
  }, "");
}

function populateDestinationOptions(origin) {
  const destinations = scheduleData
    .filter((route) => route.origin === origin)
    .map((route) => route.destination)
    .sort();

  destinationSelect.innerHTML = destinations.reduce((options, destination) => {
    return `${options}<option value="${destination}">${destination}</option>`;
  }, "");
}

function buildScheduleTable() {
  const fragment = document.createDocumentFragment();

  scheduleData
    .slice()
    .sort((a, b) => {
      if (a.origin === b.origin) {
        return a.destination.localeCompare(b.destination);
      }
      return a.origin.localeCompare(b.origin);
    })
    .forEach((route) => {
      const entry = document.createElement("div");
      entry.className = "schedule__entry";

      const heading = document.createElement("h3");
      heading.textContent = `${route.origin} → ${route.destination}`;
      entry.appendChild(heading);

      const list = document.createElement("ul");
      route.times.forEach((time) => {
        const item = document.createElement("li");
        item.textContent = time;
        list.appendChild(item);
      });

      entry.appendChild(list);
      fragment.appendChild(entry);
    });

  scheduleTable.appendChild(fragment);
}

function findRoute(origin, destination) {
  return scheduleData.find(
    (route) => route.origin === origin && route.destination === destination
  );
}

function findNextDeparture(route) {
  const now = new Date();
  const today = new Date(now);

  for (const time of route.times) {
    const [hour, minute] = time.split(":").map(Number);
    const departure = new Date(today);
    departure.setHours(hour, minute, 0, 0);

    if (departure >= now) {
      return {
        date: departure,
        label: "Today",
      };
    }
  }

  const [firstHour, firstMinute] = route.times[0].split(":").map(Number);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(firstHour, firstMinute, 0, 0);

  return {
    date: tomorrow,
    label: "Tomorrow",
  };
}

function formatClockTime(date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatWaitDuration(milliseconds) {
  const totalMinutes = Math.round(milliseconds / 60000);
  if (totalMinutes <= 0) {
    return "Departing now";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `Leaves in ${minutes} min`;
  }

  if (minutes === 0) {
    return `Leaves in ${hours}h`;
  }

  return `Leaves in ${hours}h ${minutes}m`;
}

function showResult(origin, destination, route) {
  if (!route) {
    resultTitle.textContent = `${origin} → ${destination}`;
    nextTime.textContent = "No direct buses scheduled for this route.";
    waitTime.textContent = "Select a different origin or destination.";
    resultSection.classList.remove("result--hidden");
    return;
  }

  const nextDeparture = findNextDeparture(route);
  const wait = nextDeparture.date.getTime() - Date.now();

  resultTitle.textContent = `${origin} → ${destination}`;
  nextTime.textContent = `${nextDeparture.label} at ${formatClockTime(nextDeparture.date)}`;
  waitTime.textContent = formatWaitDuration(wait);
  resultSection.classList.remove("result--hidden");
}

originSelect.addEventListener("change", (event) => {
  populateDestinationOptions(event.target.value);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const origin = originSelect.value;
  const destination = destinationSelect.value;
  const route = findRoute(origin, destination);
  showResult(origin, destination, route);
});

populateOriginOptions();
populateDestinationOptions(originSelect.value);
buildScheduleTable();
