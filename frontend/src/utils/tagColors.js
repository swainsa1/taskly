const FALLBACK = {
  base:   'bg-slate-100 text-slate-600 border-slate-300',
  active: 'bg-slate-500 text-white border-slate-500',
  badge:  'bg-slate-500 text-white',
};

// Single source of truth for all tag colours across the app.
// base   = unselected pill (form)
// active = selected pill (form)
// badge  = read-only chip (task card)
export const TAG_COLORS = {
  'Others':  {
    base:   'bg-slate-100 text-slate-600 border-slate-300',
    active: 'bg-slate-500 text-white border-slate-500',
    badge:  'bg-slate-400 text-white',
  },
  'School':  {
    base:   'bg-blue-100 text-blue-700 border-blue-300',
    active: 'bg-blue-500 text-white border-blue-500',
    badge:  'bg-blue-500 text-white',
  },
  'Home':    {
    base:   'bg-emerald-100 text-emerald-700 border-emerald-300',
    active: 'bg-emerald-500 text-white border-emerald-500',
    badge:  'bg-emerald-500 text-white',
  },
  'Sports':  {
    base:   'bg-orange-100 text-orange-700 border-orange-300',
    active: 'bg-orange-500 text-white border-orange-500',
    badge:  'bg-orange-500 text-white',
  },
  'Art':     {
    base:   'bg-purple-100 text-purple-700 border-purple-300',
    active: 'bg-purple-500 text-white border-purple-500',
    badge:  'bg-purple-500 text-white',
  },
  'Reading': {
    base:   'bg-amber-100 text-amber-700 border-amber-300',
    active: 'bg-amber-400 text-white border-amber-400',
    badge:  'bg-amber-400 text-white',
  },
  'Chores':  {
    base:   'bg-rose-100 text-rose-700 border-rose-300',
    active: 'bg-rose-500 text-white border-rose-500',
    badge:  'bg-rose-500 text-white',
  },
  'Fun':     {
    base:   'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300',
    active: 'bg-fuchsia-500 text-white border-fuchsia-500',
    badge:  'bg-fuchsia-500 text-white',
  },
};

export function tagPillClass(tag, selected) {
  const c = TAG_COLORS[tag] || FALLBACK;
  return selected ? c.active : c.base;
}

export function tagBadgeClass(tag) {
  return (TAG_COLORS[tag] || FALLBACK).badge;
}
