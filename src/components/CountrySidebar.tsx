import React, { useState } from "react";
import type { Country } from "../types";

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

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 h-screen bg-[#F6FAFF] border-r border-[#DCEAFF] flex flex-col px-6 py-6">
      
      <h2 className="text-[#0F1A40] font-semibold text-2xl mb-1 tracking-wide">
        Ülke Listesi
      </h2>

      <p className="text-[#0F1A40] text-sm mb-5 leading-5 opacity-80">
        Notlarınızı ülke bazında filtreleyin.
      </p>

      <input
        placeholder="Ülke ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full px-4 py-2
          bg-white
          text-[#0F1A40]
          placeholder-[#0F1A40]/50
          rounded-xl
          border border-[#C8D8FF]
          shadow-sm
          focus:ring-2 focus:ring-[#AFC6FF]
          focus:border-[#AFC6FF]
          focus:outline-none
        "
      />

      <div className="mt-6 space-y-3 overflow-y-auto pr-1">
        {filteredCountries.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl
              transition-all text-left
              ${
                selected === c.id
                  ? "bg-[#EAF0FF] border border-[#B7C9FF] shadow-[0_0_10px_#DCE7FF]"
                  : "bg-white border border-[#D5E4FF] hover:bg-[#F1F5FF] hover:border-[#BCCFFF]"
              }
            `}
          >
            <span className="text-[#0F1A40] font-medium text-[15px]">
              {c.name}
            </span>

            <span
              className="
                text-[#0F1A40]
                bg-[#EAF0FF]
                border border-[#B7C9FF]
                rounded-full
                px-3 py-1
                text-sm
              "
            >
              {c.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CountrySidebar;
