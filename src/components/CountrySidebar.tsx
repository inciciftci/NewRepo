import React, { useState } from "react";
import type { Country } from "../types";
import { displayCountryName } from "../utils/country-tr";

interface CountryWithCount extends Country {
  count: number;
}

interface Props {
  countries: CountryWithCount[];
  selected: number | undefined;
  setSelected: (id: number) => void;
}

const CountrySidebar: React.FC<Props> = ({ countries, selected, setSelected }) => {
  const [search, setSearch] = useState("");

  const filteredCountries = countries.filter((c) => {
    const displayName = displayCountryName(c.code, c.name);
    return displayName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <aside className="w-80 h-full bg-gradient-to-b from-white/80 to-slate-50/80 backdrop-blur-sm border-r border-slate-200/60 flex flex-col px-5 py-6">
      <h2 className="text-slate-900 font-bold text-xl mb-1 tracking-tight">
        Ülke Listesi
      </h2>

      <p className="text-slate-600 text-sm mb-5 leading-relaxed">
        Notlarınızı ülke bazında filtreleyin.
      </p>

      <div className="relative">
        <input
          placeholder="Ülke ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-full pl-4 pr-4 py-2.5
            bg-white/80
            text-slate-900
            placeholder-slate-400
            rounded-xl
            border border-slate-200/60
            shadow-sm
            focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40
            focus:bg-white
            focus:outline-none
            transition-all duration-200
            text-sm
          "
        />
      </div>

      <div className="mt-5 space-y-2 overflow-y-auto pr-1 flex-1">
        {filteredCountries.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl
              transition-all duration-200 ease-out text-left
              ${
                selected === c.id
                  ? "bg-white border border-cyan-400/40 shadow-md ring-2 ring-cyan-400/20"
                  : "bg-white/60 border border-slate-200/60 hover:bg-white hover:border-slate-300 hover:shadow-sm hover:-translate-y-[1px]"
              }
            `}
          >
            <span className={`font-medium text-sm ${selected === c.id ? "text-slate-900" : "text-slate-700"}`}>
              {displayCountryName(c.code, c.name)}
            </span>

            <span
              className={`
                rounded-full
                px-2.5 py-1
                text-xs font-semibold
                transition-colors duration-200
                ${
                  selected === c.id
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 border border-slate-200/60"
                }
              `}
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};

export default CountrySidebar;
