import { useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import {
  BadgeIndianRupee,
  BedDouble,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Moon,
  Sailboat,
  Sun,
  Waves,
} from "lucide-react";
import { Switch } from "@headlessui/react";

type Enquiry = {
  name: string;
  dateLine: string;
  status: "Date locked" | "Confirmed" | "Pending";
  config: string;
};

const enquiryStatusClass: Record<Enquiry["status"], string> = {
  "Date locked": "bg-amber-100 text-amber-700 border-amber-200",
  Confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-sky-100 text-sky-700 border-sky-200",
};

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  // { to: "/pricing", label: "Pricing", icon: BadgeIndianRupee },
  { to: "/enquiries", label: "Enquiries", icon: ClipboardList },
  { to: "/bookings", label: "Bookings", icon: FileText },
];

const boatAssetItem = { to: "/boat", label: "Boat asset", icon: Sailboat };

function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{sub}</p>
      </div>
      {children}
    </header>
  );
}

function Card({
  title,
  children,
  sub,
}: {
  title: string;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {sub ? <p className="mt-1 text-sm text-slate-500">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DashboardPage() {
  const enquiries: Enquiry[] = [
    {
      name: "Arjun Menon",
      dateLine: "Day cruise · 15 Jan 2025",
      status: "Date locked",
      config:
        "Premium · Private · 2 adults · 1 room · Full upper deck · ₹12,500",
    },
    {
      name: "Priya Sharma",
      dateLine: "Overnight stay · 18 Jan 2025",
      status: "Confirmed",
      config: "Luxury · Private · 4 adults · 2 rooms · ₹28,000",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        sub="Your houseboat performance at a glance"
      />
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {[
          ["Open dates this month", "18", "of 31 days"],
          ["Pending enquiries", "3", "Awaiting response"],
          ["Confirmed bookings", "11", "This month"],
          ["Revenue (month)", "₹1.4L", "Normal + peak"],
        ].map(([label, value, caption]) => (
          <div
            key={label}
            className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {value}
            </p>
            <p className="text-xs text-slate-400">{caption}</p>
          </div>
        ))}
      </div>
      <Card title="Recent enquiries">
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.name}
              className="rounded-xl border border-sky-100 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{enquiry.name}</p>
                  <p className="text-sm text-slate-500">{enquiry.dateLine}</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${enquiryStatusClass[enquiry.status]}`}
                >
                  {enquiry.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{enquiry.config}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function BoatAssetPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [identity, setIdentity] = useState({
    boatName: "Vembanad Crest",
    experienceTier: "Premium",
    bookingType: "Private only",
    maxGuests: 6,
    bedrooms: 2,
    maxGuestsPerRoom: "2 + 1 extra bed",
  });
  const [features, setFeatures] = useState<string[]>([
    "Full upper deck",
    "Sundeck",
  ]);
  const [cruiseTypes, setCruiseTypes] = useState([
    { label: "Day cruise", on: true },
    { label: "Overnight stay", on: true },
    { label: "Night stay", on: false },
  ]);
  const [roomSettings, setRoomSettings] = useState({
    maxGuests: "2 guests",
    extraBed: "Allowed",
    children: "Allowed",
  });
  const allStructuralFeatures = [
    "Full upper deck",
    "Partial deck",
    "Sundeck",
    "Balcony",
  ];
  const roomRules: Array<{ label: string; options: string[] }> = [
    { label: "Max guests", options: ["2 guests", "3 guests"] },
    { label: "Extra bed", options: ["Allowed", "Not allowed"] },
    { label: "Children", options: ["Allowed", "Not allowed"] },
  ];

  function toggleFeature(feature: string) {
    setFeatures((current) =>
      current.includes(feature)
        ? current.filter((item) => item !== feature)
        : [...current, feature],
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boat asset definition"
        sub="These details are permanent truths about your boat. They drive all matching logic."
      >
        <div className="flex-1 flex justify-end items-end gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-none font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-sky-200 bg-sky-100 px-3.5 py-2.5 text-xs leading-none font-medium text-sky-600 hover:bg-sky-200 cursor-pointer"
              >
                Save
              </button>
            </>
          ) : false && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="ml-auto rounded-lg border border-sky-200 bg-sky-100 px-3.5 py-2.5 text-xs leading-none font-medium text-sky-600 hover:bg-sky-200 cursor-pointer"
            >
              Edit
            </button>
          )}
        </div>
      </PageHeader>
      <Card title="Identity & classification">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Boat name</p>
            {isEditing ? (
              <input
                type="text"
                value={identity.boatName}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    boatName: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.boatName}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Experience tier</p>
            {isEditing ? (
              <select
                value={identity.experienceTier}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    experienceTier: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              >
                <option>Premium</option>
                <option>Luxury</option>
                <option>Standard</option>
              </select>
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.experienceTier}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Booking type</p>
            {isEditing ? (
              <select
                value={identity.bookingType}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    bookingType: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              >
                <option>Private only</option>
                <option>Shared</option>
                <option>Private + shared</option>
              </select>
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.bookingType}
              </p>
            )}
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Max guests</p>
            {isEditing ? (
              <input
                type="number"
                min={1}
                value={identity.maxGuests}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    maxGuests: Number(event.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.maxGuests} persons
              </p>
            )}
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Bedrooms</p>
            {isEditing ? (
              <input
                type="number"
                min={1}
                value={identity.bedrooms}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    bedrooms: Number(event.target.value),
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.bedrooms} bedrooms
              </p>
            )}
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
            <p className="text-xs text-slate-500">Max guests per room</p>
            {isEditing ? (
              <input
                type="text"
                value={identity.maxGuestsPerRoom}
                onChange={(event) =>
                  setIdentity((current) => ({
                    ...current,
                    maxGuestsPerRoom: event.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700"
              />
            ) : (
              <p className="mt-1 text-sm font-medium text-slate-900">
                {identity.maxGuestsPerRoom}
              </p>
            )}
          </div>
        </div>
      </Card>
      <Card title="Structural features">
        {isEditing ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {allStructuralFeatures.map((feature) => (
              <label
                key={feature}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                />
                {feature}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allStructuralFeatures.map((feature) => {
              const enabled = features.includes(feature);

              return (
                <span
                  key={feature}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    enabled
                      ? "border-sky-300 bg-sky-100 text-sky-700"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {feature}
                </span>
              );
            })}
          </div>
        )}
      </Card>
      <Card
        title="Supported cruise types"
        sub="Only enable cruise types you are fully equipped to deliver."
      >
        {isEditing ? (
          <div className="space-y-2">
            {cruiseTypes.map((type) => (
              <div
                key={type.label}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <span className="text-sm text-slate-700">{type.label}</span>
                <Switch
                  checked={type.on}
                  onChange={(value) =>
                    setCruiseTypes((current) =>
                      current.map((item) =>
                        item.label === type.label ? { ...item, on: value } : item,
                      ),
                    )
                  }
                  className={`${
                    type.on ? "bg-emerald-500" : "bg-slate-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      type.on ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cruiseTypes.map((type) => (
              <span
                key={type.label}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  type.on
                    ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-500"
                }`}
              >
                {type.label}
              </span>
            ))}
          </div>
        )}
      </Card>
      <Card title="Room layout rules">
        <div className="rounded-xl border border-sky-100 p-4">
          <p className="mb-3 text-sm font-medium text-slate-900">Room 1</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {roomRules.map(({ label, options }) => (
              <label key={label} className="text-xs text-slate-500">
                {label}
                <select
                  value={
                    label === "Max guests"
                      ? roomSettings.maxGuests
                      : label === "Extra bed"
                        ? roomSettings.extraBed
                        : roomSettings.children
                  }
                  onChange={(event) => {
                    const value = event.target.value;

                    setRoomSettings((current) => {
                      if (label === "Max guests") {
                        return { ...current, maxGuests: value };
                      }
                      if (label === "Extra bed") {
                        return { ...current, extraBed: value };
                      }

                      return { ...current, children: value };
                    });
                  }}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function CalendarPage() {
  type DayBooking = {
    dayCruise: boolean;
    overnightCruise: boolean;
    nightCruise: boolean;
    details: string;
  };

  const [selectedDay, setSelectedDay] = useState(15);
  const [bookingsByDay, setBookingsByDay] = useState<Record<number, DayBooking>>({
    2: {
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: "Corporate day outing for 8 guests.",
    },
    5: {
      dayCruise: true,
      overnightCruise: true,
      nightCruise: true,
      details:
        "Wedding group full-day charter with overnight and night cruise extension.",
    },
    9: {
      dayCruise: false,
      overnightCruise: true,
      nightCruise: true,
      details: "Family overnight package with late night backwater ride.",
    },
    13: {
      dayCruise: true,
      overnightCruise: true,
      nightCruise: true,
      details: "Festival special complete package booking.",
    },
    18: {
      dayCruise: false,
      overnightCruise: false,
      nightCruise: true,
      details: "Couple moonlight cruise with dinner.",
    },
    24: {
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: "Private anniversary plan with sunset and night ride.",
    },
  });

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, index) => index + 1),
    [],
  );
  const selectedBooking = bookingsByDay[selectedDay] ?? {
    dayCruise: false,
    overnightCruise: false,
    nightCruise: false,
    details: "No bookings for this day.",
  };
  const availabilityToggles: Array<{
    label: string;
    enabled: boolean;
    key: "dayCruise" | "overnightCruise" | "nightCruise";
  }> = [
    { label: "Day cruise", enabled: selectedBooking.dayCruise, key: "dayCruise" },
    {
      label: "Overnight stay",
      enabled: selectedBooking.overnightCruise,
      key: "overnightCruise",
    },
    { label: "Night stay", enabled: selectedBooking.nightCruise, key: "nightCruise" },
  ];

  function updateSelectedDayAvailability(
    key: "dayCruise" | "overnightCruise" | "nightCruise",
    value: boolean,
  ) {
    setBookingsByDay((current) => {
      const currentDayBooking = current[selectedDay] ?? {
        dayCruise: false,
        overnightCruise: false,
        nightCruise: false,
        details: "No bookings for this day.",
      };

      return {
        ...current,
        [selectedDay]: {
          ...currentDayBooking,
          [key]: value,
        },
      };
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability calendar"
        sub="One calendar, three independent layers. Open or close each cruise type per date."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card title="January 2025">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const booking = bookingsByDay[day];
              const allCruisesBooked =
                booking?.dayCruise &&
                booking?.overnightCruise &&
                booking?.nightCruise;
              const anyCruiseBooked =
                booking?.dayCruise ||
                booking?.overnightCruise ||
                booking?.nightCruise;
              const style = allCruisesBooked
                ? "bg-emerald-100 text-emerald-800"
                : anyCruiseBooked
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-500";

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${style} hover:brightness-95 ${selectedDay === day ? "ring ring-sky-500" : ""}`}
                >
                  <div className="flex min-h-10 flex-col items-center justify-between">
                    <span>{day}</span>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {booking?.dayCruise ? <Sun size={11} /> : null}
                      {booking?.overnightCruise ? (
                        <BedDouble size={11} />
                      ) : null}
                      {booking?.nightCruise ? <Moon size={11} /> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
        <Card title={`${selectedDay} Jan — edit availability`}>
          <div className="space-y-3">
            {availabilityToggles.map(({ label, enabled, key }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <span className="text-sm text-slate-700">{label}</span>
                <Switch
                  checked={enabled}
                  onChange={(value) => updateSelectedDayAvailability(key, value)}
                  className={`${
                    enabled ? "bg-emerald-500" : "bg-slate-300"
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      enabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            ))}
            <button
              type="button"
              className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Save changes
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function PricingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        sub="Define rates per cruise type. Guardrails prevent underpricing and misaligned expectations."
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Peak season active: 20 Dec – 10 Jan. Enquiry-only mode enabled. Pricing
        guardrails enforced.
      </div>
      {[
        ["Day cruise", "₹9,500", "₹14,000", "₹8,000"],
        ["Overnight stay", "₹16,000", "₹24,500", "₹13,000"],
        ["Night stay", "₹12,000", "₹18,000", "₹10,000"],
      ].map(([type, normal, peak, guardrail]) => (
        <Card key={type} title={type}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Normal rate", normal, "—"],
              ["Peak rate", peak, "Active now"],
              ["Min. guardrail", guardrail, "Cannot go below"],
            ].map(([label, value, hint]) => (
              <div
                key={label}
                className="rounded-xl border border-sky-100 bg-sky-50/50 p-3"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {value}
                </p>
                <p className="text-xs text-slate-400">{hint}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EnquiriesPage() {
  const cards: Array<
    Enquiry & { subtitle: string; details: string; request?: string }
  > = [
    {
      name: "Arjun Menon",
      dateLine: "Received 2 hrs ago · Date held until 6 PM today",
      subtitle: "Day cruise · 15 Jan 2025",
      status: "Date locked",
      config: "Price shown to guest: ₹12,500",
      details:
        "Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed",
      request:
        "Special request: Vegetarian meals preferred. Celebrating anniversary.",
    },
    {
      name: "Ritu Nair",
      dateLine: "Received yesterday · Overnight stay · 22 Jan",
      subtitle: "Overnight stay · 22 Jan 2025",
      status: "Pending",
      config: "Price shown to guest: ₹21,000",
      details:
        "Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        sub="Temporary date locks are active. Respond to avoid automatic expiry."
      />
      {cards.map((card) => (
        <Card key={card.name} title={card.name} sub={card.dateLine}>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${enquiryStatusClass[card.status]}`}
            >
              {card.status}
            </span>
            <span className="text-xs text-slate-500">{card.subtitle}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{card.details}</p>
          <p className="mt-2 text-sm text-slate-700">{card.config}</p>
          {card.request ? (
            <p className="mt-2 text-sm text-slate-500">{card.request}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white"
            >
              Accept booking
            </button>
            <button
              type="button"
              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white"
            >
              Decline
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        sub="Track accepted bookings with complete trip details and guest preferences."
      />
      <Card title="Arjun Menon · Vembanad Crest" sub="#SC-2025-0041">
        <div className="space-y-2 text-sm">
          {[
            ["Cruise type", "Day cruise"],
            ["Date & time", "15 Jan 2025 · 11:00 AM – 5:00 PM"],
            ["Configuration", "2 adults · 1 room · Private · Premium"],
            ["Total agreed price", "₹12,500"],
            ["Inclusions", "Meals, water, A/C, fishing equipment"],
            ["Pickup arranged", "Taxi confirmed · Alleppey Jetty"],
            ["Meal preference", "Vegetarian · Anniversary decoration"],
          ].map(([key, value]) => (
            <div
              key={key}
              className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-1.5"
            >
              <span className="text-slate-500">{key}</span>
              <span className="font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-slate-600">
          Sailcept commitments: cruise-time support, check-in coordination, taxi
          pickup, operator compliance enforcement, backup boat if required.
        </div>
      </Card>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen md:bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100 text-slate-700">
      <div className="mx-auto grid w-full max-w-7xl gap-0 px-0 py-0 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-4 lg:px-4 lg:py-6">
        <aside className="hidden rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm backdrop-blur lg:block">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-xl bg-sky-600 p-2 text-white">
              <Waves size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Sailcept
              </p>
              <p className="font-semibold text-slate-900">Operator Admin</p>
            </div>
          </div>
          <nav className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-sky-600 text-white"
                      : "text-slate-600 hover:bg-sky-100 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-sky-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-sky-600 p-2 text-white">
              <Waves size={16} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Sailcept
              </p>
              <p className="text-sm font-semibold text-slate-900">Admin</p>
            </div>
          </div>
          <NavLink
            to={boatAssetItem.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-sky-300 bg-sky-100 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:bg-sky-50"
              }`
            }
          >
            <boatAssetItem.icon size={14} />
            <span>Profile</span>
          </NavLink>
        </header>

        <main className="bg-white/80 p-4 pb-24 lg:rounded-2xl lg:border lg:border-sky-100 lg:p-5 lg:pb-5 lg:shadow-sm lg:backdrop-blur">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/boat" element={<BoatAssetPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* <Route path="/pricing" element={<PricingPage />} /> */}
            <Route path="/enquiries" element={<EnquiriesPage />} />
            <Route path="/contracts" element={<Navigate to="/bookings" replace />} />
            <Route path="/bookings" element={<BookingsPage />} />
          </Routes>
        </main>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-20 border border-sky-100  px-2 py-2 rounded-full shadow-[0_4px_22px_-10px_rgba(2,132,199,0.5)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-4 gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center rounded-full px-1.5 py-1 text-[11px] leading-tight transition active:bg-sky-50 ${
                  isActive
                    ? "bg-sky-100 text-sky-700"
                    : "text-slate-500 hover:bg-sky-50 hover:text-slate-700"
                }`
              }
            >
              <Icon size={16} />
              <span className="mt-1 truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AppLayout;
