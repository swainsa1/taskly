// All class strings must be written out in full so Tailwind's JIT includes them.
const PALETTE = [
  { base: 'bg-blue-100 text-blue-700 border-blue-300',         active: 'bg-blue-500 text-white border-blue-500',         badge: 'bg-blue-500 text-white' },
  { base: 'bg-emerald-100 text-emerald-700 border-emerald-300', active: 'bg-emerald-500 text-white border-emerald-500',   badge: 'bg-emerald-500 text-white' },
  { base: 'bg-orange-100 text-orange-700 border-orange-300',   active: 'bg-orange-500 text-white border-orange-500',     badge: 'bg-orange-500 text-white' },
  { base: 'bg-purple-100 text-purple-700 border-purple-300',   active: 'bg-purple-500 text-white border-purple-500',     badge: 'bg-purple-500 text-white' },
  { base: 'bg-amber-100 text-amber-700 border-amber-300',      active: 'bg-amber-500 text-white border-amber-500',       badge: 'bg-amber-500 text-white' },
  { base: 'bg-rose-100 text-rose-700 border-rose-300',         active: 'bg-rose-500 text-white border-rose-500',         badge: 'bg-rose-500 text-white' },
  { base: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300', active: 'bg-fuchsia-500 text-white border-fuchsia-500',  badge: 'bg-fuchsia-500 text-white' },
  { base: 'bg-cyan-100 text-cyan-700 border-cyan-300',         active: 'bg-cyan-500 text-white border-cyan-500',         badge: 'bg-cyan-500 text-white' },
  { base: 'bg-teal-100 text-teal-700 border-teal-300',         active: 'bg-teal-500 text-white border-teal-500',         badge: 'bg-teal-500 text-white' },
  { base: 'bg-indigo-100 text-indigo-700 border-indigo-300',   active: 'bg-indigo-500 text-white border-indigo-500',     badge: 'bg-indigo-500 text-white' },
  { base: 'bg-lime-100 text-lime-700 border-lime-300',         active: 'bg-lime-600 text-white border-lime-600',         badge: 'bg-lime-600 text-white' },
  { base: 'bg-sky-100 text-sky-700 border-sky-300',            active: 'bg-sky-500 text-white border-sky-500',           badge: 'bg-sky-500 text-white' },
  { base: 'bg-pink-100 text-pink-700 border-pink-300',         active: 'bg-pink-500 text-white border-pink-500',         badge: 'bg-pink-500 text-white' },
  { base: 'bg-violet-100 text-violet-700 border-violet-300',   active: 'bg-violet-500 text-white border-violet-500',     badge: 'bg-violet-500 text-white' },
  { base: 'bg-green-100 text-green-700 border-green-300',      active: 'bg-green-500 text-white border-green-500',       badge: 'bg-green-500 text-white' },
  { base: 'bg-red-100 text-red-700 border-red-300',            active: 'bg-red-500 text-white border-red-500',           badge: 'bg-red-500 text-white' },
];

// Deterministic hash so the same tag name always gets the same colour.
function hashTag(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return h % PALETTE.length;
}

function getColors(tag) {
  return PALETTE[hashTag(tag)];
}

export function tagPillClass(tag, selected) {
  const c = getColors(tag);
  return selected ? c.active : c.base;
}

export function tagBadgeClass(tag) {
  return getColors(tag).badge;
}
