import { useMemo, useState } from 'react'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
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
} from 'lucide-react'
import { Switch } from '@headlessui/react'

type Enquiry = {
  name: string
  dateLine: string
  status: 'Date locked' | 'Confirmed' | 'Pending'
  config: string
}

const enquiryStatusClass: Record<Enquiry['status'], string> = {
  'Date locked': 'bg-amber-100 text-amber-700 border-amber-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-sky-100 text-sky-700 border-sky-200',
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/boat', label: 'Boat asset', icon: Sailboat },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/pricing', label: 'Pricing', icon: BadgeIndianRupee },
  { to: '/enquiries', label: 'Enquiries', icon: ClipboardList },
  { to: '/contracts', label: 'Contracts', icon: FileText },
]

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <header>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </header>
  )
}

function Card({ title, children, sub }: { title: string; children: React.ReactNode; sub?: string }) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {sub ? <p className="mt-1 text-sm text-slate-500">{sub}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function DashboardPage() {
  const enquiries: Enquiry[] = [
    {
      name: 'Arjun Menon',
      dateLine: 'Day cruise · 15 Jan 2025',
      status: 'Date locked',
      config: 'Premium · Private · 2 adults · 1 room · Full upper deck · ₹12,500',
    },
    {
      name: 'Priya Sharma',
      dateLine: 'Overnight stay · 18 Jan 2025',
      status: 'Confirmed',
      config: 'Luxury · Private · 4 adults · 2 rooms · ₹28,000',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" sub="Your houseboat performance at a glance" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open dates this month', '18', 'of 31 days'],
          ['Pending enquiries', '3', 'Awaiting response'],
          ['Confirmed bookings', '11', 'This month'],
          ['Revenue (month)', '₹1.4L', 'Normal + peak'],
        ].map(([label, value, caption]) => (
          <div key={label} className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{caption}</p>
          </div>
        ))}
      </div>
      <Card title="Recent enquiries">
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div key={enquiry.name} className="rounded-xl border border-sky-100 p-4">
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
  )
}

