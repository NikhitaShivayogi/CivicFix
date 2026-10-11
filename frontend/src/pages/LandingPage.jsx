import { ArrowRight, Map, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Map,
    title: 'Issue Mapping',
    description: 'Report and locate civic problems with map-based precision using coordinates and address details.',
  },
  {
    icon: ShieldCheck,
    title: 'Authority Workflow',
    description: 'Authorities can review reports, add remarks, update statuses, and resolve issues efficiently.',
  },
  {
    icon: Users,
    title: 'Transparent Tracking',
    description: 'Citizens stay informed through notifications and complete issue status timelines.',
  },
];

export default function LandingPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-civic-700 to-civic-500 shadow-soft">
          <div className="grid gap-8 px-6 py-12 lg:grid-cols-2 lg:px-12 lg:py-16">
            <div className="text-white">
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-civic-50">
                Student-built in India
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Report local civic issues and help your community move faster.
              </h1>
              <p className="mt-6 max-w-xl text-base text-civic-50">
                CivicFix connects Indian communities with local authorities to report issues like potholes, broken lights, waste, drainage, and public safety concerns.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-civic-700 transition hover:bg-civic-50">
                  Get started <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-transparent px-5 py-3 font-semibold text-white hover:bg-white/5">
                  Login
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-civic-100 p-3 text-civic-700"><Map size={24} /></div>
                  <div>
                    <p className="font-semibold">Made for Indian communities</p>
                    <p className="mt-1 text-sm text-slate-600">A student-built project focused on practical local reporting.</p>
                  </div>
                </div>
                <dl className="mt-6 divide-y divide-slate-200 text-sm">
                  <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Citizen details</dt><dd className="text-right font-medium text-slate-900">District and state</dd></div>
                  <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Phone format</dt><dd className="text-right font-medium text-slate-900">Indian mobile (+91)</dd></div>
                  <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">Report location</dt><dd className="text-right font-medium text-slate-900">Map pin or GPS</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Choose a workspace" className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase text-civic-700">Resident workspace</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Report and track issues</h2>
            <p className="mt-1 text-sm text-slate-600">Use a citizen account to submit reports and follow updates.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/citizen/login" className="inline-flex items-center gap-2 rounded-lg bg-civic-600 px-4 py-2 text-sm font-semibold text-white hover:bg-civic-700">Citizen sign in <ArrowRight size={15} /></Link>
              <Link to="/register" className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Create account</Link>
            </div>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-xs font-semibold uppercase text-civic-700">Authority workspace</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Review incoming reports</h2>
            <p className="mt-1 text-sm text-slate-600">For city staff. Authority access is granted only after administrator approval.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/authority/login" className="inline-flex items-center gap-2 rounded-lg bg-civic-600 px-4 py-2 text-sm font-semibold text-white hover:bg-civic-700">Authority sign in <ArrowRight size={15} /></Link>
              <Link to="/authority/request" className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Request access</Link>
            </div>
          </article>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="mb-4 inline-flex rounded-xl bg-civic-100 p-3 text-civic-700">
                <Icon size={22} />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
          <div>
            <Link to="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-civic-700">CivicFix</Link>
            <p className="mt-2 text-sm text-slate-600">A clearer connection between residents and city services.</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <Link to="/register" className="hover:text-civic-700">Create citizen account</Link>
            <Link to="/citizen/login" className="hover:text-civic-700">Citizen sign in</Link>
            <Link to="/authority/request" className="hover:text-civic-700">Request authority access</Link>
            <Link to="/authority/login" className="hover:text-civic-700">Authority sign in</Link>
          </nav>
          <p className="text-xs text-slate-500 md:col-span-2">© {new Date().getFullYear()} CivicFix</p>
        </div>
      </footer>
    </>
  );
}