function BoatAssetPage() {
  const cruiseTypes = [
    { label: 'Day cruise', on: true },
    { label: 'Overnight stay', on: true },
    { label: 'Night stay', on: false },
  ]
  const roomRules: Array<{ label: string; options: string[] }> = [
    { label: 'Max guests', options: ['2 guests', '3 guests'] },
    { label: 'Extra bed', options: ['Allowed', 'Not allowed'] },
    { label: 'Children', options: ['Allowed', 'Not allowed'] },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boat asset definition"
        sub="These details are permanent truths about your boat. They drive all matching logic."
      />
      <Card title="Identity & classification">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Boat name', 'Vembanad Crest'],
            ['Experience tier', 'Premium'],
            ['Booking type', 'Private only'],
            ['Max guests', '6 persons'],
            ['Bedrooms', '2 bedrooms'],
            ['Max guests per room', '2 + 1 extra bed'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Structural features">
        <div className="flex flex-wrap gap-2">
          {['Full upper deck', 'Partial deck', 'Sundeck', 'Balcony'].map((feature, index) => (
            <span
              key={feature}
              className={`rounded-full border px-3 py-1 text-xs ${
                index % 2 === 0
                  ? 'border-sky-300 bg-sky-100 text-sky-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              {feature}
            </span>
          ))}
        </div>
      </Card>
      <Card
        title="Supported cruise types"
        sub="Only enable cruise types you are fully equipped to deliver."
      >
        <div className="flex flex-wrap gap-2">
          {cruiseTypes.map((type) => (
            <span
              key={type.label}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                type.on
                  ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-500'
              }`}
            >
              {type.label}
            </span>
          ))}
        </div>
      </Card>
      <Card title="Room layout rules">
        <div className="rounded-xl border border-sky-100 p-4">
          <p className="mb-3 text-sm font-medium text-slate-900">Room 1</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {roomRules.map(({ label, options }) => (
              <label key={label} className="text-xs text-slate-500">
                {label}
                <select className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700">
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
  )
}

function CalendarPage() {
  type DayBooking = {
    dayCruise: boolean
    overnightCruise: boolean
    nightCruise: boolean
    details: string
  }

  const [dayCruise, setDayCruise] = useState(true)
  const [overnight, setOvernight] = useState(true)
  const [nightStay, setNightStay] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const availabilityToggles: Array<{
    label: string
    enabled: boolean
    setEnabled: (value: boolean) => void
  }> = [
    { label: 'Day cruise', enabled: dayCruise, setEnabled: setDayCruise },
    { label: 'Overnight stay', enabled: overnight, setEnabled: setOvernight },
    { label: 'Night stay', enabled: nightStay, setEnabled: setNightStay },
  ]

  const bookingsByDay: Record<number, DayBooking> = {
    2: {
      dayCruise: true,
      overnightCruise: false,
      nightCruise: false,
      details: 'Corporate day outing for 8 guests.',
    },
    5: {
      dayCruise: true,
      overnightCruise: true,
      nightCruise: true,
      details: 'Wedding group full-day charter with overnight and night cruise extension.',
    },
    9: {
      dayCruise: false,
      overnightCruise: true,
      nightCruise: true,
      details: 'Family overnight package with late night backwater ride.',
    },
    13: {
      dayCruise: true,
      overnightCruise: true,
      nightCruise: true,
      details: 'Festival special complete package booking.',
    },
    18: {
      dayCruise: false,
      overnightCruise: false,
      nightCruise: true,
      details: 'Couple moonlight cruise with dinner.',
    },
    24: {
      dayCruise: true,
      overnightCruise: false,
      nightCruise: true,
      details: 'Private anniversary plan with sunset and night ride.',
    },
  }

  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => index + 1), [])
  const selectedBooking = selectedDay ? bookingsByDay[selectedDay] : undefined

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
              const booking = bookingsByDay[day]
              const allCruisesBooked =
                booking?.dayCruise && booking?.overnightCruise && booking?.nightCruise
              const anyCruiseBooked =
                booking?.dayCruise || booking?.overnightCruise || booking?.nightCruise
              const style = allCruisesBooked
                ? 'bg-emerald-100 text-emerald-800'
                : anyCruiseBooked
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-500'

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium ${style} hover:brightness-95`}
                >
                  <div className="flex min-h-10 flex-col items-center justify-between">
                    <span>{day}</span>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      {booking?.dayCruise ? <Sun size={11} /> : null}
                      {booking?.overnightCruise ? <BedDouble size={11} /> : null}
                      {booking?.nightCruise ? <Moon size={11} /> : null}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
        <Card title="15 Jan — edit availability">
          <div className="space-y-3">
            {availabilityToggles.map(({ label, enabled, setEnabled }) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
              >
                <span className="text-sm text-slate-700">{label}</span>
                <Switch
                  checked={enabled}
                  onChange={setEnabled}
                  className={`${
                    enabled ? 'bg-emerald-500' : 'bg-slate-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      enabled ? 'translate-x-6' : 'translate-x-1'
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

      {selectedDay ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedDay} Jan - Day details</h3>
                {/* <p className="text-sm text-slate-500">
                  {selectedBooking ? selectedBooking.details : 'No bookings for this day.'}
                </p> */}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                <span className="flex items-center gap-2">
                  <Sun size={13} /> Day cruise
                </span>
                <span className={selectedBooking?.dayCruise ? 'text-emerald-700' : 'text-slate-400'}>
                  {selectedBooking?.dayCruise ? 'Booked' : 'Not booked'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                <span className="flex items-center gap-2">
                  <BedDouble size={13} /> Overnight cruise
                </span>
                <span className={selectedBooking?.overnightCruise ? 'text-emerald-700' : 'text-slate-400'}>
                  {selectedBooking?.overnightCruise ? 'Booked' : 'Not booked'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                <span className="flex items-center gap-2">
                  <Moon size={13} /> Night cruise
                </span>
                <span className={selectedBooking?.nightCruise ? 'text-emerald-700' : 'text-slate-400'}>
                  {selectedBooking?.nightCruise ? 'Booked' : 'Not booked'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function PricingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        sub="Define rates per cruise type. Guardrails prevent underpricing and misaligned expectations."
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Peak season active: 20 Dec – 10 Jan. Enquiry-only mode enabled. Pricing guardrails enforced.
      </div>
      {[
        ['Day cruise', '₹9,500', '₹14,000', '₹8,000'],
        ['Overnight stay', '₹16,000', '₹24,500', '₹13,000'],
        ['Night stay', '₹12,000', '₹18,000', '₹10,000'],
      ].map(([type, normal, peak, guardrail]) => (
        <Card key={type} title={type}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Normal rate', normal, '—'],
              ['Peak rate', peak, 'Active now'],
              ['Min. guardrail', guardrail, 'Cannot go below'],
            ].map(([label, value, hint]) => (
              <div key={label} className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400">{hint}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function EnquiriesPage() {
  const cards: Array<Enquiry & { subtitle: string; details: string; request?: string }> = [
    {
      name: 'Arjun Menon',
      dateLine: 'Received 2 hrs ago · Date held until 6 PM today',
      subtitle: 'Day cruise · 15 Jan 2025',
      status: 'Date locked',
      config: 'Price shown to guest: ₹12,500',
      details:
        'Premium · Private · 2 adults, 0 children · 1 room · 2 guests per room · No extra bed',
      request: 'Special request: Vegetarian meals preferred. Celebrating anniversary.',
    },
    {
      name: 'Ritu Nair',
      dateLine: 'Received yesterday · Overnight stay · 22 Jan',
      subtitle: 'Overnight stay · 22 Jan 2025',
      status: 'Pending',
      config: 'Price shown to guest: ₹21,000',
      details:
        'Premium · Private · 4 adults, 1 child · 2 rooms · Room 1: 2 guests · Room 2: 2 guests + 1 extra bed',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enquiries"
        sub="Temporary date locks are active. Respond to avoid automatic expiry."
      />
      {cards.map((card) => (
        <Card key={card.name} title={card.name} sub={card.dateLine}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${enquiryStatusClass[card.status]}`}>
              {card.status}
            </span>
            <span className="text-xs text-slate-500">{card.subtitle}</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">{card.details}</p>
          <p className="mt-2 text-sm text-slate-700">{card.config}</p>
          {card.request ? <p className="mt-2 text-sm text-slate-500">{card.request}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white">
              Accept booking
            </button>
            <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              Suggest alternative
            </button>
            <button type="button" className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white">
              Decline
            </button>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ContractsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking contracts"
        sub="Each accepted booking generates a shared contract. No ambiguity on either side."
      />
      <Card title="Arjun Menon · Vembanad Crest" sub="#SC-2025-0041">
        <div className="space-y-2 text-sm">
          {[
            ['Cruise type', 'Day cruise'],
            ['Date & time', '15 Jan 2025 · 11:00 AM – 5:00 PM'],
            ['Configuration', '2 adults · 1 room · Private · Premium'],
            ['Total agreed price', '₹12,500'],
            ['Inclusions', 'Meals, water, A/C, fishing equipment'],
            ['Pickup arranged', 'Taxi confirmed · Alleppey Jetty'],
            ['Meal preference', 'Vegetarian · Anniversary decoration'],
          ].map(([key, value]) => (
            <div key={key} className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-1.5">
              <span className="text-slate-500">{key}</span>
              <span className="font-medium text-slate-800">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-slate-600">
          Sailcept commitments: cruise-time support, check-in coordination, taxi pickup, operator compliance
          enforcement, backup boat if required.
        </div>
      </Card>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100 text-slate-700">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-sky-100 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <div className="rounded-xl bg-sky-600 p-2 text-white">
              <Waves size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Sailcept</p>
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
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-600 hover:bg-sky-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm backdrop-blur">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/boat" element={<BoatAssetPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/enquiries" element={<EnquiriesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
